const fs = require('fs');
const path = require('path');

const Asciidoctor = require('asciidoctor');
const dirTree = require('directory-tree');

class AdocBuilder {

  _INPUT_FILE_EXT = '.adoc';
  _OUTPUT_FILE_EXT = '.html';

  _inputRoot;
  _outputRoot;
  _asciidoctor;

  constructor(inputRoot, outputRoot) {
    this._inputRoot = inputRoot;
    this._outputRoot = outputRoot;
    this._asciidoctor = new Asciidoctor();
  }

  clean() {
    fs.rmSync(this._outputRoot, {recursive: true, force: true});
  }

  build() {
    const rootEntry = dirTree(this._inputRoot);
    this._collectInputFiles(rootEntry).forEach(inputFile => this._convertFile(inputFile));
  }

  cleanAndBuild() {
    this.clean();
    this.build();
  }

  createIndexPage() {
    const inputFiles = this._collectInputFiles(dirTree(this._inputRoot));
    let output = "= Index\n\n";
    inputFiles.forEach(inputFile => output += this._createIndexEntry(inputFile));
    return this._asciidoctor.convert(output, {standalone: true, safe: 'unsafe'});
  }

  _createIndexEntry(inputFileRef) {
    const outputFilename = path.relative(this._outputRoot, this._getOutputFilename(inputFileRef));
    console.log(outputFilename);
    return `* link:/${outputFilename}[${outputFilename}]\n`;
  }

  _collectInputFiles(treeEntry) {
    if (this._isAsciidocFile(treeEntry)) {
      return [treeEntry]
    }
  
    return treeEntry.children.flatMap(child => this._collectInputFiles(child));
  }
  
  _isAsciidocFile(treeEntry) {
    return !treeEntry.children && treeEntry.path.endsWith('.adoc')
  }

  _convertFile(inputFile){
    fs.readFile(inputFile.path, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      
      this._asciidoctor.convert(data, {to_file: this._getOutputFilename(inputFile), mkdirs: true, safe: 'unsafe'});
    });
  }

  _getOutputFilename(inputFile) {
    const absoluteInputPath = path.resolve(inputFile.path);
    const inputPathRelativeToInputRoot = path.relative(this._inputRoot, absoluteInputPath);
    const outputDirPath = path.dirname(path.resolve(this._outputRoot, inputPathRelativeToInputRoot));
  
    const outputFilename = path.basename(absoluteInputPath, this._INPUT_FILE_EXT) + this._OUTPUT_FILE_EXT;
    
    return path.resolve(outputDirPath, outputFilename);
  }
}

module.exports = { AdocBuilder };