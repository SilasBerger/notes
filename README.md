# AsciiDoc Notes Builder
## Usage
### Requirements
* Node v18.12.1+

### Installation & Getting Started
- Clone this repository
- If you are using `nvm`, run `nvm use`
- From the root of this repository, run `$ npm install`
- Run `npm run engine:build` to build the engine
- Create an `.asciidocnotesrc` file in your user home (e.g. `C:\Users\me`, `/home/me`) following the format specified below
- Run any of the commands specified in the _Commands_ section below

### Config File Format
The following properties are expected in the `.asciidocnotesrc` file:
```
adocDir=C:\Users\me\someDirectory\notes
htmlDir=C:\Users\me\notes-build
servePort=3000
```

**Semantics:**
- `adocDir`: root directory containing all `.adoc` note files, possibly in nested subdirectories
- `htmlDir`: output directory into which the engine will build all HTML files; root directory for the live server.
**Warning:** This directory will be deleted by the application without notice!
- `servePort`: port on which the live server should serve the application

### Commands
```sh
$ npm run engine:build # remove dir, build all .adoc files in adocDir, output to htmlDir
$ npm run engine:watch # build once, rebuild on changes in adocDir
$ npm run engine:serve # build once, rebuild on changes in adocDir, serve htmlDir on specified port
```