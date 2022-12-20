import fs from 'fs';
import path from 'path';
import express from 'express';
import expressWebsocket from 'express-ws';
import { HtmlTransformer } from './html-transformer';
import HtmlParser, { HTMLElement } from 'node-html-parser';

export class LiveServer {

  private static readonly WS_MSG_READY = 'ready';
  private static readonly WS_MSG_ONCHANGE = 'onchange';

  private readonly expressApp: any;
  private readonly htmlTransformer: HtmlTransformer;
  private webSockets: WebSocket[];

  constructor(private rootDir: string, private port: string, private indexPageProvider: () => string) {
    this.expressApp = express();
    this.htmlTransformer = new HtmlTransformer();
    this.webSockets = [];
  }

  launch(onLaunch: () => any): void {
    expressWebsocket(this.expressApp);
    this.registerWebsocketServer();
    this.registerHtmlServerRoutes();
    this.startServer(onLaunch);
  }

  notifyChanges(): void {
    const connectedClients = this.webSockets;
    this.webSockets = [];
    connectedClients.forEach(websocket => websocket.send(LiveServer.WS_MSG_ONCHANGE));
  }

  private registerWebsocketServer(): void {
    this.expressApp.ws('/ws', (websocket: WebSocket) => {
      this.webSockets.push(websocket);
      websocket.send(LiveServer.WS_MSG_READY);
    });
  }

  private registerHtmlServerRoutes(): void {
    this.expressApp.get('/', (req: express.Request, res: express.Response) => {
      res.send(this.indexPageProvider());
    });

    this.expressApp.get('/*', (req: express.Request, res: express.Response) => {
      const filePath = path.resolve(this.rootDir, path.relative('/', path.resolve(this.rootDir, req.path)));
      if (!fs.existsSync(filePath)) {
        res.send(this.indexPageProvider());
        return;
      }

      const html = this.readHtmlFile(filePath);
      this.htmlTransformer.injectLiveReloadRuntime(html);

      res.send(html.toString());
    });
  }

  private readHtmlFile(path: string): HTMLElement {
    return HtmlParser.parse(fs.readFileSync(path, {encoding:'utf8', flag:'r'}));
  }

  private startServer(onLaunch: () => any): void {
    this.expressApp.listen(this.port, onLaunch);
  }
}
