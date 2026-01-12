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
	class="flex min-w-50 items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors {isActive
		? 'bg-gray-300 text-gray-600 dark:bg-gray-900 dark:text-gray-100'
		: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200'}"
>
	<button onclick={handleClick} class="flex min-w-0 flex-1 items-center gap-2">
		<span class="max-w-30 truncate">{tab.file.name}</span>
		{#if tab.isDirty}
			<span class="h-2 w-2 shrink-0 rounded-full bg-gray-400 dark:bg-gray-500"></span>
		{/if}
	</button>

	<button
		onclick={handleClose}
		class="shrink-0 rounded p-0.5 hover:bg-gray-300 dark:hover:bg-gray-600"
		aria-label="Close tab"
	>
		<IconX size={14} />
	</button>
</div>
