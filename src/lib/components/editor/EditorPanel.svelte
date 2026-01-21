<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { activeTab, updateTabContent, markTabSaved, tabs, updateTabFile } from '$lib/stores/tabs';
	import { writeFile, createFile, buildFileTree } from '$lib/services/file-system';
	import { directoryHandle, storageType, driveRootFolderId } from '$lib/stores/directory';
	import { setFileTree } from '$lib/stores/file-tree';
	import type { FileNode } from '$lib/types';
	import { writeDriveFile, createDriveFile, buildDriveFileTree } from '$lib/services/google-drive';
	import EditorTabs from './EditorTabs.svelte';
	import EditorControlBar from './EditorControlBar.svelte';
	import TextEditor from './TextEditor.svelte';
	import SaveDialog from './SaveDialog.svelte';

	let editorComponent: TextEditor | null = $state(null);
	let showSaveDialog = $state(false);
	let currentSavingTabId = $state<string | null>(null);

	async function handleContentChange(content: string) {
		if ($activeTab) {
			updateTabContent($activeTab.id, content);
		}
	}

	async function handleCursorChange(line: number, column: number) {
		if ($activeTab) {
			tabs.update((currentTabs) => {
				return currentTabs.map((tab) => {
					if (tab.id === $activeTab?.id) {
						return {
							...tab,
							cursorPosition: { line, column }
						};
					}
					return tab;
				});
			});
		}
	}

	async function handleSave() {
		if (!$activeTab) return;

		if ($activeTab.isUnsaved) {
			currentSavingTabId = $activeTab.id;
			showSaveDialog = true;
			return;
		}

		if ($activeTab.isDirty && $activeTab.file) {
			try {
				if ($activeTab.file.storageType === 'google-drive' && $activeTab.file.driveId) {
					await writeDriveFile($activeTab.file.driveId, $activeTab.content);
					markTabSaved($activeTab.id);
				} else if ($activeTab.file.handle) {
					const handle = $activeTab.file.handle as FileSystemFileHandle;
					await writeFile(handle, $activeTab.content);
					markTabSaved($activeTab.id);
				}
			} catch (err) {
				console.error('Error saving file:', err);
			}
		}
	}

	async function handleSaveNewFile(fileName: string) {
		if (!currentSavingTabId) {
			console.error('Cannot save: no tab ID');
			return;
		}

		if (!$directoryHandle && !$driveRootFolderId) {
			console.error('Cannot save: no storage configured (local or Google Drive)');
			alert('Please open a local directory or connect to Google Drive first');
			return;
		}

		const tab = $tabs.find((t) => t.id === currentSavingTabId);
		if (!tab) return;

		try {
			let newFile: FileNode;

			if ($storageType === 'google-drive' && $driveRootFolderId) {
				const driveFile = await createDriveFile($driveRootFolderId, fileName, tab.content);

				newFile = {
					name: fileName,
					path: fileName,
					type: 'file',
					storageType: 'google-drive',
					driveId: driveFile.id,
					mimeType: driveFile.mimeType
				};

				const tree = await buildDriveFileTree($driveRootFolderId);
				setFileTree(tree);
			} else if ($directoryHandle) {
				const fileHandle = await createFile($directoryHandle, fileName);
				await writeFile(fileHandle, tab.content);

				newFile = {
					name: fileName,
					path: fileName,
					type: 'file',
					storageType: 'local',
					handle: fileHandle
				};

				const tree = await buildFileTree($directoryHandle);
				setFileTree(tree);
			} else {
				throw new Error('No storage available');
			}

			updateTabFile(currentSavingTabId, newFile);

			currentSavingTabId = null;
			showSaveDialog = false;
		} catch (err) {
			console.error('Error saving new file:', err);
			alert(`Failed to save file: ${err instanceof Error ? err.message : 'Unknown error'}`);
		}
	}

	function handleCloseSaveDialog() {
		showSaveDialog = false;
		currentSavingTabId = null;
	}

	async function handleSaveAll() {
		const dirtyTabs = $tabs.filter((tab) => tab.isDirty && !tab.isUnsaved);
		for (const tab of dirtyTabs) {
			if (tab.file) {
				try {
					const handle = tab.file.handle as FileSystemFileHandle;
					await writeFile(handle, tab.content);
					markTabSaved(tab.id);
				} catch (err) {
					console.error('Error saving file:', tab.file.name, err);
				}
			}
		}

		// Note: Unsaved tabs are not saved in "Save All" - they need explicit save with file name
		const unsavedTabs = $tabs.filter((tab) => tab.isUnsaved);
		if (unsavedTabs.length > 0) {
			console.log('Note: Unsaved tabs require a file name and must be saved individually');
		}
	}

	function handleUndo() {
		if (editorComponent) {
			editorComponent.undo();
		}
	}

	function handleRedo() {
		if (editorComponent) {
			editorComponent.redo();
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 's' && !e.shiftKey) {
			e.preventDefault();
			handleSave();
		} else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
			e.preventDefault();
			handleSaveAll();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeyDown);
	});

	// Auto-save disabled - use Ctrl+S to save manually
	// let saveTimeout: ReturnType<typeof setTimeout>;
	// $effect(() => {
	// 	if ($activeTab?.isDirty) {
	// 		clearTimeout(saveTimeout);
	// 		saveTimeout = setTimeout(async () => {
	// 			if ($activeTab && $activeTab.isDirty) {
	// 				try {
	// 					const handle = $activeTab.file.handle as FileSystemFileHandle;
	// 					await writeFile(handle, $activeTab.content);
	// 					// Mark as saved
	// 					markTabSaved($activeTab.id);
	// 				} catch (err) {
	// 					console.error('Error auto-saving file:', err);
	// 				}
	// 			}
	// 		}, 1000);
	// 	}
	// });
</script>

<main class="flex flex-1 flex-col overflow-hidden py-2 pr-2">
	<div class="flex pb-1">
		<!-- Control Bar -->
		<EditorControlBar
			onUndo={handleUndo}
			onRedo={handleRedo}
			onSave={handleSave}
			onSaveAll={handleSaveAll}
		/>
	</div>

	<div class="flex h-full flex-col overflow-hidden rounded-md bg-white dark:bg-gray-900">
		<!-- Tab Bar -->
		<EditorTabs />

		<!-- Editor Area -->
		<div class="flex-1 overflow-hidden">
			{#if $activeTab}
				{#key $activeTab.id}
					<TextEditor
						bind:this={editorComponent}
						content={$activeTab.content}
						onContentChange={handleContentChange}
						onCursorChange={handleCursorChange}
					/>
				{/key}
			{:else}
				<div class="flex h-full items-center justify-center text-gray-500">
					<div class="text-center">
						<p class="text-lg">No file open</p>
						<p class="mt-2 text-sm">Open a file from the explorer to start editing</p>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Save Dialog for unsaved tabs -->
	<SaveDialog
		bind:isOpen={showSaveDialog}
		onClose={handleCloseSaveDialog}
		onSave={handleSaveNewFile}
		defaultFileName={$activeTab?.defaultFileName || 'untitled.txt'}
	/>
</main>
