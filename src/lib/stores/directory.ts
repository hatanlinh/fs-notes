import { writable } from 'svelte/store';
import type { StorageType } from '$lib/types';

export const directoryHandle = writable<FileSystemDirectoryHandle | null>(null);

export const driveRootFolderId = writable<string | null>(null);
export const driveRootFolderName = writable<string | null>(null);

export const storageType = writable<StorageType>('local');

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
