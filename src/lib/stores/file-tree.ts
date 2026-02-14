import { writable } from "svelte/store";
import type { FileNode } from "$lib/types";

export const fileTree = writable<FileNode[]>([]);

export function setFileTree(nodes: FileNode[]) {
  fileTree.set(nodes);
}

export function clearFileTree() {
  fileTree.set([]);
}
