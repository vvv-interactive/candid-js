const { CandidLexer, CandidParser } = require("../parser"); // Replace with the path to the Candid lexer and parser files.

let candidParser = new CandidParser();

const BaseVisitor = candidParser.getBaseCstVisitorConstructor();

class CandidAstBuilder extends BaseVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  candid(ctx) {
    let t = "";

    t += ctx.typeDef.map((x) => this.visit(x)).join("");

    if (ctx.serviceActor) t += this.visit(ctx.serviceActor[0]);

    return t;
  }

  typeDef(ctx) {
    const name = this.visit(ctx.identifier[0]);
    const type = this.visit(ctx.type[0]);
    return `type ${name} = ${type};\n`;
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
      return `record {${fields.join("; \n")}}`;
    }

    if (ctx.tupleField) {
      for (const tupleFieldCtx of ctx.tupleField) {
        const tupleField = this.visit(tupleFieldCtx);
        fields.push(tupleField);
      }
      return `record {${fields.join("; \n")}}`;
    }

    return `record {}`;
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
    return `variant {${ctx.variant.map((x) => this.visit(x)).join("; \n")}}`;
  }

  identifier(ctx) {
    if (ctx.Identifier) return ctx.Identifier[0].image;
    else if (ctx.QuotedIdentifier) return ctx.QuotedIdentifier[0].image;
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
    return `vec ${this.visitAllTypes(ctx)}`;
  }

  optionalType(ctx) {
    return `opt ${this.visitAllTypes(ctx)}`;
  }
  functionTypeDecl(ctx) {
    return `func ${this.visit(ctx.functionType[0])}`;
  }

  functionType(ctx) {
    const inputs = ctx.typeList[0] ? this.visit(ctx.typeList[0]) : "";
    const outputs = ctx.typeList[1] ? this.visit(ctx.typeList[1]) : "";
    const type = ctx.Query ? "query" : ctx.Oneway ? "oneway" : "";

    return `(${inputs}) -> (${outputs}) ${type}`;
  }
  serviceActor(ctx) {
    const arg = ctx.typeList ? this.visit(ctx.typeList) : "";
    const id = ctx.identifier ? this.visit(ctx.identifier[0]) || "" : "";

    return `service ${id}: (${arg}) -> 
      ${
        ctx.serviceTypeIdentifier
          ? this.visit(ctx.serviceTypeIdentifier[0])
          : this.visit(ctx.serviceDeclr[0])
      }
    `;
  }
  serviceTypeIdentifier(ctx) {
    return this.visit(ctx.identifier[0]);
  }

  serviceType(ctx) {
    return `service 
      ${this.visit(ctx.serviceDeclr[0])}
    `;
  }
  serviceDeclr(ctx) {
    const methods = ctx.method
      ? ctx.method.map((methodCtx) => this.visit(methodCtx))
      : [];

    return `{
      ${methods.join(";\n")}
    }`;
  }

  method(ctx) {
    const methodName = this.visit(ctx.identifier[0]);

    if (ctx.functionType) {
      const funcType = this.visit(ctx.functionType);
      return `${methodName} : ${funcType}`;
    } else {
      return `${methodName} : ${this.visit(ctx.identifier[1])}`;
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
        } else if (child.hasOwnProperty("image")) return child.image;
      }
    }
    return null;
  }
}

const visitor = new CandidAstBuilder();

module.exports = {
  visitor,
};
