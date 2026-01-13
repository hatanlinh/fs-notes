export type FileType = 'file' | 'directory';

export interface FileNode {
	name: string;
	path: string;
	type: FileType;
	handle?: FileSystemFileHandle | FileSystemDirectoryHandle;
	children?: FileNode[];
}

export interface TabInfo {
	id: string;
	file: FileNode | null; // null for unsaved tabs
	content: string;
	isDirty: boolean;
	isUnsaved?: boolean; // true for new tabs that haven't been saved yet
	cursorPosition?: {
		line: number;
		column: number;
	};
}

export interface EditorState {
	activeTabId: string | null;
	tabs: TabInfo[];
}
