<script lang="ts">
	import { IconPlus } from '@tabler/icons-svelte';
	import { tabs, createNewTab } from '$lib/stores/tabs';
	import EditorTab from './EditorTab.svelte';

	function handleNewTab() {
		createNewTab();
	}
</script>

<div
	class="flex items-center gap-x-1 border-b border-gray-200 bg-white px-1 py-1 pt-1 dark:border-gray-700 dark:bg-gray-800"
>
	{#if $tabs.length > 0}
		{#each $tabs as tab (tab.id)}
			<EditorTab {tab} />
		{/each}
	{/if}

	<button
		onclick={handleNewTab}
		class="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
		aria-label="New tab"
		title="New tab"
	>
		<IconPlus size={16} />
	</button>
</div>
