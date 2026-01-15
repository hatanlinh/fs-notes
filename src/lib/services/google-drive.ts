import type { FileNode, GoogleDriveFile } from '$lib/types';
import { getAccessToken } from './google-auth';
import { loadingState } from '$lib/stores/loading';

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';
const TEXT_MIME_TYPE = 'text/plain';

/**
 * Get user's Drive root folder
 */
export async function getRootFolder(): Promise<GoogleDriveFile> {
	try {
		const response = await gapi.client.drive.files.get({
			fileId: 'root',
			fields: 'id, name, mimeType'
		});

		return response.result as GoogleDriveFile;
	} catch (error) {
		console.error('Error getting root folder:', error);
		throw error;
	}
}

/**
 * Find or create the "fs-notes" folder in Google Drive root
 */
export async function findOrCreateFsNotesFolder(): Promise<GoogleDriveFile> {
	try {
		// First, search for existing "fs-notes" folder
		const response = await gapi.client.drive.files.list({
			q: "name = 'fs-notes' and mimeType = 'application/vnd.google-apps.folder' and trashed = false and 'root' in parents",
			fields: 'files(id, name, mimeType, parents)',
			pageSize: 1
		});

		const files = response.result.files || [];

		// If folder exists, return it
		if (files.length > 0) {
			return files[0] as GoogleDriveFile;
		}

		// If not found, create it
		console.log('fs-notes folder not found, creating...');
		const createResponse = await gapi.client.drive.files.create({
			resource: {
				name: 'fs-notes',
				mimeType: FOLDER_MIME_TYPE,
				parents: ['root']
			},
			fields: 'id, name, mimeType, parents'
		});

		return createResponse.result as GoogleDriveFile;
	} catch (error) {
		console.error('Error finding or creating fs-notes folder:', error);
		throw error;
	}
}

/**
 * List files in a folder
 */
export async function listFiles(folderId: string): Promise<GoogleDriveFile[]> {
	try {
		const response = await gapi.client.drive.files.list({
			q: `'${folderId}' in parents and trashed = false`,
			fields: 'files(id, name, mimeType, parents)',
			orderBy: 'folder,name'
		});

		return (response.result.files || []) as GoogleDriveFile[];
	} catch (error) {
		console.error('Error listing files:', error);
		throw error;
	}
}

/**
 * Build FileNode tree from Drive folder
 */
export async function buildDriveFileTree(
	folderId: string,
	parentPath: string = ''
): Promise<FileNode[]> {
	const nodes: FileNode[] = [];

	try {
		loadingState.start('file-tree-load', folderId);
		const files = await listFiles(folderId);

		for (const file of files) {
			const path = parentPath ? `${parentPath}/${file.name}` : file.name;
			const isFolder = file.mimeType === FOLDER_MIME_TYPE;

			if (isFolder) {
				// Recursively get children for folders
				const children = await buildDriveFileTree(file.id, path);

				nodes.push({
					name: file.name,
					path,
					type: 'directory',
					storageType: 'google-drive',
					driveId: file.id,
					mimeType: file.mimeType,
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
					name: file.name,
					path,
					type: 'file',
					storageType: 'google-drive',
					driveId: file.id,
					mimeType: file.mimeType
				});
			}
		}
	} catch (error) {
		console.error('Error building Drive file tree:', error);
	} finally {
		loadingState.end('file-tree-load', folderId);
	}

	return nodes.sort((a, b) => {
		// Directories first, then alphabetical
		if (a.type !== b.type) {
			return a.type === 'directory' ? -1 : 1;
		}
		return a.name.localeCompare(b.name);
	});
}

/**
 * Read file content from Google Drive
 */
export async function readDriveFile(fileId: string): Promise<string> {
	try {
		loadingState.start('file-load', fileId);
		const token = getAccessToken();
		if (!token) {
			throw new Error('Not authenticated');
		}

		// Use fetch API to download file content
		const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to read file: ${response.statusText}`);
		}

		return await response.text();
	} catch (error) {
		console.error('Error reading Drive file:', error);
		throw error;
	} finally {
		loadingState.end('file-load', fileId);
	}
}

/**
 * Write/update file content in Google Drive
 */
export async function writeDriveFile(fileId: string, content: string): Promise<void> {
	try {
		loadingState.start('file-save', fileId);
		const token = getAccessToken();
		if (!token) {
			throw new Error('Not authenticated');
		}

		// Create a multipart request body
		const boundary = '-------314159265358979323846';
		const delimiter = '\r\n--' + boundary + '\r\n';
		const close_delim = '\r\n--' + boundary + '--';

		const metadata = {
			mimeType: TEXT_MIME_TYPE
		};

		const multipartRequestBody =
			delimiter +
			'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
			JSON.stringify(metadata) +
			delimiter +
			'Content-Type: ' +
			TEXT_MIME_TYPE +
			'\r\n\r\n' +
			content +
			close_delim;

		const response = await fetch(
			`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`,
			{
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'multipart/related; boundary="' + boundary + '"'
				},
				body: multipartRequestBody
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to write file: ${response.statusText}`);
		}
	} catch (error) {
		console.error('Error writing Drive file:', error);
		throw error;
	} finally {
		loadingState.end('file-save', fileId);
	}
}

/**
 * Create a new file in Google Drive
 */
export async function createDriveFile(
	parentId: string,
	name: string,
	content: string = ''
): Promise<GoogleDriveFile> {
	try {
		loadingState.start('file-create', undefined, name);
		const token = getAccessToken();
		if (!token) {
			throw new Error('Not authenticated');
		}

		const boundary = '-------314159265358979323846';
		const delimiter = '\r\n--' + boundary + '\r\n';
		const close_delim = '\r\n--' + boundary + '--';

		const metadata = {
			name: name,
			mimeType: TEXT_MIME_TYPE,
			parents: [parentId]
		};

		const multipartRequestBody =
			delimiter +
			'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
			JSON.stringify(metadata) +
			delimiter +
			'Content-Type: ' +
			TEXT_MIME_TYPE +
			'\r\n\r\n' +
			content +
			close_delim;

		const response = await fetch(
			'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,parents',
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'multipart/related; boundary="' + boundary + '"'
				},
				body: multipartRequestBody
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to create file: ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Error creating Drive file:', error);
		throw error;
	} finally {
		loadingState.end('file-create', undefined);
	}
}

/**
 * Create a new folder in Google Drive
 */
export async function createDriveFolder(parentId: string, name: string): Promise<GoogleDriveFile> {
	try {
		const response = await gapi.client.drive.files.create({
			resource: {
				name: name,
				mimeType: FOLDER_MIME_TYPE,
				parents: [parentId]
			},
			fields: 'id, name, mimeType, parents'
		});

		return response.result as GoogleDriveFile;
	} catch (error) {
		console.error('Error creating Drive folder:', error);
		throw error;
	}
}

/**
 * Delete a file or folder (move to trash)
 */
export async function deleteDriveFile(fileId: string): Promise<void> {
	try {
		await gapi.client.drive.files.update({
			fileId: fileId,
			resource: {
				trashed: true
			}
		});
	} catch (error) {
		console.error('Error deleting Drive file:', error);
		throw error;
	}
}

/**
 * Search for files in Google Drive
 */
export async function searchDriveFiles(query: string): Promise<GoogleDriveFile[]> {
	try {
		const response = await gapi.client.drive.files.list({
			q: `name contains '${query}' and trashed = false`,
			fields: 'files(id, name, mimeType, parents)',
			orderBy: 'folder,name'
		});

		return (response.result.files || []) as GoogleDriveFile[];
	} catch (error) {
		console.error('Error searching Drive files:', error);
		throw error;
	}
}

/**
 * Get a specific file by ID
 */
export async function getDriveFile(fileId: string): Promise<GoogleDriveFile> {
	try {
		const response = await gapi.client.drive.files.get({
			fileId: fileId,
			fields: 'id, name, mimeType, parents'
		});

		return response.result as GoogleDriveFile;
	} catch (error) {
		console.error('Error getting Drive file:', error);
		throw error;
	}
}
