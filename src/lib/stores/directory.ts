import { writable } from 'svelte/store';
import type { StorageType } from '$lib/types';

// Store for the root directory handle from File System Access API
export const directoryHandle = writable<FileSystemDirectoryHandle | null>(null);

// Store for Google Drive root folder ID
export const driveRootFolderId = writable<string | null>(null);

// Store for Google Drive root folder name
export const driveRootFolderName = writable<string | null>(null);

// Store for current storage type
export const storageType = writable<StorageType>('local');

// Helper function to prompt user to select a directory
export async function selectDirectory() {
	try {
		const handle = await window.showDirectoryPicker({
			mode: 'readwrite'
		});
		directoryHandle.set(handle);
		storageType.set('local');
		return handle;
	} catch (err) {
		if (err instanceof Error && err.name !== 'AbortError') {
			console.error('Error selecting directory:', err);
		}
		return null;
	}
}
