import fs from 'fs';
import path from 'path';
import HtmlParser, { HTMLElement } from 'node-html-parser';

export class HtmlTransformer {

  private readonly liveReloadScriptNode;

  constructor() {
    this.liveReloadScriptNode = this.createLiveReloadRuntimeNode();
  }

  injectLiveReloadRuntime(htmlNode: HTMLElement): void {
    htmlNode.querySelector('head')?.appendChild(this.liveReloadScriptNode);
  }

  private createLiveReloadRuntimeNode(): HTMLElement {
    // TODO: Find more elegant way to specify this path.
    const resourcePath = path.resolve(__dirname, '..', '..', 'resources', 'live-reload-runtime.js');
    const runtimeScript = fs.readFileSync(resourcePath, {encoding:'utf8', flag:'r'});
    return HtmlParser.parse(`<script>${runtimeScript}</script>`);
  }
}
