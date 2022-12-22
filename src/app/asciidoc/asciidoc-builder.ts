import fs from 'fs';
import path from 'path';
import dirTree, {DirectoryTree} from 'directory-tree';
import {NotesSourceSpec} from "../cli/config-loader";
import {lastElementOf} from "../util/util";

const Asciidoctor = require('asciidoctor');

export class AsciidocBuilder {

  private readonly INPUT_FILE_EXT = '.adoc';
  private readonly OUTPUT_FILE_EXT = '.html';

  private readonly asciidoctor: any;

  constructor(private noteSources: NotesSourceSpec[], private outputRoot: string) {
    this.asciidoctor = new Asciidoctor();
  }

  clean(): void {
    fs.rmSync(this.outputRoot, {recursive: true, force: true});
  }

  build(): void {
    const noteFilesRefs = this.getNoteFileRefs();
    noteFilesRefs.forEach((noteFileRef: TreeNode) => this.convertFile(noteFileRef));
  }

  cleanAndBuild(): void {
    this.clean();
    this.build();
  }

  private getNoteFileRefs(): TreeNode[] {
    const noteFileTree = this.createNoteFileTree();
    return this.collectNoteFilesRefs(noteFileTree);
  }

  private createNoteFileTree(): TreeNode {
    const rootSourceSpec: NotesSourceSpec = {
      name: 'root',
      path: ''
    };

    const noteFileTree: TreeNode = {
      source: rootSourceSpec,
      path: '',
      logicalPath: [],
      children: [],
    }

    this.noteSources.forEach((noteSource: NotesSourceSpec) => this.appendChildren(noteSource.path, noteFileTree, noteSource));

    return noteFileTree;
  }

  private appendChildren(targetPath: string, parent: TreeNode, source: NotesSourceSpec) {
    const tree: DirectoryTree = dirTree(targetPath);

    const pathRelativeToParent = parent.path ? path.relative(parent.path, targetPath) : '';
    const logicalPathSegments = pathRelativeToParent.split(path.sep).filter(segment => !!segment);

    const childNode: TreeNode = {
      source: source,
      path: targetPath,
      logicalPath: [source.name, ...logicalPathSegments],
      children: [],
    };

    tree.children?.forEach(child => {
      this.appendChildren(child.path, childNode, source);
    });

    parent.children.push(childNode);
  }

  private collectNoteFilesRefs(treeNode: TreeNode): TreeNode[] {
    if (AsciidocBuilder.isAsciidocFile(treeNode)) {
      return [treeNode]
    }

    return treeNode.children?.flatMap(child => this.collectNoteFilesRefs(child)) || [];
  }

  private static isAsciidocFile(treeNode: TreeNode): boolean {
    return (treeNode.children.length === 0) && !!lastElementOf(treeNode.logicalPath)?.endsWith('.adoc');
  }

  private convertFile(noteFileRef: TreeNode): void {
    fs.readFile(noteFileRef.path, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }

      this.asciidoctor.convert(data, {to_file: this.getOutputFilename(noteFileRef), mkdirs: true, safe: 'unsafe'});
    });
  }

  private getOutputFilename(noteFileRef: TreeNode): string {
    const noteFilePathRelativeToSourceRoot = path.relative(noteFileRef.source.path, noteFileRef.path);
    const outputDirPath = path.dirname(path.resolve(this.outputRoot, noteFilePathRelativeToSourceRoot));

    const outputFilename = path.basename(noteFileRef.path, this.INPUT_FILE_EXT) + this.OUTPUT_FILE_EXT;

    return path.resolve(outputDirPath, outputFilename);
  }

  createIndexPage(): string {
    const noteFileRefs = this.getNoteFileRefs();
    let output = "= Index\n\n";
    noteFileRefs.forEach((inputFile: TreeNode) => output += this.createIndexEntry(inputFile));
    return this.asciidoctor.convert(output, {standalone: true, safe: 'unsafe'}) as string;
  }

  private createIndexEntry(noteFileRef: TreeNode): string {
    const linkPath = path.relative(this.outputRoot, this.getOutputFilename(noteFileRef));
    const linkName = noteFileRef.logicalPath.join('/');
    return `* link:/${linkPath}[${linkName}]\n`;
  }
}

interface TreeNode {
  source: NotesSourceSpec;
  path: string;
  logicalPath: string[];
  children: TreeNode[]
}