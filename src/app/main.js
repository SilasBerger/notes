const process = require('process');
const fs = require('fs');
const path = require('path');
const {AdocBuilder} = require('./adoc-builder');
const {LiveServer} = require('./live-server');

const SERVE_PORT = 3000;

const rootDir = path.resolve('../');
const inputRoot = path.resolve(rootDir, 'notes');
const outputRoot = path.resolve(rootDir, 'build');
const adocBuilder = new AdocBuilder(inputRoot, outputRoot);

function cleanAndBuild() {
  console.log('building...');
  adocBuilder.cleanAndBuild();
}

function buildAndWatch() {
  runInitialBuild();
  rebuildOnInputChanges();
}

function serve() {
  runInitialBuild();

  console.log('launching server');
  const server = new LiveServer(outputRoot, SERVE_PORT, () => adocBuilder.createIndexPage());
  server.launch(() => console.log(`server running on port ${SERVE_PORT}`));

  rebuildOnInputChanges(() => {
    console.log('notifying clients after rebuild...');
    server.notifyChanges();
  });
}

function runInitialBuild() {
  console.log('initial build...');
  adocBuilder.cleanAndBuild();
}

function rebuildOnInputChanges(onRebuild) {
  console.log('watching for file changes...');
  watchInputFileChanges(() => {
    console.log('change detected, rebuilding...');
    adocBuilder.cleanAndBuild();
    if (onRebuild) {
      onRebuild();
    }
  });
}

function watchInputFileChanges(callback) {
  fs.watch(inputRoot, {recursive: true}, callback);
}

function main() {
  const runModeHandlers = {
    'build': () => cleanAndBuild(),
    'watch': () => buildAndWatch(),
    'serve': () => serve(),
  };
  const selectedRunMode = process.argv[2];
  runModeHandlers[selectedRunMode]();
}

main();
