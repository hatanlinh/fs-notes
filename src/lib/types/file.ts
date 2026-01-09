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
	file: FileNode;
	content: string;
	isDirty: boolean;
	cursorPosition?: {
		line: number;
		column: number;
	};
}

export interface EditorState {
	activeTabId: string | null;
	tabs: TabInfo[];
}
