<script lang="ts">
	import { IconFolderOpen, IconBrandGoogleDrive, IconX } from '@tabler/icons-svelte';
	import {
		selectDirectory,
		directoryHandle,
		driveRootFolderId,
		driveRootFolderName,
		storageType
	} from '$lib/stores/directory';
	import { buildFileTree } from '$lib/services/file-system';
	import { setFileTree, clearFileTree } from '$lib/stores/file-tree';
	import { isGoogleAuthenticated } from '$lib/stores/google-auth';
	import { signInWithGoogle, disconnectGoogleDrive } from '$lib/services/google-auth';
	import { buildDriveFileTree, findOrCreateAppFolder } from '$lib/services/google-drive';
	import { closeTabsByStorageType } from '$lib/stores/tabs';

	let isConnectingDrive = false;

	async function handleOpenDirectory() {
		const handle = await selectDirectory();
		if (handle) {
			const tree = await buildFileTree(handle);
			setFileTree(tree);
		}
	}

	async function handleConnectGoogleDrive() {
		if (isConnectingDrive) return;

		try {
			isConnectingDrive = true;

			if (!$isGoogleAuthenticated) {
				await signInWithGoogle();
			}

			const appFolder = await findOrCreateAppFolder();
			driveRootFolderId.set(appFolder.id);
			driveRootFolderName.set(appFolder.name);
			storageType.set('google-drive');

			const tree = await buildDriveFileTree(appFolder.id);
			setFileTree(tree);
		} catch (error) {
			console.error('Error connecting to Google Drive:', error);
			alert(
				`Failed to connect to Google Drive: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		} finally {
			isConnectingDrive = false;
		}
	}

	async function handleDisconnectGoogleDrive() {
		try {
			await disconnectGoogleDrive();

			driveRootFolderId.set(null);
			driveRootFolderName.set(null);
			storageType.set('local');
			clearFileTree();
			closeTabsByStorageType('google-drive');
		} catch (error) {
			console.error('Error disconnecting from Google Drive:', error);
		}
	}

	function handleDisconnectLocal() {
		directoryHandle.set(null);
		storageType.set('local');
		clearFileTree();
		closeTabsByStorageType('local');
	}
</script>

<nav class="navbar">
	<div class="navbar-left">
		<h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100">fs-notes</h1>
	</div>

	<div class="navbar-right">
		<button
			onclick={handleOpenDirectory}
			class="group relative btn-ghost"
			aria-label="Open local directory"
			title="Open local directory"
		>
			<IconFolderOpen
				size={20}
				class={$storageType === 'local' && $directoryHandle ? 'navbar-icon-active' : ''}
			/>
			<span class="tooltip">Open local directory</span>
		</button>

		<button
			onclick={handleConnectGoogleDrive}
			disabled={isConnectingDrive}
			class="group relative btn-ghost {isConnectingDrive ? 'btn-disabled' : ''}"
			aria-label="Connect to Google Drive"
			title="Connect to Google Drive"
		>
			<IconBrandGoogleDrive
				size={20}
				class={$isGoogleAuthenticated ? 'navbar-icon-active' : ''}
			/>
			<span class="tooltip">
				{$isGoogleAuthenticated ? 'Open Google Drive' : 'Connect to Google Drive'}
			</span>
		</button>

		{#if $storageType === 'local' && $directoryHandle}
			<button
				onclick={handleDisconnectLocal}
				class="group relative btn-ghost-danger"
				aria-label="Close local directory"
				title="Close local directory"
			>
				<IconX size={20} class="text-danger" />
				<span class="tooltip">Close local directory</span>
			</button>
		{/if}

		{#if $isGoogleAuthenticated}
			<button
				onclick={handleDisconnectGoogleDrive}
				class="group relative btn-ghost-danger"
				aria-label="Disconnect from Google Drive"
				title="Disconnect from Google Drive"
			>
				<IconX size={20} class="text-danger" />
				<span class="tooltip">Disconnect Google Drive</span>
			</button>
		{/if}
	</div>
</nav>
