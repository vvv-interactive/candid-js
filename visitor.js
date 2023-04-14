const { CandidLexer, CandidParser } = require("./candid"); // Replace with the path to the Candid lexer and parser files.

let candidParser = new CandidParser();

const BaseVisitor = candidParser.getBaseCstVisitorConstructor();

class CandidAstBuilder extends BaseVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  candid(ctx) {
    const types = {};
    const services = {};

    if (ctx.typeDef) {
      ctx.typeDef.forEach((typeDefCtx) => {
        const typeDef = this.visit(typeDefCtx);
        types[typeDef.name] = typeDef.type;
      });
    }

    if (ctx.serviceType) {
      const serviceType = this.visit(ctx.serviceType[0]);
      serviceType.methods.forEach((method) => {
        services[method.name] = { input: method.input, output: method.output };
      });
    }

    return { types, services };
  }

  typeDef(ctx) {
    const name = ctx.Identifier[0].image;
    const type = this.visit(ctx.type[0]);
    return { name, type };
  }

  type(ctx) {
    return this.visitSingle(ctx);
  }

  recordType(ctx) {
    const properties = {};
    if (ctx.field) {
      ctx.field.forEach((fieldCtx) => {
        const field = this.visit(fieldCtx);
        properties[field.name] = field.type;
      });
    }
    return { type: "record", properties };
  }

  field(ctx) {
    const name = ctx.Identifier[0].image;
    const type = this.visit(ctx.type[0]);
    return { name, type };
  }

  variantType(ctx) {
    const properties = {};
    if (ctx.variant) {
      ctx.variant.forEach((variantCtx) => {
        const variant = this.visit(variantCtx);
        properties[variant.name] = variant.type;
      });
    }
    return { type: "variant", properties };
  }

  variant(ctx) {
    const name = ctx.Identifier[0].image;
    const type = this.visit(ctx.type[0]);
    return { name, type };
  }

  simpleType(ctx) {
    const simpleType = this.visitSingle(ctx);
    return simpleType;
  }

  vecType(ctx) {
    const type = this.visit(ctx.type[0]);
    return { type: "vec", innerType: type };
  }

  optionalType(ctx) {
    const type = this.visitSingle(ctx);
    return { optional: true, type };
  }

  functionType(ctx) {
    const input = this.visit(ctx.type[0]);
    const output = this.visit(ctx.type[1]);
    return { input, output };
  }

  arrow(ctx) {
    return "->";
  }

  serviceType(ctx) {
    const methods = [];
    if (ctx.method) {
      ctx.method.forEach((methodCtx) => {
        methods.push(this.visit(methodCtx));
      });
    }
    return { methods };
  }

  method(ctx) {
    const name = ctx.Identifier[0].image;
    const { input, output } = this.visit(ctx.functionType[0]);
    return { name, input, output };
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
