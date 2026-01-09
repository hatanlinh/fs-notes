<script lang="ts">
	import { activeTab, updateTabContent, markTabSaved } from '$lib/stores/tabs';
	import { writeFile } from '$lib/services/file-system';
	import EditorTabs from './EditorTabs.svelte';
	import TextEditor from './TextEditor.svelte';

	async function handleContentChange(content: string) {
		if ($activeTab) {
			updateTabContent($activeTab.id, content);
		}
	}

	async function handleCursorChange(line: number, column: number) {
		if ($activeTab) {
			// Update cursor position in the active tab
			activeTab.update((tab) => {
				if (tab) {
					return {
						...tab,
						cursorPosition: { line, column }
					};
				}
				return tab;
			});
		}
	}

	// Auto-save functionality (debounced)
	let saveTimeout: ReturnType<typeof setTimeout>;
	$effect(() => {
		if ($activeTab?.isDirty) {
			clearTimeout(saveTimeout);
			saveTimeout = setTimeout(async () => {
				if ($activeTab && $activeTab.isDirty) {
					try {
						const handle = $activeTab.file.handle as FileSystemFileHandle;
						await writeFile(handle, $activeTab.content);
						// Mark as saved
						markTabSaved($activeTab.id);
					} catch (err) {
						console.error('Error auto-saving file:', err);
					}
				}
			}, 1000);
		}
	});
</script>

<main class="flex flex-1 flex-col overflow-hidden bg-white dark:bg-gray-900">
	<!-- Tab Bar -->
	<EditorTabs />

	<!-- Editor Area -->
	<div class="flex-1 overflow-hidden">
		{#if $activeTab}
			<TextEditor
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
</main>
