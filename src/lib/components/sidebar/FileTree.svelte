<script lang="ts">
	import { fileTree } from '$lib/stores/file-tree';
	import FileTreeItem from './FileTreeItem.svelte';
</script>

{#if $fileTree.length > 0}
	<div class="explorer-content">
		{#each $fileTree as node (node.path)}
			<FileTreeItem {node} />
		{/each}
	</div>
{:else}
	<div class="explorer-empty">
		<p>No directory opened</p>
	</div>
{/if}
