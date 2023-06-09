const fs = require("fs");
const { execSync } = require("child_process");

const { createToken } = require("chevrotain");
const { CstParser } = require("chevrotain");
const { CandidLexer, CandidParser } = require("../src/parser"); // Replace with the path to the Candid lexer and parser files.
const { visitor } = require("../src/visitors/candid");
// Read the Candid file content from disk.

const lexer = new CandidLexer();
const parser = new CandidParser();

function check(fn) {
  const inputDid = fs.readFileSync("./did/" + fn, "utf-8");
  const lexResult = lexer.tokenize(inputDid);
  parser.input = lexResult.tokens;
  console.log(`Checking ${fn}`);
  let cst = parser.candid();
  if (parser.errors.length > 0) {
    console.error(parser.errors);
  }
  const didtext = visitor.visit(cst);
  const rname = "./recreated/" + fn;
  fs.writeFileSync(rname, didtext);

  try {
    let stdout = execSync("didc check " + rname);
    console.log(`OK ${stdout}`);
  } catch (e) {
    console.log("ERR:", e);
  }
}

fs.readdir("./did", (error, files) => {
  if (error) console.log(error);
  else files.forEach((file) => check(file));
});
