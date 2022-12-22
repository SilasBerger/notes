import {NotesSourceSpec} from "./config";

export interface TreeNode {
    source: NotesSourceSpec;
    path: string;
    logicalPath: string[];
    children: TreeNode[]
}