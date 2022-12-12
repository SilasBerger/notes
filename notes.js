const fs = require('fs');
const process = require('process');
const path = require('path');

const dirTree = require('directory-tree');
const Asciidoctor = require('asciidoctor');
const express = require('express');
const HtmlParser = require('node-html-parser');

// Constants
const INPUT_FILE_EXT = '.adoc';
const OUTPUT_FILE_EXT = '.html';
const SERVE_PORT = 3000;

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
  fs.rmSync(outputRoot, {recursive: true, force: true});
}

function build() {
  const rootEntry = dirTree(inputRoot);
  collectInputFiles(rootEntry).forEach(convertFile);
}

function cleanAndBuild() {
  console.log('cleaning build directory...');
  clean();
  console.log('building...');
  build();
}

function watch() {
  fs.watch(inputRoot, {recursive: true}, () => {
    console.log('change detected, rebuilding...');
    cleanAndBuild();
  });
}

function buildAndWatch() {
  console.log('running first build...');
  cleanAndBuild();
  console.log('entering watch mode...');
  watch();
}

function serve() {
  build();

  const app = express()
  var expressWs = require('express-ws')(app);
  const liveReloadScript = fs.readFileSync('./livereload.js', {encoding:'utf8', flag:'r'});
  const webSockets = [];

  app.ws('/ws', websocket => {
    webSockets.push(websocket);
    websocket.send('ready');
  });

  fs.watch(inputRoot, {recursive: true}, () => {
    console.log('change detected, rebuilding...');
    cleanAndBuild();
    console.log(webSockets.length);
    webSockets.forEach(websocket => websocket.send('onchange'));
  });

  app.get('/*', (req, res) => {
    const filePath = path.resolve(outputRoot, path.relative('/', path.resolve(outputRoot, req.path)));
    const fileExists = fs.existsSync(filePath);
    if (!fileExists) {
      res.statusCode = 404;
      res.send('nope');
    }
    const fileContents = fs.readFileSync(filePath, {encoding:'utf8', flag:'r'});
    const html = HtmlParser.parse(fileContents);
    html.querySelector('head').appendChild(HtmlParser.parse(`<script>${liveReloadScript}</script>`));

    res.send(html.toString());
  });

  app.listen(SERVE_PORT, () => {
    console.log(`server running on port ${SERVE_PORT}...`);
  })
}

function main() {
  const runModes = {
    undefined: cleanAndBuild,
    '--watch': buildAndWatch,
    '--serve': serve,
  };
  const selectedMode = process.argv.find(option => ['--watch', '--serve'].includes(option));
  runModes[selectedMode]();
}

main();
