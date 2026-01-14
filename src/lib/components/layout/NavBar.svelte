<script lang="ts">
	import { IconFolderOpen, IconBrandGoogleDrive, IconX } from '@tabler/icons-svelte';
	import {
		selectDirectory,
		driveRootFolderId,
		driveRootFolderName,
		storageType
	} from '$lib/stores/directory';
	import { buildFileTree } from '$lib/services/file-system';
	import { setFileTree, clearFileTree } from '$lib/stores/file-tree';
	import { isGoogleAuthenticated } from '$lib/stores/google-auth';
	import { signInWithGoogle, disconnectGoogleDrive } from '$lib/services/google-auth';
	import { buildDriveFileTree, findOrCreateFsNotesFolder } from '$lib/services/google-drive';

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

			// Sign in if not already authenticated
			if (!$isGoogleAuthenticated) {
				await signInWithGoogle();
			}

			// Find or create fs-notes folder
			const fsNotesFolder = await findOrCreateFsNotesFolder();
			driveRootFolderId.set(fsNotesFolder.id);
			driveRootFolderName.set(fsNotesFolder.name);
			storageType.set('google-drive');

			// Build file tree from fs-notes folder
			const tree = await buildDriveFileTree(fsNotesFolder.id);
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

			// Clear Drive-related stores
			driveRootFolderId.set(null);
			driveRootFolderName.set(null);
			storageType.set('local');
			clearFileTree();
		} catch (error) {
			console.error('Error disconnecting from Google Drive:', error);
		}
	}
</script>

<nav
	class="flex h-12 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900"
>
	<!-- Left side: Title -->
	<div class="flex items-center">
		<h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100">fs-notes</h1>
	</div>

	<!-- Right side: Control buttons -->
	<div class="flex items-center gap-2">
		<button
			onclick={handleOpenDirectory}
			class="group relative flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-800"
			aria-label="Open local directory"
			title="Open local directory"
		>
			<IconFolderOpen size={20} />

			<!-- Tooltip -->
			<span
				class="pointer-events-none absolute right-0 bottom-full mb-2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-700"
			>
				Open local directory
			</span>
		</button>

		<!-- Google Drive Button -->
		<button
			onclick={handleConnectGoogleDrive}
			disabled={isConnectingDrive}
			class="group relative flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"
			aria-label="Connect to Google Drive"
			title="Connect to Google Drive"
		>
			<IconBrandGoogleDrive
				size={20}
				class={$isGoogleAuthenticated ? 'text-blue-600 dark:text-blue-400' : ''}
			/>

			<!-- Connected indicator -->
			{#if $isGoogleAuthenticated}
				<span
					class="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-900"
				></span>
			{/if}

			<!-- Tooltip -->
			<span
				class="pointer-events-none absolute right-0 bottom-full mb-2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-700"
			>
				{$isGoogleAuthenticated ? 'Open Google Drive' : 'Connect to Google Drive'}
			</span>
		</button>

		<!-- Disconnect Google Drive Button -->
		{#if $isGoogleAuthenticated}
			<button
				onclick={handleDisconnectGoogleDrive}
				class="group relative flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:outline-none dark:text-gray-300 dark:hover:bg-red-900/20"
				aria-label="Disconnect from Google Drive"
				title="Disconnect from Google Drive"
			>
				<IconX size={20} class="text-red-600 dark:text-red-400" />

				<!-- Tooltip -->
				<span
					class="pointer-events-none absolute right-0 bottom-full mb-2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-700"
				>
					Disconnect Google Drive
				</span>
			</button>
		{/if}
	</div>
</nav>
