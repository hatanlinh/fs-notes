<script lang="ts">
	import { fileTree } from '$lib/stores/file-tree';
	import FileTreeItem from './FileTreeItem.svelte';
</script>

{#if $fileTree.length > 0}
	<div class="flex-1 overflow-y-auto">
		{#each $fileTree as node (node.path)}
			<FileTreeItem {node} />
		{/each}
	</div>
{:else}
	<div class="flex flex-1 items-center justify-center p-4 text-sm text-gray-500">
		<p>No folder opened</p>
	</div>
{/if}
