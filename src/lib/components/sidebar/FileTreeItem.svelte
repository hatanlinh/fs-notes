<script lang="ts">
	import { IconFile, IconFolder, IconFolderOpen, IconChevronRight, IconChevronDown } from '@tabler/icons-svelte';
	import type { FileNode } from '$lib/types';
	import { openTab } from '$lib/stores/tabs';
	import { readFile } from '$lib/services/file-system';
	import FileTreeItem from './FileTreeItem.svelte';

	interface Props {
		node: FileNode;
		level?: number;
	}

	let { node, level = 0 }: Props = $props();

	let isExpanded = $state(false);

	function toggleExpand() {
		if (node.type === 'directory') {
			isExpanded = !isExpanded;
		}
	}

	async function handleClick() {
		if (node.type === 'file') {
			// Open file in editor
			try {
				const handle = node.handle as FileSystemFileHandle;
				const content = await readFile(handle);
				openTab(node, content);
			} catch (err) {
				console.error('Error opening file:', err);
			}
		} else {
			// Toggle directory expansion
			toggleExpand();
		}
	}

	function getIndentStyle(level: number) {
		return `padding-left: ${level * 16 + 8}px`;
	}
</script>

<div class="select-none">
	<!-- Current Node -->
	<button
		onclick={handleClick}
		class="flex w-full items-center gap-1 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
		style={getIndentStyle(level)}
	>
		<!-- Chevron for directories -->
		{#if node.type === 'directory'}
			<span class="flex-shrink-0 text-gray-500">
				{#if isExpanded}
					<IconChevronDown size={16} />
				{:else}
					<IconChevronRight size={16} />
				{/if}
			</span>
		{:else}
			<span class="w-4"></span>
		{/if}

		<!-- Icon -->
		<span class="flex-shrink-0 text-gray-600 dark:text-gray-400">
			{#if node.type === 'directory'}
				{#if isExpanded}
					<IconFolderOpen size={16} />
				{:else}
					<IconFolder size={16} />
				{/if}
			{:else}
				<IconFile size={16} />
			{/if}
		</span>

		<!-- Name -->
		<span class="truncate text-gray-800 dark:text-gray-200">{node.name}</span>
	</button>

	<!-- Children (if directory is expanded) -->
	{#if node.type === 'directory' && isExpanded && node.children}
		{#each node.children as child (child.path)}
			<FileTreeItem node={child} level={level + 1} />
		{/each}
	{/if}
</div>
