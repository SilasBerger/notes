export class Logger {

    static serverLaunched(port: number): void {
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

    static rebuildingAfterNoteChanged(changedSourceName: string): void {
        console.log(`🔨 Change detected in source '${changedSourceName}', rebuilding`);
    }

    static watchingForFileChanges(): void {
        console.log('🦉 Watching for file changes');
    }

    static error(message: string) {
        console.error(`❌ ${message}`);
    }
}
