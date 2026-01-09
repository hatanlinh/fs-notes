import { writable } from 'svelte/store';
import type { FileNode } from '$lib/types';

// Store for the file tree structure
export const fileTree = writable<FileNode[]>([]);

// Helper to update the file tree
export function setFileTree(nodes: FileNode[]) {
	fileTree.set(nodes);
}

// Helper to clear the file tree
export function clearFileTree() {
	fileTree.set([]);
}
