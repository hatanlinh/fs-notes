<script lang="ts">
	import { activeTab } from '$lib/stores/tabs';
</script>

<div class="statusbar">
	<div class="statusbar-left">
		{#if $activeTab}
			<span class="font-medium"
				>{$activeTab.file ? $activeTab.file.name : $activeTab.defaultFileName || 'Untitled'}</span
			>
			{#if $activeTab.isDirty || $activeTab.isUnsaved}
				<span class="statusbar-status">● Modified</span>
			{/if}
		{:else}
			<span class="text-gray-400">No file open</span>
		{/if}
	</div>

	<div class="statusbar-right">
		{#if $activeTab?.cursorPosition}
			<span>Ln {$activeTab.cursorPosition.line}, Col {$activeTab.cursorPosition.column}</span>
		{/if}
		<span>UTF-8</span>
	</div>
</div>
