const { CandidLexer, CandidParser } = require("./parser"); // Replace with the path to the Candid lexer and parser files.

let candidParser = new CandidParser();

const BaseVisitor = candidParser.getBaseCstVisitorConstructor();

class CandidAstBuilder extends BaseVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  candid(ctx) {
    const types = {};
    const methods = {};

    if (ctx.typeDef) {
      ctx.typeDef.forEach((typeDefCtx) => {
        const typeDef = this.visit(typeDefCtx);
        types[typeDef.name] = typeDef.type;
      });
    }

    if (ctx.serviceType) {
      const serviceType = this.visit(ctx.serviceType[0]);
      serviceType.methods.forEach((method) => {
        methods[method.name] = method;
      });
    }

    let args = this.visit(ctx.serviceType[0].children.typeList);
    return { types, service: { args, methods } };
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
    const fields = [];

    if (ctx.field) {
      for (const fieldCtx of ctx.field) {
        const field = this.visit(fieldCtx);
        fields.push(field);
      }
    }

    if (ctx.tupleField) {
      for (const tupleFieldCtx of ctx.tupleField) {
        const tupleField = this.visit(tupleFieldCtx);
        fields.push(tupleField);
      }
    }

    return {
      type: ctx.field ? "record" : "tuple",
      fields,
    };
  }

  field(ctx) {
    const name = ctx.Identifier[0].image;
    const type = this.visit(ctx.type[0]);
    return { name, type };
  }

  tupleField(ctx) {
    // const name = ctx.Identifier[0].image;
    const type = this.visit(ctx.type[0]);
    return { type };
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
    const fields = {};
    if (ctx.variant) {
      ctx.variant.forEach((variantCtx) => {
        const variant = this.visit(variantCtx);
        fields[variant.name] = variant.type;
      });
    }
    return { type: "variant", fields };
  }

  variant(ctx) {
    const name = ctx.Identifier[0].image;
    const type = ctx.type ? this.visit(ctx.type[0]) : null;
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

  visitAllTypes(ctx) {
    let type;

    if (ctx.simpleType) {
      type = this.visit(ctx.simpleType[0]);
    } else if (ctx.recordType) {
      type = this.visit(ctx.recordType[0]);
    } else if (ctx.variantType) {
      type = this.visit(ctx.variantType[0]);
    }

    return type;
  }

  optionalType(ctx) {
    let innerType = this.visitAllTypes(ctx);
    return { type: "opt", innerType };
  }
  functionTypeDecl(ctx) {
    let func = this.visit(ctx.functionType[0]);
    return { type: "func", func };
  }
  functionType(ctx) {
    const inputsCtx = ctx.typeList[0];
    const outputsCtx = ctx.typeList[1];
    const inputs = inputsCtx ? this.visit(inputsCtx) : [];
    const outputs = outputsCtx ? this.visit(outputsCtx) : [];
    const type = ctx.Query ? "query" : ctx.Oneway ? "oneway" : "update";

    return {
      inputs: inputs,
      outputs: outputs,
      type,
    };
  }

  arrow(ctx) {
    return "->";
  }

  tupleType(ctx) {
    const values = ctx.simpleType.map((child) => this.visit(child));
    return { type: "tuple", values };
  }

  serviceType(ctx) {
    const typeList = ctx.typeList ? this.visit(ctx.typeList) : [];
    const methods = ctx.method
      ? ctx.method.map((methodCtx) => this.visit(methodCtx))
      : [];

    return {
      inputs: typeList,
      methods: methods,
    };
  }

  method(ctx) {
    const methodName = ctx.Identifier[0].image;
    const funcType = this.visit(ctx.functionType);

    return {
      name: methodName,
      inputs: funcType.inputs,
      outputs: funcType.outputs,
      type: funcType.type,
    };
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
