<script lang="ts">
	import { IconFolderOpen } from '@tabler/icons-svelte';
	import { selectDirectory } from '$lib/stores/directory';
	import { buildFileTree } from '$lib/services/file-system';
	import { setFileTree } from '$lib/stores/file-tree';

	async function handleOpenFolder() {
		const handle = await selectDirectory();
		if (handle) {
			const tree = await buildFileTree(handle);
			setFileTree(tree);
		}
	}
</script>

<nav class="flex h-12 items-center border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900">
	<div class="flex items-center gap-4">
		<h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100">FS Notes</h1>

		<button
			onclick={handleOpenFolder}
			class="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
		>
			<IconFolderOpen size={18} />
			Open Folder
		</button>
	</div>
</nav>
