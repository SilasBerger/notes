import {CliArgs, RunMode} from "../models/cli";

export class CliArgParser {

    static parseArgs(): CliArgs {
        return {
            runMode: CliArgParser.getRunMode(process.argv[2]),
        }
    }

    static getRunMode(arg: string) {
        const mode: RunMode | undefined = Object.values(RunMode).find((value: string) => value === arg);
        if (!mode) {
            throw `Unknown run mode: ${arg}`;
        }
        return mode;
    }
}