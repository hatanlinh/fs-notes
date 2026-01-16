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

<aside class="flex w-64 flex-col p-2">
	<div
		class="flex h-full flex-col overflow-hidden rounded-md border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
	>
		<!-- Header with root folder name -->
		<div class="flex h-10 items-center gap-2 border-b border-gray-200 px-4 dark:border-gray-700">
			{#if $storageType === 'local' && $directoryHandle}
				<IconDeviceDesktop size={20} class="shrink-0 text-gray-600 dark:text-gray-400" />
			{:else if $storageType === 'google-drive'}
				<IconBrandGoogleDrive size={20} class="shrink-0 text-blue-600 dark:text-blue-400" />
			{/if}
			<h2 class="flex-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
				{#if $storageType === 'local'}
					{$directoryHandle?.name ?? 'Open a directory to view files'}
				{:else if $storageType === 'google-drive'}
					{$driveRootFolderName ?? 'Google Drive'}
				{:else}
					Open a directory to view files
				{/if}
			</h2>
			{#if hasDirectory}
				<button
					onclick={handleNewFile}
					class="rounded p-1 text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
					title="New File"
					aria-label="New File"
				>
					<IconFilePlus size={18} />
				</button>
				<button
					onclick={handleNewDirectory}
					class="rounded p-1 text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
					title="New Directory"
					aria-label="New Directory"
				>
					<IconFolderPlus size={18} />
				</button>
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
