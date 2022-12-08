const fs = require('fs');
const path = require('path');
const dirTree = require('directory-tree');
const Asciidoctor = require('asciidoctor');

// Constants
const INPUT_FILE_EXT = '.adoc';
const OUTPUT_FILE_EXT = '.html';

// Globals
const asciidoctor = new Asciidoctor();
const rootDir = path.resolve('../');
const inputRoot = path.resolve(rootDir, 'notes');
const outputRoot = path.resolve(rootDir, 'build');

function collectInputFiles(treeEntry) {
  if (isAsciidocFile(treeEntry)) {
    return [treeEntry]
  }

  return treeEntry.children.flatMap(child => collectInputFiles(child));
}

function isAsciidocFile(treeEntry) {
  return !treeEntry.children && treeEntry.path.endsWith('.adoc')
}

function convertFile(inputFile){
  fs.readFile(inputFile.path, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    
    asciidoctor.convert(data, {to_file: getOutputFilename(inputFile), mkdirs: true, safe: 'unsafe'});
  });
}

function getOutputFilename(inputFile) {
  const absoluteInputPath = path.resolve(inputFile.path);
  const inputPathRelativeToInputRoot = path.relative(inputRoot, absoluteInputPath);
  const outputDirPath = path.dirname(path.resolve(outputRoot, inputPathRelativeToInputRoot));

  const outputFilename = path.basename(absoluteInputPath, INPUT_FILE_EXT) + OUTPUT_FILE_EXT;
  
  return path.resolve(outputDirPath, outputFilename);
}

function clean() {
  fs.rmdir(outputRoot, {recursive: true}, err => console.error(err));
}

function build() {
  const rootEntry = dirTree(inputRoot);
  collectInputFiles(rootEntry).forEach(convertFile);
}

function main() {
  clean();
  build();
}

main();
