<script lang="ts">
	import { IconDeviceDesktop } from '@tabler/icons-svelte';
	import FileTree from './FileTree.svelte';
	import { directoryHandle } from '$lib/stores/directory';
</script>

<aside class="flex w-64 flex-col p-2">
	<div
		class="flex h-full flex-col overflow-hidden rounded-md border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
	>
		<!-- Header with root folder name -->
		<div class="flex h-10 items-center gap-2 border-b border-gray-200 px-4 dark:border-gray-700">
			{#if $directoryHandle}
				<IconDeviceDesktop size={20} class="shrink-0 text-gray-600 dark:text-gray-400" />
			{/if}
			<h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
				{$directoryHandle?.name ?? 'Open a directory to view files'}
			</h2>
		</div>

		<!-- File Tree -->
		<FileTree />
	</div>
</aside>
