<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { activeTab, updateTabContent, markTabSaved, tabs } from '$lib/stores/tabs';
	import { writeFile } from '$lib/services/file-system';
	import EditorTabs from './EditorTabs.svelte';
	import EditorControlBar from './EditorControlBar.svelte';
	import TextEditor from './TextEditor.svelte';

	let editorComponent: TextEditor | null = $state(null);

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

	// Save current active tab
	async function handleSave() {
		if ($activeTab && $activeTab.isDirty) {
			try {
				const handle = $activeTab.file.handle as FileSystemFileHandle;
				await writeFile(handle, $activeTab.content);
				markTabSaved($activeTab.id);
			} catch (err) {
				console.error('Error saving file:', err);
			}
		}
	}

	async function handleSaveAll() {
		const dirtyTabs = $tabs.filter((tab) => tab.isDirty);
		for (const tab of dirtyTabs) {
			try {
				const handle = tab.file.handle as FileSystemFileHandle;
				await writeFile(handle, tab.content);
				markTabSaved(tab.id);
			} catch (err) {
				console.error('Error saving file:', tab.file.name, err);
			}
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
				<TextEditor
					bind:this={editorComponent}
					content={$activeTab.content}
					onContentChange={handleContentChange}
					onCursorChange={handleCursorChange}
				/>
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
</main>
