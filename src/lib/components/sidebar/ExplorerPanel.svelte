<script lang="ts">
	import {
		IconDeviceDesktop,
		IconBrandGoogleDrive,
		IconFilePlus,
		IconFolderPlus
	} from '@tabler/icons-svelte';
	import FileTree from './FileTree.svelte';
	import CreateItemDialog from './CreateItemDialog.svelte';
	import {
		directoryHandle,
		storageType,
		driveRootFolderName,
		driveRootFolderId
	} from '$lib/stores/directory';
	import { createFile, createDirectory, buildFileTree } from '$lib/services/file-system';
	import {
		createDriveFile,
		createDriveFolder,
		buildDriveFileTree
	} from '$lib/services/google-drive';
	import { setFileTree } from '$lib/stores/file-tree';

	let showCreateDialog = $state(false);
	let createItemType: 'file' | 'directory' = $state('file');

	function handleNewFile() {
		createItemType = 'file';
		showCreateDialog = true;
	}

	function handleNewDirectory() {
		createItemType = 'directory';
		showCreateDialog = true;
	}

	async function handleCreate(name: string) {
		try {
			if ($storageType === 'local' && $directoryHandle) {
				if (createItemType === 'file') {
					await createFile($directoryHandle, name);
				} else {
					await createDirectory($directoryHandle, name);
				}
				const updatedTree = await buildFileTree($directoryHandle);
				setFileTree(updatedTree);
			} else if ($storageType === 'google-drive' && $driveRootFolderId) {
				if (createItemType === 'file') {
					await createDriveFile($driveRootFolderId, name);
				} else {
					await createDriveFolder($driveRootFolderId, name);
				}
				const updatedTree = await buildDriveFileTree($driveRootFolderId);
				setFileTree(updatedTree);
			}
		} catch (err) {
			console.error(`Error creating ${createItemType}:`, err);
			alert(
				`Failed to create ${createItemType}: ${err instanceof Error ? err.message : 'Unknown error'}`
			);
		}
	}

	const hasDirectory = $derived($directoryHandle !== null || $driveRootFolderId !== null);
</script>

<aside class="sidebar">
	<div class="explorer-panel">
		<div class="explorer-header">
			{#if $storageType === 'local' && $directoryHandle}
				<IconDeviceDesktop size={20} class="shrink-0 text-gray-600 dark:text-gray-400" />
			{:else if $storageType === 'google-drive'}
				<IconBrandGoogleDrive size={20} class="shrink-0 text-blue-600 dark:text-blue-400" />
			{/if}
			<h2 class="explorer-title flex-1">
				{#if $storageType === 'local'}
					{$directoryHandle?.name ?? 'Open a directory to view files'}
				{:else if $storageType === 'google-drive'}
					{$driveRootFolderName ?? 'Google Drive'}
				{:else}
					Open a directory to view files
				{/if}
			</h2>
			{#if hasDirectory}
				<div class="explorer-actions">
					<button
						onclick={handleNewFile}
						class="btn-explorer-action"
						title="New File"
						aria-label="New File"
					>
						<IconFilePlus size={18} />
					</button>
					<button
						onclick={handleNewDirectory}
						class="btn-explorer-action"
						title="New Directory"
						aria-label="New Directory"
					>
						<IconFolderPlus size={18} />
					</button>
				</div>
			{/if}
		</div>

		<FileTree />
	</div>
</aside>

<CreateItemDialog
	bind:isOpen={showCreateDialog}
	itemType={createItemType}
	onClose={() => (showCreateDialog = false)}
	onCreate={handleCreate}
/>
