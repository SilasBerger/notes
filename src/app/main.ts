import process from 'process';
import fs from 'fs';
import path from 'path';
import { AsciidocBuilder } from './asciidoc/asciidoc-builder';
import { LiveServer } from './server/live-server';
import { RunModeHandlers } from "./models/types";
import {Logger} from "./cli/logger";

const SERVE_PORT = 3000;

const rootDir = path.resolve('../');
const inputRoot = path.resolve(rootDir, 'notes');
const outputRoot = path.resolve(rootDir, 'build');
const adocBuilder = new AsciidocBuilder(inputRoot, outputRoot);

function cleanAndBuild(): void {
  Logger.building();
  adocBuilder.cleanAndBuild();
}

function buildAndWatch(): void {
  runInitialBuild();
  rebuildOnInputChanges();
}

function serve(): void {
  runInitialBuild();

  const server = new LiveServer(outputRoot, SERVE_PORT, () => adocBuilder.createIndexPage());
  server.launch(() => Logger.serverLaunched(SERVE_PORT));

  rebuildOnInputChanges(() => {
    Logger.notifyingWebClientsAfterRebuild();
    server.notifyChanges();
  });
}

function runInitialBuild(): void {
  Logger.runningInitialBuild();
  adocBuilder.cleanAndBuild();
}

function rebuildOnInputChanges(onRebuild?: () => any): void {
  Logger.watchingForFileChanges();
  watchInputFileChanges(() => {
    Logger.rebuildingAfterChange();
    adocBuilder.cleanAndBuild();
    if (onRebuild) {
      onRebuild();
    }
  });
}

function watchInputFileChanges(callback: () => any): void {
  fs.watch(inputRoot, {recursive: true}, callback);
}

function main(): void {
  const runModeHandlers: RunModeHandlers = {
    'build': () => cleanAndBuild(),
    'watch': () => buildAndWatch(),
    'serve': () => serve(),
  };

  const selectedRunMode = process.argv[2];
  const runModeHandler = runModeHandlers[selectedRunMode];
  if (!runModeHandler) {
    Logger.error(`Unknown run mode ${selectedRunMode}`);
  } else {
    runModeHandler();
  }
}

main();
