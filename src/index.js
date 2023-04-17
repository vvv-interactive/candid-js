const { CandidLexer, CandidParser } = require("./parser"); // Replace with the path to the Candid lexer and parser files.

const vis_candid = require("./visitors/candid");
const vis_json = require("./visitors/json");
const vis_azle = require("./visitors/azle");

const lexer = new CandidLexer();
const parser = new CandidParser();

function transpile(inputDid, vis) {
  let visitor;
  switch (vis) {
    case "azle":
      visitor = vis_azle.visitor;
      break;
    case "candid":
      visitor = vis_candid.visitor;
      break;
    case "json":
      visitor = vis_json.visitor;
      break;
    default:
      visitor = vis_json.visitor;
  }
  const lexResult = lexer.tokenize(inputDid);
  parser.input = lexResult.tokens;
  let cst = parser.candid();
  if (parser.errors.length > 0) {
    throw parser.errors;
  }

  return visitor.visit(cst);
}

module.exports = { transpile };
