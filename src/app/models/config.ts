export interface NotesSourceSpec {
    name: string;
    path: string;
}

export interface NotesConfig {
    noteSources: NotesSourceSpec[];
    htmlDir: string;
    servePort: number;
}