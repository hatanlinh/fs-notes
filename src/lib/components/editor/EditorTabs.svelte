<script lang="ts">
	import { tabs } from '$lib/stores/tabs';
	import EditorTab from './EditorTab.svelte';
</script>

{#if $tabs.length > 0}
	<div class="flex items-center gap-x-1 border-b border-gray-700 bg-gray-800 px-1 py-1 pt-1">
		{#each $tabs as tab (tab.id)}
			<EditorTab {tab} />
		{/each}
	</div>
{/if}
