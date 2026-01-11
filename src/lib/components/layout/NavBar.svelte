<script lang="ts">
	import { IconFolderOpen } from '@tabler/icons-svelte';
	import { selectDirectory } from '$lib/stores/directory';
	import { buildFileTree } from '$lib/services/file-system';
	import { setFileTree } from '$lib/stores/file-tree';

	async function handleOpenDirectory() {
		const handle = await selectDirectory();
		if (handle) {
			const tree = await buildFileTree(handle);
			setFileTree(tree);
		}
	}
</script>

<nav
	class="flex h-12 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900"
>
	<!-- Left side: Title -->
	<div class="flex items-center">
		<h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100">fs-notes</h1>
	</div>

	<!-- Right side: Control buttons -->
	<div class="flex items-center gap-2">
		<button
			onclick={handleOpenDirectory}
			class="group relative flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-800"
			aria-label="Open local directory"
			title="Open local directory"
		>
			<IconFolderOpen size={20} />

			<!-- Tooltip -->
			<span
				class="pointer-events-none absolute right-0 bottom-full mb-2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-700"
			>
				Open local directory
			</span>
		</button>
	</div>
</nav>
