import {AsciidocBuilder} from "./asciidoc/asciidoc-builder";
import {Logger} from "./cli/logger";
import {LiveServer} from "./server/live-server";
import fs from "fs";
import {NotesConfig, NotesSourceSpec} from "./models/config";

export class Engine {

    private readonly asciidocBuilder: AsciidocBuilder;

    constructor(private config: NotesConfig) {
        this.asciidocBuilder = new AsciidocBuilder(config.noteSources, config.htmlDir);
    }

    build(): void {
        Logger.building();
        this.asciidocBuilder.cleanAndBuild();
    }

    watch(): void {
        this.runInitialBuild();
        this.rebuildOnNoteFileChanges();
    }

    serve(): void {
        this.runInitialBuild();
        this.launchLiveServer();
    }

    private runInitialBuild(): void {
        Logger.runningInitialBuild();
        this.asciidocBuilder.cleanAndBuild();
    }

    private launchLiveServer(): void {
        const indexPageProvider = () => this.asciidocBuilder.createIndexPage();
        let servePort = this.config.servePort;
        const server = new LiveServer(this.config.htmlDir, servePort, indexPageProvider);
        server.launch(() => Logger.serverLaunched(servePort));

        this.rebuildOnNoteFileChanges(() => {
            Logger.notifyingWebClientsAfterRebuild();
            server.notifyChanges();
        });
    }

    private rebuildOnNoteFileChanges(afterRebuild?: () => any): void {
        Logger.watchingForFileChanges();
        this.config.noteSources.forEach((notesSource: NotesSourceSpec) => {
            this.watchForFileChanges(notesSource.path, () => {
                Logger.rebuildingAfterNoteChanged(notesSource.name);
                this.asciidocBuilder.cleanAndBuild();
                if (afterRebuild) {
                    afterRebuild();
                }
            });
        });
    }

    private watchForFileChanges(targetDir: string, callback: (changedSourceName: string) => any): void {
        fs.watch(targetDir, {recursive: true}, callback);
    }
}