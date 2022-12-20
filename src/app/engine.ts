import {AsciidocBuilder} from "./asciidoc/asciidoc-builder";
import {RcConfig} from "./cli/config-loader";
import {Logger} from "./cli/logger";
import {LiveServer} from "./server/live-server";
import fs from "fs";

export class Engine {

    private readonly adocBuilder: AsciidocBuilder;

    constructor(private config: RcConfig) {
        this.adocBuilder = new AsciidocBuilder(config.adocDir, config.htmlDir);
    }

    build(): void {
        Logger.building();
        this.adocBuilder.cleanAndBuild();
    }

    watch(): void {
        this.runInitialBuild();
        this.rebuildOnAdocFileChanges();
    }

    serve(): void {
        this.runInitialBuild();
        this.launchLiveServer();
    }

    private runInitialBuild(): void {
        Logger.runningInitialBuild();
        this.adocBuilder.cleanAndBuild();
    }

    private launchLiveServer(): void {
        const indexPageProvider = () => this.adocBuilder.createIndexPage();
        let servePort = this.config.servePort;
        const server = new LiveServer(this.config.htmlDir, servePort, indexPageProvider);
        server.launch(() => Logger.serverLaunched(servePort));

        this.rebuildOnAdocFileChanges(() => {
            Logger.notifyingWebClientsAfterRebuild();
            server.notifyChanges();
        });
    }

    private rebuildOnAdocFileChanges(afterRebuild?: () => any): void {
        Logger.watchingForFileChanges();
        this.watchForFileChanges(this.config.adocDir, () => {
            Logger.rebuildingAfterChange();
            this.adocBuilder.cleanAndBuild();
            if (afterRebuild) {
                afterRebuild();
            }
        });
    }

    private watchForFileChanges(targetDir: string, callback: () => any): void {
        fs.watch(targetDir, {recursive: true}, callback);
    }
}