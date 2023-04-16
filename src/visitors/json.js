const { CandidLexer, CandidParser } = require("../parser"); // Replace with the path to the Candid lexer and parser files.

let candidParser = new CandidParser();

const BaseVisitor = candidParser.getBaseCstVisitorConstructor();

class CandidAstBuilder extends BaseVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  candid(ctx) {
    return {
      types: ctx.typeDef.map((x) => this.visit(x)),
      service: ctx.serviceActor ? this.visit(ctx.serviceActor[0]) : undefined,
    };
  }

  typeDef(ctx) {
    const name = this.visit(ctx.identifier[0]);
    const type = this.visit(ctx.type[0]);
    return { type, name };
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
      return { type: "record", fields };
    }

    if (ctx.tupleField) {
      for (const tupleFieldCtx of ctx.tupleField) {
        const tupleField = this.visit(tupleFieldCtx);
        fields.push(tupleField);
      }
      return { type: "tuple", fields };
    }

    return { type: "record", fields }; // empty records
  }

  field(ctx) {
    const name = this.visit(ctx.identifier[0]);
    const type = this.visit(ctx.type[0]);
    return { type, name };
  }

  tupleField(ctx) {
    if (ctx.IdentifierNumber) {
      return {
        id: ctx.IdentifierNumber[0].image,
        type: this.visit(ctx.type[0]),
      };
    } else {
      return { type: this.visit(ctx.type[0]) };
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
    return { type: "variant", fields: ctx.variant.map((x) => this.visit(x)) };
  }

  identifier(ctx) {
    if (ctx.Identifier) return ctx.Identifier[0].image;
    else if (ctx.QuotedIdentifier) return ctx.QuotedIdentifier[0].image;
  }

  variant(ctx) {
    const name = this.visit(ctx.identifier[0]);
    const type = ctx.type ? this.visit(ctx.type[0]) : undefined;
    return { type, name };
  }

  simpleType(ctx) {
    return this.visitSingle(ctx);
  }

  vecType(ctx) {
    // const type = this.visit(ctx.type[0]);
    return { type: "vec", inner: this.visitAllTypes(ctx) };
  }

  optionalType(ctx) {
    return { type: "opt", inner: this.visitAllTypes(ctx) };
  }
  functionTypeDecl(ctx) {
    return { type: "func", inner: this.visit(ctx.functionType[0]) };
  }

  functionType(ctx) {
    const inputs = ctx.typeList[0] ? this.visit(ctx.typeList[0]) : [];
    const outputs = ctx.typeList[1] ? this.visit(ctx.typeList[1]) : [];
    const type = ctx.Query ? "query" : ctx.Oneway ? "oneway" : undefined;

    return { inputs, outputs, type };
  }
  serviceActor(ctx) {
    const arg = ctx.typeList ? this.visit(ctx.typeList) : [];
    const id = ctx.identifier
      ? this.visit(ctx.identifier[0]) || undefined
      : undefined;

    return {
      type: "service",
      id,
      arg,
      inner: ctx.serviceTypeIdentifier
        ? this.visit(ctx.serviceTypeIdentifier[0])
        : this.visit(ctx.serviceDeclr[0]),
    };
  }
  serviceTypeIdentifier(ctx) {
    return this.visit(ctx.identifier[0]);
  }

  serviceType(ctx) {
    return { type: "service", inner: this.visit(ctx.serviceDeclr[0]) };
  }
  serviceDeclr(ctx) {
    const methods = ctx.method
      ? ctx.method.map((methodCtx) => this.visit(methodCtx))
      : [];

    return methods;
  }

  method(ctx) {
    const name = this.visit(ctx.identifier[0]);

    if (ctx.functionType) {
      const func = this.visit(ctx.functionType);
      return { name, func };
    } else {
      return { name, func: this.visit(ctx.identifier[1]) };
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
