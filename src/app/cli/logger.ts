export class Logger {

    static serverLaunched(port: string): void {
        console.log(`🚀 Server launched (port ${port})`);
    }

    static notifyingWebClientsAfterRebuild(): void {
        console.log('📢 Notifying web clients after rebuild');
    }

    static building() {
        console.log('🔨 Building');
    }

    static runningInitialBuild(): void {
        console.log('🔨 Running initial build');
    }

    static rebuildingAfterChange(): void {
        console.log('🔨 Change detected, rebuilding');
    }

    static watchingForFileChanges(): void {
        console.log('🦉 Watching for file changes');
    }

    static error(message: string) {
        console.error(`❌ ${message}`);
    }
}
