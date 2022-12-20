import os from 'os';
import path from 'path';
import fs from 'fs';

export class ConfigLoader {

    private static readonly CONFIG_FILE_NAME = '.asciidocnotesrc';
    private static readonly KEY_VALUE_SEPARATOR = '=';

    constructor(private configLines: string[]) {
    }

    static loadConfig(): RcConfig {
        const rcFilePath = path.resolve(os.homedir(), ConfigLoader.CONFIG_FILE_NAME);
        if (!fs.existsSync(rcFilePath)) {
            throw `Config file not found: ${rcFilePath}`;
        }

        const rcFileLines = fs.readFileSync(rcFilePath, 'utf-8').split(/\r?\n/);

        const instance = new ConfigLoader(rcFileLines);
        return instance.parseConfigFile();
    }

    private parseConfigFile(): RcConfig {
        return {
            adocDir: this.requirePathProperty('adocDir'),
            htmlDir: this.requirePathProperty('htmlDir'),
            servePort: this.requireProperty('servePort'),
        };
    }

    private requireProperty(propName: string): string {
        const targetPrefix = `${propName}${ConfigLoader.KEY_VALUE_SEPARATOR}`;
        const line = this.configLines.find((line: string) => line.startsWith(targetPrefix));
        if (!line) {
            throw `Missing config line: ${propName}`;
        }

        const separatorIndex = line.indexOf(ConfigLoader.KEY_VALUE_SEPARATOR);
        return line.substring(separatorIndex + 1);
    }

    private requirePathProperty(propName: string): string {
        return path.resolve(this.requireProperty(propName));
    }
}

export interface RcConfig {
    adocDir: string;
    htmlDir: string;
    servePort: string;
}