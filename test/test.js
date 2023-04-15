const fs = require("fs");

const { createToken } = require("chevrotain");
const { CstParser } = require("chevrotain");
const { CandidLexer, CandidParser } = require("../src/parser"); // Replace with the path to the Candid lexer and parser files.
const { visitor } = require("../src/visitor");
// Read the Candid file content from disk.
const candidExample = fs.readFileSync("complex.did", "utf8");

const lexer = new CandidLexer();
const parser = new CandidParser();

const lexResult = lexer.tokenize(candidExample);
parser.input = lexResult.tokens;

let cst = parser.candid();
if (parser.errors.length > 0) {
  console.error(parser.errors);
}

const ast = visitor.visit(cst);

console.log(JSON.stringify(ast, null, 2));
