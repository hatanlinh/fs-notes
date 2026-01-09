import { writable } from 'svelte/store';

// Store for the root directory handle from File System Access API
export const directoryHandle = writable<FileSystemDirectoryHandle | null>(null);

// Helper function to prompt user to select a directory
export async function selectDirectory() {
	try {
		const handle = await window.showDirectoryPicker({
			mode: 'readwrite'
		});
		directoryHandle.set(handle);
		return handle;
	} catch (err) {
		if (err instanceof Error && err.name !== 'AbortError') {
			console.error('Error selecting directory:', err);
		}
		return null;
	}
}
