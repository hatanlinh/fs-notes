import { writable } from 'svelte/store';

export type LoadingOperation =
	| 'drive-connect'
	| 'drive-disconnect'
	| 'file-load'
	| 'file-save'
	| 'file-tree-load'
	| 'file-create';

interface LoadingState {
	operation: LoadingOperation;
	fileId?: string;
	fileName?: string;
}

function createLoadingStore() {
	const { subscribe, update } = writable<LoadingState[]>([]);

	return {
		subscribe,
		start: (operation: LoadingOperation, fileId?: string, fileName?: string) => {
			update((states) => [...states, { operation, fileId, fileName }]);
		},
		end: (operation: LoadingOperation, fileId?: string) => {
			update((states) =>
				states.filter((s) => !(s.operation === operation && (!fileId || s.fileId === fileId)))
			);
		},
		clear: () => {
			update(() => []);
		}
	};
}

export const loadingState = createLoadingStore();
