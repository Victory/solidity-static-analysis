'use strict';

const fs = require('fs');
const StaticAnalysis = require('./staticAnalysis.js');
const commandLineArgs = require('command-line-args')
const path = require("path");

const optionDefinitions = [
  { name: 'directory', alias: 'd', type: String, multiple: false, defaultOption: false},
  { name: 'src', alias: 's', type: String, multiple: true, defaultOption: true },
]

const options = commandLineArgs(optionDefinitions);

if (options.directory === undefined && options.src === undefined) {
  options.directory = "./contracts";
}

var files = [];

if (options.directory !== undefined) {
  const solDirectory = path.resolve(options.directory);
  console.log("Running status analysis on .sol files in directory: \n\t " + solDirectory);
  var dirs = fs.readdirSync(solDirectory).filter(f => { return f.endsWith(".sol") });
  dirs.forEach(contract => {
    var contractPath = path.join(solDirectory, contract);
    files.push(contractPath);
  });
}

if (options.src !== undefined) {
  options.src.forEach(contract => {
    files.push(path.resolve(path.join("./", contract)));
  });
}

if (files.length === 0) {
  console.error("No input files given");
  return;
}

files.forEach(solFile => {
  var contents = fs.readFileSync(solFile, 'utf8').toString();

  const staticAnalysis = new StaticAnalysis((warnings) => {
    console.log(JSON.stringify(warnings, null, 2));
  });

  console.log("Running static analysis on: " + solFile);
  var toCompile = {};
  toCompile[solFile] = contents;
  staticAnalysis.compiler.compile(toCompile, solFile.toString());
});
