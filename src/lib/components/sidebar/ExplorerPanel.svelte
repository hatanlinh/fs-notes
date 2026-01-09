<script lang="ts">
	import FileTree from './FileTree.svelte';
</script>

<aside class="flex w-64 flex-col border-r border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
	<!-- Header -->
	<div class="flex h-10 items-center border-b border-gray-200 px-4 dark:border-gray-700">
		<h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300">EXPLORER</h2>
	</div>

	<!-- File Tree -->
	<FileTree />
</aside>
