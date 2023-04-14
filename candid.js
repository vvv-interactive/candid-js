const { createToken } = require("chevrotain");
const { CstParser, Lexer } = require("chevrotain");

// Define the Candid tokens for the lexer.
const Type = createToken({ name: "Type", pattern: /type/i });
const Record = createToken({ name: "Record", pattern: /record/i });
const Variant = createToken({ name: "Variant", pattern: /variant/i });
const Service = createToken({ name: "Service", pattern: /service/i });
const Query = createToken({ name: "Service", pattern: /query/i });

const Arrow = createToken({ name: "Arrow", pattern: /->/ });
const Equal = createToken({ name: "Equal", pattern: /=/ });

const Blob = createToken({ name: "Blob", pattern: /blob/i });
const Opt = createToken({ name: "Opt", pattern: /opt/i });
const Nat = createToken({ name: "Nat", pattern: /nat/i });
const Nat64 = createToken({ name: "Nat64", pattern: /nat64/i });
const Text = createToken({ name: "Text", pattern: /text/i });
const Vec = createToken({ name: "Vec", pattern: /vec/i });
const Principal = createToken({ name: "Principal", pattern: /principal/i });
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
  Query,
  Arrow,
  Blob,
  Opt,
  Nat64,
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

    this.RULE("recordType", () => {
      this.CONSUME(Record);
      this.CONSUME(LBrace);
      this.OPTION(() => {
        this.SUBRULE(this.field);
        this.MANY(() => {
          this.CONSUME(SemiColon);
          this.SUBRULE2(this.field);
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

    this.RULE("variant", () => {
      this.CONSUME(Identifier);
      this.OPTION(() => {
        this.CONSUME(LBracket);
        this.CONSUME(Nat);
        this.CONSUME(RBracket);
      });
      this.CONSUME(Colon);
      this.SUBRULE(this.type);
    });

    this.RULE("simpleType", () => {
      this.OR([
        { ALT: () => this.CONSUME(Nat) },
        { ALT: () => this.CONSUME(Nat64) },
        { ALT: () => this.CONSUME(Text) },
        { ALT: () => this.CONSUME(Principal) },
        { ALT: () => this.CONSUME(Blob) },
        { ALT: () => this.CONSUME(Identifier) },
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
        this.SUBRULE(this.type);
      });
      this.CONSUME(RParen);
      this.SUBRULE(this.arrow);
      this.CONSUME2(LParen);
      this.OPTION2(() => {
        this.SUBRULE2(this.type);
      });
      this.CONSUME2(RParen);
      this.OPTION3(() => {
        this.CONSUME3(Query);
      });
    });

    this.RULE("arrow", () => {
      this.CONSUME(Arrow); // Match the "->" symbol
    });

    this.RULE("serviceType", () => {
      this.CONSUME(Service);
      this.CONSUME(Colon);
      this.CONSUME(LParen);
      this.SUBRULE(this.type);
      this.CONSUME(RParen);
      this.CONSUME(Arrow);
      this.CONSUME(LBrace);
      this.OPTION(() => {
        this.SUBRULE(this.method);
        this.MANY(() => {
          this.CONSUME(SemiColon);
          this.SUBRULE2(this.method);
        });
        this.OPTION1(() => {
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
