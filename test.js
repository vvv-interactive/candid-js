const fs = require("fs");

const { createToken } = require("chevrotain");
const { CstParser } = require("chevrotain");
const { CandidLexer, CandidParser } = require("./candid"); // Replace with the path to the Candid lexer and parser files.
const { visitor } = require("./visitor.js");
// Read the Candid file content from disk.
const candidExample = fs.readFileSync("governance.did", "utf8");

const lexer = new CandidLexer();
const parser = new CandidParser();

const lexResult = lexer.tokenize(candidExample);
parser.input = lexResult.tokens;

let cst = parser.candid();
if (parser.errors.length > 0) {
  console.error(parser.errors);
}

const ast = visitor.visit(cst);

console.log(JSON.stringify(ast));
