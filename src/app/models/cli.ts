export enum RunMode {
    BUILD = "build",
    WATCH = "watch",
    SERVE = "serve",
}

export interface CliArgs {
    runMode: RunMode;
}