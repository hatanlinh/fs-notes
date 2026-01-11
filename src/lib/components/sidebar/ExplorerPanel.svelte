<script lang="ts">
	import FileTree from './FileTree.svelte';
	import { directoryHandle } from '$lib/stores/directory';
</script>

<aside class="flex w-64 flex-col p-2">
	<div
		class="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
	>
		<!-- Header with root folder name -->
		<div class="flex h-10 items-center border-b border-gray-200 px-4 dark:border-gray-700">
			<h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
				{$directoryHandle?.name ?? 'Open a directory to view files'}
			</h2>
		</div>

		<!-- File Tree -->
		<FileTree />
	</div>
</aside>
