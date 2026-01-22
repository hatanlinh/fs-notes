<script lang="ts">
	import { IconPlus } from '@tabler/icons-svelte';
	import { tabs, createNewTab } from '$lib/stores/tabs';
	import EditorTab from './EditorTab.svelte';

	function handleNewTab() {
		createNewTab();
	}
</script>

<div class="tabs-container">
	{#if $tabs.length > 0}
		{#each $tabs as tab (tab.id)}
			<EditorTab {tab} />
		{/each}
	{/if}

	<button
		onclick={handleNewTab}
		class="btn-tab-new"
		aria-label="New tab"
		title="New tab"
	>
		<IconPlus size={16} />
	</button>
</div>
