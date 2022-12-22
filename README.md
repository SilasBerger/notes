# Notes
A simple Asciidoc-to-HTML converter with built-in live-updating web server.

**Key Features:**
- Asciidoc-to-HTML conversion using [Asciidoctor](https://asciidoctor.org/)
- Watch mode
- Support for multiple note sources: any build operation can compile notes from multiple sources into a single output directory
- Built-in web server for compiled files, including:
  - auto-generated index page
  - automatic page reload on file changes

## Usage
A simple Asciidoc-to-HTML converter

### Requirements
* Node v18.12.1+

### Installation & Getting Started
- Clone this repository
- If you are using `nvm`, run `nvm use`
- From the root of this repository, run `$ npm install`
- Run `npm run engine:build` to build the engine
- Create a `.notesrc.json` file in your user home (e.g. `C:\Users\me`, `/home/me`) following the format specified below
- Run any of the commands specified in the _Commands_ section below

### Config File Format
The following properties are expected in the `.notesrc.json` file:
```json
{
  "noteSources": [
    {
      "name": "onedrive",
      "path": "C:\\Users\\me\\OneDrive\\Notes"
    },
    {
      "name": "dropbox",
      "path":"C:\\Users\\me\\Dropbox\\Notes"
    },
    {
      "name": "local",
      "path": "C:\\Users\\me\\notes\\local-notes"
    }
  ],
  "htmlDir": "C:\\Users\\me\\notes\\notes-build",
  "servePort": 3000
}
```

**Semantics:**
- `noteSource`: An array containing at least one note source. A note source is an object consisting of:
  - `name`: The display name for that note source.
  - `path`: The root directory containing all `.adoc` note files of that source, possibly in nested subdirectories.
- `htmlDir`: The output directory into which the engine will build all HTML files; root directory for the live server.
**Warning:** This directory will be deleted by the application without notice!
- `servePort`: port on which the live server should serve the application

### Commands
```sh
$ npm run notes:build # remove dir, build all .adoc files in all note sources, output to htmlDir
$ npm run notes:watch # build once, rebuild on changes in any file or directory in any note source
$ npm run notes:serve # build once, rebuild on changes in note sources, serve htmlDir on specified port
```

### Useful Alias
```
notes="(cd /path/to/asciidoc-notes-builder && npm run notes:serve)"
```