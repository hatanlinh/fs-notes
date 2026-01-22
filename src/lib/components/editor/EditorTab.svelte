<script lang="ts">
	import { IconX } from '@tabler/icons-svelte';
	import type { TabInfo } from '$lib/types';
	import { closeTab, activeTabId } from '$lib/stores/tabs';

	interface Props {
		tab: TabInfo;
	}

	let { tab }: Props = $props();

	let isActive = $derived($activeTabId === tab.id);
	let displayName = $derived(tab.file ? tab.file.name : tab.defaultFileName || 'Untitled');

	function handleClose(e: MouseEvent) {
		e.stopPropagation();
		closeTab(tab.id);
	}

	function handleClick() {
		activeTabId.set(tab.id);
	}
</script>

<div class="tab {isActive ? 'tab-active' : 'tab-inactive'}" title={displayName}>
	<button onclick={handleClick} class="btn-tab-select">
		<span class="tab-label {tab.isUnsaved ? 'tab-label-unsaved' : ''}">{displayName}</span>
		{#if tab.isDirty || tab.isUnsaved}
			<span class="tab-indicator"></span>
		{/if}
	</button>

	<button onclick={handleClose} class="btn-icon-close" aria-label="Close tab">
		<IconX size={14} />
	</button>
</div>
