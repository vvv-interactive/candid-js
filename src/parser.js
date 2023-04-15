const { createToken } = require("chevrotain");
const { CstParser, Lexer } = require("chevrotain");

// Define the Candid tokens for the lexer.
const Type = createToken({ name: "Type", pattern: /\btype\b/i });
const Record = createToken({ name: "Record", pattern: /\brecord\b/i });
const Variant = createToken({ name: "Variant", pattern: /\bvariant\b/i });
const Service = createToken({ name: "Service", pattern: /\bservice\b/i });
const Query = createToken({ name: "Query", pattern: /\bquery\b/i });
const Oneway = createToken({ name: "Oneway", pattern: /\oneway\b/i });
const Func = createToken({ name: "Func", pattern: /\bfunc\b/i });

const Principal = createToken({ name: "Principal", pattern: /\bprincipal\b/i });

const Arrow = createToken({ name: "Arrow", pattern: /->/ });
const Equal = createToken({ name: "Equal", pattern: /=/ });

const Blob = createToken({ name: "Blob", pattern: /\bblob\b/i });
const Opt = createToken({ name: "Opt", pattern: /\bopt\b/i });

const Nat = createToken({ name: "Nat", pattern: /\bnat\b/i });
const Nat8 = createToken({ name: "Nat8", pattern: /\bnat8\b/i });
const Nat16 = createToken({ name: "Nat16", pattern: /\bnat16\b/i });
const Nat32 = createToken({ name: "Nat32", pattern: /\bnat32\b/i });
const Nat64 = createToken({ name: "Nat64", pattern: /\bnat64\b/i });

const Int = createToken({ name: "Int", pattern: /\bint\b/i });
const Int8 = createToken({ name: "Int8", pattern: /\bint8\b/i });
const Int16 = createToken({ name: "Int16", pattern: /\bint16\b/i });
const Int32 = createToken({ name: "Int32", pattern: /\bint32\b/i });
const Int64 = createToken({ name: "Int64", pattern: /\bint64\b/i });

const Float32 = createToken({ name: "Float32", pattern: /\bfloat32\b/i });
const Float64 = createToken({ name: "Float64", pattern: /\bfloat64\b/i });

const Bool = createToken({ name: "Bool", pattern: /\bbool\b/i });

const Null = createToken({ name: "Null", pattern: /\bnull\b/i });
const Reserved = createToken({ name: "Reserved", pattern: /\breserved\b/i });
const Empty = createToken({ name: "Empty", pattern: /\bempty\b/i });

const Text = createToken({ name: "Text", pattern: /\btext\b/i });
const Vec = createToken({ name: "Vec", pattern: /\bvec\b/i });
const SemiColon = createToken({ name: "SemiColon", pattern: /;/ });
const Colon = createToken({ name: "Colon", pattern: /:/ });
const LBrace = createToken({ name: "LBrace", pattern: /{/ });
const RBrace = createToken({ name: "RBrace", pattern: /}/ });
const LBracket = createToken({ name: "LBracket", pattern: /\[/ });
const RBracket = createToken({ name: "RBracket", pattern: /]/ });
const LParen = createToken({ name: "LParen", pattern: /\(/ });
const RParen = createToken({ name: "RParen", pattern: /\)/ });
const Comma = createToken({ name: "Comma", pattern: /,/ });
const Comment = createToken({
  name: "Comment",
  pattern: /\/\/.*(\r?\n)?/,
  group: Lexer.SKIPPED,
});
const Identifier = createToken({
  name: "Identifier",
  pattern: /[a-zA-Z_]\w*/,
});
const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

// Define the line break token.
const LineBreak = createToken({
  name: "LineBreak",
  pattern: /\r?\n/,
  group: Lexer.SKIPPED,
});

const tokensDictionary = [
  WhiteSpace,
  Comment,
  Type,
  Record,
  Variant,
  Service,
  Func,
  Query,
  Oneway,
  Arrow,
  Blob,
  Opt,
  Nat8,
  Nat16,
  Nat32,
  Nat64,
  Int8,
  Int16,
  Int32,
  Int64,
  Int,
  Float32,
  Float64,
  Null,
  Reserved,
  Empty,
  Bool,
  Nat,
  Text,
  Vec,
  Principal,
  SemiColon,
  Colon,
  LBrace,
  RBrace,
  LBracket,
  RBracket,
  LParen,
  RParen,
  Comma,
  Identifier,
  LineBreak,
  Equal,
];
// Define the Candid lexer.
class CandidLexer extends Lexer {
  constructor() {
    super(tokensDictionary);
  }
}

// Define the Candid parser using the CstParser.
class CandidParser extends CstParser {
  constructor() {
    super(tokensDictionary);
    // Rules

    this.RULE("typeDef", () => {
      this.CONSUME(Type);
      this.CONSUME(Identifier);
      this.CONSUME(Equal);
      this.SUBRULE(this.type);
      this.CONSUME(SemiColon);
    });

    this.RULE("candid", () => {
      this.MANY(() => {
        this.OR([
          { ALT: () => this.SUBRULE(this.typeDef) },
          { ALT: () => this.SUBRULE(this.serviceType) },
        ]);
        this.OPTION1(() => {
          this.CONSUME(SemiColon);
        });
      });
    });

    this.RULE("type", () => {
      this.OR([
        { ALT: () => this.SUBRULE(this.recordType) },
        { ALT: () => this.SUBRULE(this.variantType) },
        { ALT: () => this.SUBRULE(this.simpleType) },
      ]);
    });
    this.RULE("tupleField", () => {
      this.SUBRULE(this.type);
    });
    this.RULE("recordType", () => {
      this.CONSUME(Record);
      this.CONSUME(LBrace);
      this.OPTION(() => {
        this.OR1([
          { ALT: () => this.SUBRULE(this.field) },
          { ALT: () => this.SUBRULE(this.tupleField) },
        ]);
        this.MANY(() => {
          this.CONSUME(SemiColon);
          this.OR2([
            { ALT: () => this.SUBRULE2(this.field) },
            { ALT: () => this.SUBRULE2(this.tupleField) },
          ]);
        });
        this.OPTION1(() => {
          this.CONSUME2(SemiColon);
        });
      });
      this.CONSUME(RBrace);
    });

    this.RULE("field", () => {
      this.CONSUME(Identifier);
      this.CONSUME(Colon);
      this.SUBRULE(this.type);
    });

    this.RULE("functionTypeDecl", () => {
      this.CONSUME(Func);
      this.SUBRULE(this.functionType);
    });

    this.RULE("variantType", () => {
      this.CONSUME(Variant);
      this.CONSUME(LBrace);
      this.OPTION(() => {
        this.SUBRULE(this.variant);
        this.MANY(() => {
          this.CONSUME(SemiColon);
          this.SUBRULE2(this.variant);
        });
        this.OPTION1(() => {
          this.CONSUME2(SemiColon);
        });
      });
      this.CONSUME(RBrace);
    });

    this.RULE("typeList", () => {
      this.SUBRULE(this.type);
      this.MANY(() => {
        this.CONSUME(Comma);
        this.SUBRULE2(this.type);
      });
      this.OPTION(() => {
        // Add this block to make the trailing comma optional
        this.CONSUME2(Comma);
      });
    });

    this.RULE("variant", () => {
      this.CONSUME(Identifier);
      this.OPTION(() => {
        this.CONSUME(LBracket);
        this.CONSUME(Nat);
        this.CONSUME(RBracket);
      });
      this.OPTION2(() => {
        this.CONSUME(Colon);
        this.SUBRULE(this.type);
      });
    });

    this.RULE("simpleType", () => {
      this.OR([
        { ALT: () => this.CONSUME(Nat) },
        { ALT: () => this.CONSUME(Nat8) },
        { ALT: () => this.CONSUME(Nat16) },
        { ALT: () => this.CONSUME(Nat32) },
        { ALT: () => this.CONSUME(Nat64) },
        { ALT: () => this.CONSUME(Float32) },
        { ALT: () => this.CONSUME(Float64) },
        { ALT: () => this.CONSUME(Int) },
        { ALT: () => this.CONSUME(Int8) },
        { ALT: () => this.CONSUME(Int16) },
        { ALT: () => this.CONSUME(Int32) },
        { ALT: () => this.CONSUME(Int64) },
        { ALT: () => this.CONSUME(Bool) },
        { ALT: () => this.CONSUME(Null) },
        { ALT: () => this.CONSUME(Reserved) },
        { ALT: () => this.CONSUME(Empty) },
        { ALT: () => this.CONSUME(Text) },
        { ALT: () => this.CONSUME(Principal) },
        { ALT: () => this.CONSUME(Blob) },
        { ALT: () => this.CONSUME(Identifier) },
        { ALT: () => this.SUBRULE(this.functionTypeDecl) },
        { ALT: () => this.SUBRULE(this.optionalType) },
        { ALT: () => this.SUBRULE(this.vecType) },
      ]);
    });

    this.RULE("vecType", () => {
      this.CONSUME(Vec);
      this.OPTION(() => {
        this.CONSUME(WhiteSpace);
      });
      this.SUBRULE(this.type);
    });

    this.RULE("optionalType", () => {
      this.CONSUME(Opt);
      this.OPTION(() => {
        this.CONSUME(WhiteSpace);
      });
      this.OR([
        { ALT: () => this.SUBRULE(this.simpleType) },
        { ALT: () => this.SUBRULE(this.recordType) },
        { ALT: () => this.SUBRULE(this.variantType) },
      ]);
    });
    this.RULE("functionType", () => {
      this.CONSUME(LParen);
      this.OPTION(() => {
        this.SUBRULE(this.typeList);
      });
      this.CONSUME(RParen);
      this.SUBRULE(this.arrow);
      this.CONSUME2(LParen);
      this.OPTION2(() => {
        this.SUBRULE2(this.typeList);
      });
      this.CONSUME2(RParen);
      this.OPTION3(() => {
        this.OR([
          { ALT: () => this.CONSUME(Query) },
          { ALT: () => this.CONSUME(Oneway) },
        ]);
      });
    });

    this.RULE("arrow", () => {
      this.CONSUME(Arrow); // Match the "->" symbol
    });

    this.RULE("serviceType", () => {
      this.CONSUME(Service);
      this.CONSUME(Colon);
      this.CONSUME(LParen);
      this.OPTION(() => {
        this.SUBRULE(this.typeList);
      });
      this.CONSUME(RParen);
      this.CONSUME(Arrow);
      this.CONSUME(LBrace);
      this.OPTION1(() => {
        this.SUBRULE(this.method);
        this.MANY(() => {
          this.CONSUME(SemiColon);
          this.SUBRULE2(this.method);
        });
        this.OPTION2(() => {
          this.CONSUME2(SemiColon);
        });
      });
      this.CONSUME(RBrace);
    });

    this.RULE("method", () => {
      this.CONSUME(Identifier); // Match method name
      this.CONSUME(Colon);
      this.SUBRULE(this.functionType);
    });

    this.performSelfAnalysis();
  }
}
// Export the Candid tokens and parser.
module.exports = {
  CandidLexer,
  CandidParser,
};
