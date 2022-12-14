import fs from 'fs';
import path from 'path';
import dirTree, { DirectoryTree } from 'directory-tree';

const Asciidoctor = require('asciidoctor');

export class AsciidocBuilder {

  private readonly INPUT_FILE_EXT = '.adoc';
  private readonly OUTPUT_FILE_EXT = '.html';

  private readonly asciidoctor: any;

  constructor(private inputRoot: string, private outputRoot: string) {
    this.asciidoctor = new Asciidoctor();
  }

  clean(): void {
    fs.rmSync(this.outputRoot, {recursive: true, force: true});
  }

  build(): void {
    const rootEntry: DirectoryTree = dirTree(this.inputRoot);
    this.collectInputFiles(rootEntry).forEach((inputFile: DirectoryTree) => this.convertFile(inputFile));
  }

  cleanAndBuild(): void {
    this.clean();
    this.build();
  }

  createIndexPage(): string {
    const inputFiles = this.collectInputFiles(dirTree(this.inputRoot));
    let output = "= Index\n\n";
    inputFiles.forEach((inputFile: DirectoryTree) => output += this.createIndexEntry(inputFile));
    return this.asciidoctor.convert(output, {standalone: true, safe: 'unsafe'}) as string;
  }

  private createIndexEntry(inputFileRef: DirectoryTree): string {
    const outputFilename = path.relative(this.outputRoot, this.getOutputFilename(inputFileRef));
    return `* link:/${outputFilename}[${outputFilename}]\n`;
  }

  private collectInputFiles(treeEntry: DirectoryTree): DirectoryTree[] {
    if (AsciidocBuilder.isAsciidocFile(treeEntry)) {
      return [treeEntry]
    }

    return treeEntry.children?.flatMap(child => this.collectInputFiles(child)) || [];
  }

  private static isAsciidocFile(treeEntry: DirectoryTree): boolean {
    return !treeEntry.children && treeEntry.path.endsWith('.adoc')
  }

  private convertFile(inputFile: DirectoryTree): void {
    fs.readFile(inputFile.path, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }

      this.asciidoctor.convert(data, {to_file: this.getOutputFilename(inputFile), mkdirs: true, safe: 'unsafe'});
    });
  }

  private getOutputFilename(inputFile: DirectoryTree): string {
    const absoluteInputPath = path.resolve(inputFile.path);
    const inputPathRelativeToInputRoot = path.relative(this.inputRoot, absoluteInputPath);
    const outputDirPath = path.dirname(path.resolve(this.outputRoot, inputPathRelativeToInputRoot));

    const outputFilename = path.basename(absoluteInputPath, this.INPUT_FILE_EXT) + this.OUTPUT_FILE_EXT;

    return path.resolve(outputDirPath, outputFilename);
  }
}
