const fs = require("fs");
const { execSync } = require("child_process");

const { createToken } = require("chevrotain");
const { CstParser } = require("chevrotain");
const { CandidLexer, CandidParser } = require("../src/parser"); // Replace with the path to the Candid lexer and parser files.
const { visitor } = require("../src/visitors/json");
// Read the Candid file content from disk.

const lexer = new CandidLexer();
const parser = new CandidParser();

function check(fn) {
  const inputDid = fs.readFileSync("./did/" + fn, "utf-8");
  const lexResult = lexer.tokenize(inputDid);
  parser.input = lexResult.tokens;
  console.log(`Generating ${fn}`);
  let cst = parser.candid();
  if (parser.errors.length > 0) {
    console.error(parser.errors);
  }
  const didjson = visitor.visit(cst);
  const rname = "./recreated/" + fn + ".json";
  fs.writeFileSync(rname, JSON.stringify(didjson, 0, null));
}

fs.readdir("./did", (error, files) => {
  if (error) console.log(error);
  else files.forEach((file) => check(file));
});
