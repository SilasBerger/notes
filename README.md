# AsciiDoc Notes Builder
## Usage
### Installation
* Clone this repository
* From the root of this repository, run `$ npm install`
* Create a `notes` directory next to the root of this repository, containing all notes (possibly nested; see _Expected Directory Structure_ below)
* Refer to the _Commands_ section below for building

### Expected Directory Structure
```
|_ asciidoc-notes-builder
|  |_ package.json
|  |_ asciidoc-build.js
|  |_ ...
|  
|_ notes
  |_ someSubdir
  |  |_ someNote.adoc
  |  |_ (other note files and subdirectories)
  |
  |_ (other note files and subdirectories)
```

### Commands
```sh
$ npm run build # remove /build dir, build all .adoc files in /notes, output to /build dir
$ npm run start # build once, serve output dir, rebuild on changes to input files
```