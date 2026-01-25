<script lang="ts">
	import {
		IconFile,
		IconFolder,
		IconFolderOpen,
		IconChevronRight,
		IconChevronDown,
		IconLoader
	} from '@tabler/icons-svelte';
	import type { FileNode } from '$lib/types';
	import { openTab } from '$lib/stores/tabs';
	import { readFile } from '$lib/services/file-system';
	import { readDriveFile } from '$lib/services/google-drive';
	import { loadingState } from '$lib/stores/loading';
	import FileTreeItem from './FileTreeItem.svelte';

	interface Props {
		node: FileNode;
		level?: number;
	}

	let { node, level = 0 }: Props = $props();

	let isExpanded = $state(false);

	const isLoading = $derived(
		$loadingState.some(
			(s) =>
				s.operation === 'file-load' && (s.fileId === node.driveId || s.fileId === node.handle?.name)
		)
	);

	function toggleExpand() {
		if (node.type === 'directory') {
			isExpanded = !isExpanded;
		}
	}

	async function handleClick() {
		if (node.type === 'file') {
			try {
				let content: string;

				if (node.storageType === 'google-drive' && node.driveId) {
					content = await readDriveFile(node.driveId);
				} else if (node.handle) {
					const handle = node.handle as FileSystemFileHandle;
					content = await readFile(handle);
				} else {
					throw new Error('No file handle or Drive ID available');
				}

				openTab(node, content);
			} catch (err) {
				console.error('Error opening file:', err);
				alert(`Failed to open file: ${err instanceof Error ? err.message : 'Unknown error'}`);
			}
		} else {
			toggleExpand();
		}
	}

	function getIndentStyle(level: number) {
		return `padding-left: ${level * 16 + 8}px`;
	}
</script>

<div class="tree-item-container">
	<button onclick={handleClick} class="btn-tree-item" style={getIndentStyle(level)}>
		{#if node.type === 'directory'}
			<span class="tree-item-chevron">
				{#if isExpanded}
					<IconChevronDown size={16} />
				{:else}
					<IconChevronRight size={16} />
				{/if}
			</span>
		{:else}
			<span class="w-4"></span>
		{/if}

		<span class="tree-item-icon">
			{#if isLoading}
				<IconLoader size={16} class="tree-item-icon-loading" />
			{:else if node.type === 'directory'}
				{#if isExpanded}
					<IconFolderOpen size={16} />
				{:else}
					<IconFolder size={16} />
				{/if}
			{:else}
				<IconFile size={16} />
			{/if}
		</span>

		<span class="tree-item-name">{node.name}</span>
	</button>

	{#if node.type === 'directory' && isExpanded && node.children}
		{#each node.children as child (child.path)}
			<FileTreeItem node={child} level={level + 1} />
		{/each}
	{/if}
</div>
