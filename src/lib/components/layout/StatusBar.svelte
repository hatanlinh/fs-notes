<script lang="ts">
	import { activeTab } from '$lib/stores/tabs';
</script>

<div
	class="flex h-6 items-center justify-between border-t border-gray-200 bg-gray-50 px-4 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
>
	<div class="flex items-center gap-4">
		{#if $activeTab}
			<span class="font-medium">{$activeTab.file.name}</span>
			{#if $activeTab.isDirty}
				<span class="text-gray-500 dark:text-gray-400">● Modified</span>
			{/if}
		{:else}
			<span class="text-gray-400">No file open</span>
		{/if}
	</div>

	<div class="flex items-center gap-4">
		{#if $activeTab?.cursorPosition}
			<span>Ln {$activeTab.cursorPosition.line}, Col {$activeTab.cursorPosition.column}</span>
		{/if}
		<span>UTF-8</span>
	</div>
</div>
