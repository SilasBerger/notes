import os from 'os';
import path from 'path';
import fs from 'fs';
import {NotesConfig, NotesSourceSpec} from "../models/config";

export class ConfigLoader {

    private static readonly CONFIG_FILE_NAME = '.notesrc.json';

    static loadConfig(): NotesConfig {
        const rcFilePath = path.resolve(os.homedir(), ConfigLoader.CONFIG_FILE_NAME);
        if (!fs.existsSync(rcFilePath)) {
            throw `Config file not found: ${rcFilePath}`;
        }

        const notesConfig = JSON.parse(fs.readFileSync(rcFilePath, 'utf-8'));
        ConfigLoader.validateConfig(notesConfig);

        return notesConfig;
    }

    private static validateConfig(configObj: NotesConfig): void {
        ConfigLoader.requireProperty('noteSources', configObj);
        ConfigLoader.requireProperty('htmlDir', configObj);
        ConfigLoader.requireProperty('servePort', configObj);

        if (configObj.noteSources.length < 1) {
            throw 'Must specify at least one note source';
        }

        configObj.noteSources.forEach((noteSource: NotesSourceSpec) => {
            ConfigLoader.requireProperty('name', noteSource);
            ConfigLoader.requireProperty('path', noteSource);
        });
    }

    private static requireProperty(propName: string, obj: {[key: string]: any}) {
        if (!Object.keys(obj).includes(propName)) {
            throw `Missing config property: ${propName}`;
        }
    }
}
