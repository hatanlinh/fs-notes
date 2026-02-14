export type FileType = "file" | "directory";

export type StorageType = "local" | "google-drive";

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  trashed?: boolean;
}

export interface FileNode {
  name: string;
  path: string;
  type: FileType;
  storageType: StorageType;
  // Local file system properties
  handle?: FileSystemFileHandle | FileSystemDirectoryHandle;
  // Google Drive properties
  driveId?: string;
  mimeType?: string;
  children?: FileNode[];
}

export interface TabInfo {
  id: string;
  file: FileNode | null; // null for unsaved tabs
  content: string;
  isDirty: boolean;
  isUnsaved?: boolean; // true for new tabs that haven't been saved yet
  defaultFileName?: string;
  cursorPosition?: {
    line: number;
    column: number;
  };
}

export interface EditorState {
  activeTabId: string | null;
  tabs: TabInfo[];
}
