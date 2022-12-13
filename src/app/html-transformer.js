const fs = require('fs');
const path = require('path');
const HtmlParser = require('node-html-parser');

class HtmlTransformer {

  _liveReloadScriptNode;

  constructor() {
    this._liveReloadScriptNode = this._createLiveReloadRuntimeNode();
  }

  _createLiveReloadRuntimeNode() {
    const resourcePath = path.resolve(__dirname, '..', 'resources', 'live-reload-runtime.js');
    const runtimeScript = fs.readFileSync(resourcePath, {encoding:'utf8', flag:'r'});
    return HtmlParser.parse(`<script>${runtimeScript}</script>`);
  }

  injectLiveReloadRuntime(htmlNode) {
    htmlNode.querySelector('head').appendChild(this._liveReloadScriptNode);
  }
}

module.exports = { HtmlTransformer };