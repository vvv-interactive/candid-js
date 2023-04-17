#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { transpile } = require("./src/index");

const [, , filePath, vis] = process.argv;

if (!filePath) {
  console.error("Error: Please provide a file path.");
  process.exit(1);
}

const absoluteFilePath = path.resolve(process.cwd(), filePath);
const inputText = fs.readFileSync(absoluteFilePath, "utf-8");

const output = transpile(inputText, vis);
if (typeof output === "string") console.log(output);
else console.log(JSON.stringify(output, 0, null));
