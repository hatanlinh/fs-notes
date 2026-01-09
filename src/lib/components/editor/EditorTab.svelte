<script lang="ts">
	import { IconX } from '@tabler/icons-svelte';
	import type { TabInfo } from '$lib/types';
	import { closeTab, activeTabId } from '$lib/stores/tabs';

	interface Props {
		tab: TabInfo;
	}

	let { tab }: Props = $props();

	let isActive = $derived($activeTabId === tab.id);

	function handleClose(e: MouseEvent) {
		e.stopPropagation();
		closeTab(tab.id);
	}

	function handleClick() {
		activeTabId.set(tab.id);
	}
</script>

<div
	class="group flex items-center gap-2 border-r border-gray-200 text-sm transition-colors dark:border-gray-700 {isActive
		? 'bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100'
		: 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'}"
>
	<button
		onclick={handleClick}
		class="flex flex-1 items-center gap-2 px-4 py-2"
	>
		<span class="max-w-[120px] truncate">{tab.file.name}</span>
		{#if tab.isDirty}
			<span class="h-2 w-2 rounded-full bg-orange-500"></span>
		{/if}
	</button>

	<button
		onclick={handleClose}
		class="mr-2 flex-shrink-0 rounded p-0.5 opacity-0 hover:bg-gray-300 group-hover:opacity-100 dark:hover:bg-gray-600"
		aria-label="Close tab"
	>
		<IconX size={14} />
	</button>
</div>
