const fs = require('fs');
const path = require('path');
const express = require('express');
const expressWebsocket = require('express-ws');
const { HtmlTransformer } = require('./html-transformer');
const HtmlParser = require('node-html-parser');
const dirTree = require('directory-tree');

class LiveServer {

  _WS_MSG_READY = 'ready';
  _WS_MSG_ONCHANGE = 'onchange';

  _rootDir;
  _port;
  _indexPageProvider;
  _expressApp;
  _htmlTransformer;
  _webSockets;

  constructor(rootDir, port, indexPageProvider) {
    this._rootDir = rootDir;
    this._port = port;
    this._indexPageProvider = indexPageProvider;
    this._expressApp = express();
    this._htmlTransformer = new HtmlTransformer();
    this._webSockets = [];
  }

  launch(onLaunch) {
    expressWebsocket(this._expressApp);
    this._registerWebsocketServer();
    this._registerHtmlServerRoutes();
    this._startServer(onLaunch);
  }

  notifyChanges() {
    const connectedClients = this._webSockets;
    this._webSockets = [];
    connectedClients.forEach(websocket => websocket.send('onchange'));
  }

  _registerWebsocketServer() {
    this._expressApp.ws('/ws', websocket => {
      this._webSockets.push(websocket);
      console.log(this._webSockets.length);
      websocket.send(this._WS_MSG_READY);
    });
  }

  _registerHtmlServerRoutes() {
    this._expressApp.get('/', (req, res) => {
      res.send(this._indexPageProvider());
    });

    this._expressApp.get('/*', (req, res) => {
      const filePath = path.resolve(this._rootDir, path.relative('/', path.resolve(this._rootDir, req.path)));
      if (!fs.existsSync(filePath)) {
        res.send(this._indexPageProvider());
        return;
      }
  
      const html = this._readHtmlFile(filePath);
      this._htmlTransformer.injectLiveReloadRuntime(html);
  
      res.send(html.toString());
    });
  }

  _renderIndexPage() {
    const rootEntry = dirTree(this._rootDir);
  }

  _readHtmlFile(path) {
    return HtmlParser.parse(fs.readFileSync(path, {encoding:'utf8', flag:'r'}));
  }

  _startServer(onLaunch) {
    this._expressApp.listen(this._port, onLaunch);
  }
}

module.exports = { LiveServer };