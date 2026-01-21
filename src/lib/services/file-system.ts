import type { FileNode } from '$lib/types';
import { loadingState } from '$lib/stores/loading';

export async function buildFileTree(
	dirHandle: FileSystemDirectoryHandle,
	parentPath: string = ''
): Promise<FileNode[]> {
	const nodes: FileNode[] = [];

	try {
		for await (const entry of dirHandle.values()) {
			const path = parentPath ? `${parentPath}/${entry.name}` : entry.name;

			if (entry.kind === 'directory') {
				const children = await buildFileTree(entry, path);
				nodes.push({
					name: entry.name,
					path,
					type: 'directory',
					storageType: 'local',
					handle: entry,
					children: children.sort((a, b) => {
						// Directories first, then alphabetical
						if (a.type !== b.type) {
							return a.type === 'directory' ? -1 : 1;
						}
						return a.name.localeCompare(b.name);
					})
				});
			} else {
				nodes.push({
					name: entry.name,
					path,
					type: 'file',
					storageType: 'local',
					handle: entry
				});
			}
		}
	} catch (err) {
		console.error('Error building file tree:', err);
	}

	return nodes.sort((a, b) => {
		// Directories first, then alphabetical
		if (a.type !== b.type) {
			return a.type === 'directory' ? -1 : 1;
		}
		return a.name.localeCompare(b.name);
	});
}

export async function readFile(fileHandle: FileSystemFileHandle): Promise<string> {
	try {
		loadingState.start('file-load', fileHandle.name, fileHandle.name);
		const file = await fileHandle.getFile();
		return await file.text();
	} catch (err) {
		console.error('Error reading file:', err);
		throw err;
	} finally {
		loadingState.end('file-load', fileHandle.name);
	}
}

export async function writeFile(fileHandle: FileSystemFileHandle, content: string): Promise<void> {
	try {
		loadingState.start('file-save', fileHandle.name, fileHandle.name);
		const writable = await fileHandle.createWritable();
		await writable.write(content);
		await writable.close();
	} catch (err) {
		console.error('Error writing file:', err);
		throw err;
	} finally {
		loadingState.end('file-save', fileHandle.name);
	}
}

export async function createFile(
	dirHandle: FileSystemDirectoryHandle,
	fileName: string
): Promise<FileSystemFileHandle> {
	try {
		loadingState.start('file-create', undefined, fileName);

		const parts = fileName.split('/').filter((p) => p.length > 0);
		if (parts.length === 0) {
			throw new Error('Invalid file name');
		}

		let currentHandle = dirHandle;
		for (let i = 0; i < parts.length - 1; i++) {
			currentHandle = await currentHandle.getDirectoryHandle(parts[i], { create: true });
		}

		const actualFileName = parts[parts.length - 1];
		const fileHandle = await currentHandle.getFileHandle(actualFileName, { create: true });
		return fileHandle;
	} catch (err) {
		console.error('Error creating file:', err);
		throw err;
	} finally {
		loadingState.end('file-create', undefined);
	}
}

export async function createDirectory(
	dirHandle: FileSystemDirectoryHandle,
	dirName: string
): Promise<FileSystemDirectoryHandle> {
	try {
		const parts = dirName.split('/').filter((p) => p.length > 0);
		if (parts.length === 0) {
			throw new Error('Invalid directory name');
		}

		let currentHandle = dirHandle;
		for (const part of parts) {
			currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
		}

		return currentHandle;
	} catch (err) {
		console.error('Error creating directory:', err);
		throw err;
	}
}

export async function deleteEntry(
	parentHandle: FileSystemDirectoryHandle,
	entryName: string,
	options?: { recursive?: boolean }
): Promise<void> {
	try {
		await parentHandle.removeEntry(entryName, options);
	} catch (err) {
		console.error('Error deleting entry:', err);
		throw err;
	}
}

export async function getHandleByPath(
	rootHandle: FileSystemDirectoryHandle,
	path: string
): Promise<FileSystemFileHandle | FileSystemDirectoryHandle | null> {
	const parts = path.split('/').filter((p) => p.length > 0);

	let currentHandle: FileSystemDirectoryHandle | FileSystemFileHandle = rootHandle;

	try {
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			const isLast = i === parts.length - 1;

			if (currentHandle.kind !== 'directory') {
				return null;
			}

			try {
				currentHandle = await currentHandle.getDirectoryHandle(part);
			} catch {
				if (isLast) {
					currentHandle = await currentHandle.getFileHandle(part);
				} else {
					return null;
				}
			}
		}

		return currentHandle;
	} catch (err) {
		console.error('Error getting handle by path:', err);
		return null;
	}
}

export function isFileSystemAccessSupported(): boolean {
	return 'showDirectoryPicker' in window;
}
