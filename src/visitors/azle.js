const { CandidLexer, CandidParser } = require("../parser"); // Replace with the path to the Candid lexer and parser files.

let candidParser = new CandidParser();

const BaseVisitor = candidParser.getBaseCstVisitorConstructor();
const TYPE_SUBSTITUTION = {
  principal: "Principal",
};

const TT = (x) => (TYPE_SUBSTITUTION[x] ? TYPE_SUBSTITUTION[x] : x);

class CandidAstBuilder extends BaseVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  candid(ctx) {
    let t = `
    import {
      CallResult,
      Variant,
      Opt,
      Record,
      Service,
      Func,
      Query,
      Update,
      serviceQuery,
      serviceUpdate,
      Vec,
      nat,
      nat8,
      nat16,
      nat32,
      nat64,
      int,
      int8,
      int16,
      int32,
      int64,
      float32,
      float64,
      blob,
      Principal,
      Tuple
    } from "azle";
    `;

    t += ctx.typeDef.map((x) => this.visit(x)).join("");

    if (ctx.serviceActor) t += this.visit(ctx.serviceActor[0]);

    return t;
  }

  typeDef(ctx) {
    const name = this.visit(ctx.identifier[0]);
    const type = this.visit(ctx.type[0]);
    return `export type ${name} = ${type};\n`;
  }

  type(ctx) {
    return this.visitSingle(ctx);
  }

  recordType(ctx) {
    const fields = [];

    if (ctx.field) {
      for (const fieldCtx of ctx.field) {
        const field = this.visit(fieldCtx);
        fields.push(field);
      }
      return `Record<{${fields.join("; \n")}}>`;
    }

    if (ctx.tupleField) {
      for (const tupleFieldCtx of ctx.tupleField) {
        const tupleField = this.visit(tupleFieldCtx);
        fields.push(tupleField);
      }
      return `Tuple<{${fields.join("; \n")}}>`;
    }

    return `Record<{}>`;
  }

  field(ctx) {
    const name = this.visit(ctx.identifier[0]);
    const type = this.visit(ctx.type[0]);
    return `${name} : ${type}`;
  }

  tupleField(ctx) {
    if (ctx.IdentifierNumber) {
      return `${ctx.IdentifierNumber[0].image} : ${this.visit(ctx.type[0])}`;
    } else {
      return this.visit(ctx.type[0]);
    }
  }

  typeList(ctx) {
    const types = [];

    // First type
    if (ctx.type) {
      types.push(this.visit(ctx.type[0]));
    }

    // Remaining types
    if (ctx.type2) {
      ctx.type2.forEach((typeCtx, index) => {
        types.push(this.visit(typeCtx));
      });
    }

    return types;
  }

  variantType(ctx) {
    return `Variant<{${ctx.variant.map((x) => this.visit(x)).join("; \n")}}>`;
  }

  identifier(ctx) {
    if (ctx.Identifier) {
      return ctx.Identifier[0].image;
    } else if (ctx.QuotedIdentifier) return ctx.QuotedIdentifier[0].image;
  }

  variant(ctx) {
    const name = this.visit(ctx.identifier[0]);
    const type = ctx.type ? this.visit(ctx.type[0]) : null;
    return `${name} : ${type}`;
  }

  simpleType(ctx) {
    return this.visitSingle(ctx);
  }

  vecType(ctx) {
    // const type = this.visit(ctx.type[0]);
    return `Vec<${this.visitAllTypes(ctx)}>`;
  }

  optionalType(ctx) {
    return `Opt<${this.visitAllTypes(ctx)}>`;
  }
  functionTypeDecl(ctx) {
    let x = this.visit(ctx.functionType[0]);
    console.log(x);
    return `Func<${x.type || "Update"}<(${x.inputs
      .map((a, idx) => `arg${idx}: ${a}`)
      .join(",")}) => ${x.outputs[0] || "void"}>>`;
  }

  functionType(ctx) {
    const inputs = ctx.typeList[0] ? this.visit(ctx.typeList[0]) : "";
    const outputs = ctx.typeList[1] ? this.visit(ctx.typeList[1]) : "";
    const type = ctx.Query ? "Query" : ctx.Oneway ? "Oneway" : "Update";

    return { type, inputs, outputs };
  }

  serviceActor(ctx) {
    const arg = ctx.typeList ? this.visit(ctx.typeList) : "";
    const id = ctx.identifier ? this.visit(ctx.identifier[0]) || "" : "";

    if (ctx.serviceTypeIdentifier)
      return `export class ${id || "Canister"} extends ${this.visit(
        ctx.serviceTypeIdentifier[0]
      )};\n`;

    // console.log(JSON.stringify(ctx, 0, null));

    let methods = this.visit(ctx.serviceDeclr[0]);
    let r = `export class ${id || "Canister"} extends Service {

      ${methods
        .map((x) =>
          typeof x.func === "string"
            ? `${x.name}:${x.func};\n`
            : `@service${x.func.type}\n${x.name}: (${
                x.func.inputs ? x.func.inputs.join(", ") : ""
              }) => CallResult<${
                x.func.outputs ? x.func.outputs[0] : "void"
              }>;\n`
        )
        .join("\n")}
    }
    `;
    // console.log(JSON.stringify(methods, 0, null));
    // throw "";

    return r;
  }

  serviceTypeIdentifier(ctx) {
    return this.visit(ctx.identifier[0]);
  }

  serviceType(ctx) {
    return this.visit(ctx.serviceDeclr[0]);
  }

  serviceDeclr(ctx) {
    const methods = ctx.method
      ? ctx.method.map((methodCtx) => this.visit(methodCtx))
      : [];

    return methods;
  }

  method(ctx) {
    const methodName = this.visit(ctx.identifier[0]);

    if (ctx.functionType) {
      const funcType = this.visit(ctx.functionType);
      return { name: methodName, func: funcType };
    } else {
      return { name: methodName, func: this.visit(ctx.identifier[1]) };
    }
  }

  visitAllTypes(ctx) {
    if (ctx.simpleType) {
      return this.visit(ctx.simpleType[0]);
    } else if (ctx.recordType) {
      return this.visit(ctx.recordType[0]);
    } else if (ctx.variantType) {
      return this.visit(ctx.variantType[0]);
    } else {
      return this.visit(ctx.type[0]);
    }
  }

  // Helper method to handle OR scenarios
  visitSingle(ctx) {
    for (const key in ctx) {
      if (ctx[key] && Array.isArray(ctx[key])) {
        const child = ctx[key][0];
        if (child.hasOwnProperty("name")) {
          return this.visit(child);
        } else if (child.hasOwnProperty("image")) return TT(child.image);
      }
    }
    return null;
  }
}

const visitor = new CandidAstBuilder();

module.exports = {
  visitor,
};
