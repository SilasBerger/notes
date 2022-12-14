import {ConfigLoader} from "./cli/config-loader";
import {CliArgParser} from "./cli/cli-arg-parser";
import {Engine} from "./engine";
import {RunMode} from "./models/cli";

function main() {
    const config = ConfigLoader.loadConfig();
    const cliArgs = CliArgParser.parseArgs();

    const engine = new Engine(config);
    switch (cliArgs.runMode) {
        case RunMode.BUILD:
            engine.build();
            break;
        case RunMode.WATCH:
            engine.watch();
            break;
        case RunMode.SERVE:
            engine.serve();
            break;
    }
}

main();
