// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	namespace NodeJS {
		interface ProcessEnv {
			PUBLIC_GOOGLE_CLIENT_ID: string;
			PUBLIC_GOOGLE_DISCOVERY_DOC: string;
		}
	}

	const gapi: typeof import('gapi');
	const google: {
		accounts: {
			oauth2: {
				initTokenClient(config: {
					client_id: string;
					scope: string;
					callback: (response: {
						access_token?: string;
						error?: string;
						expires_in?: number;
					}) => void;
				}): {
					requestAccessToken(options: { prompt?: string }): void;
				};
				revoke(token: string, callback?: () => void): void;
			};
		};
	};

	interface Window {
		showDirectoryPicker(options?: {
			mode?: 'read' | 'readwrite';
			startIn?: FileSystemHandle | string;
		}): Promise<FileSystemDirectoryHandle>;
		showOpenFilePicker(options?: {
			multiple?: boolean;
			excludeAcceptAllOption?: boolean;
			types?: Array<{
				description?: string;
				accept: Record<string, string[]>;
			}>;
		}): Promise<FileSystemFileHandle[]>;
	}

	interface FileSystemHandle {
		readonly kind: 'file' | 'directory';
		readonly name: string;
		isSameEntry(other: FileSystemHandle): Promise<boolean>;
		queryPermission(descriptor?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
		requestPermission(descriptor?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
	}

	interface FileSystemFileHandle extends FileSystemHandle {
		readonly kind: 'file';
		getFile(): Promise<File>;
		createWritable(options?: { keepExistingData?: boolean }): Promise<FileSystemWritableFileStream>;
	}

	interface FileSystemDirectoryHandle extends FileSystemHandle {
		readonly kind: 'directory';
		getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
		getDirectoryHandle(
			name: string,
			options?: { create?: boolean }
		): Promise<FileSystemDirectoryHandle>;
		removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
		resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
		keys(): AsyncIterableIterator<string>;
		values(): AsyncIterableIterator<FileSystemFileHandle | FileSystemDirectoryHandle>;
		entries(): AsyncIterableIterator<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>;
		[Symbol.asyncIterator](): AsyncIterableIterator<
			[string, FileSystemFileHandle | FileSystemDirectoryHandle]
		>;
	}

	interface FileSystemWritableFileStream extends WritableStream {
		write(
			data:
				| string
				| BufferSource
				| Blob
				| { type: 'write'; position?: number; data: string | BufferSource | Blob }
				| { type: 'seek'; position: number }
				| { type: 'truncate'; size: number }
		): Promise<void>;
		seek(position: number): Promise<void>;
		truncate(size: number): Promise<void>;
	}
}

export {};
