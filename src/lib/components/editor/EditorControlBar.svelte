<script lang="ts">
	import {
		IconArrowNarrowLeft,
		IconArrowNarrowRight,
		IconDeviceFloppy,
		IconBoxMultiple,
		IconLoader,
		IconCheck
	} from '@tabler/icons-svelte';
	import { tabs, activeTab } from '$lib/stores/tabs';
	import { loadingState } from '$lib/stores/loading';

	interface Props {
		onUndo?: () => void;
		onRedo?: () => void;
		onSave?: () => void;
		onSaveAll?: () => void;
	}

	let { onUndo, onRedo, onSave, onSaveAll }: Props = $props();

	const hasDirtyTabs = $derived($tabs.some((tab) => tab.isDirty));
	const isActiveTabDirty = $derived($activeTab?.isDirty || $activeTab?.isUnsaved || false);
	const isLoading = $derived(
		$loadingState.some(
			(s) =>
				s.operation === 'file-save' || s.operation === 'file-load' || s.operation === 'file-create'
		)
	);

	let showSuccess = $state(false);
	let wasLoading = $state(false);

	$effect(() => {
		if (wasLoading && !isLoading) {
			showSuccess = true;
			setTimeout(() => {
				showSuccess = false;
			}, 500);
		}
		wasLoading = isLoading;
	});
</script>

<div class="flex items-center">
	<button
		onclick={onUndo}
		class="flex items-center rounded-l-md border border-gray-200 bg-white px-3 py-2 text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
		title="Undo (Ctrl+Z)"
		aria-label="Undo"
	>
		<IconArrowNarrowLeft size={20} />
	</button>

	<button
		onclick={onRedo}
		class="flex items-center border border-l-0 border-gray-200 bg-white px-3 py-2 text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
		title="Redo (Ctrl+Y)"
		aria-label="Redo"
	>
		<IconArrowNarrowRight size={20} />
	</button>

	<button
		onclick={onSave}
		disabled={!isActiveTabDirty}
		class="flex items-center border border-l-0 border-gray-200 bg-white px-3 py-2 text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-75 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
		title="Save (Ctrl+S)"
		aria-label="Save"
	>
		<IconDeviceFloppy
			size={20}
			class={isActiveTabDirty ? 'text-blue-600 dark:text-blue-400' : ''}
		/>
	</button>

	<button
		onclick={onSaveAll}
		disabled={!hasDirtyTabs}
		class="flex items-center rounded-r-md border border-l-0 border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-75 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
		title="Save All (Ctrl+Shift+S)"
		aria-label="Save All"
	>
		<IconBoxMultiple size={20} />
	</button>

	{#if isLoading}
		<div class="ml-2 flex items-center">
			<IconLoader size={20} class="animate-spin text-blue-600 dark:text-blue-400" />
		</div>
	{:else if showSuccess}
		<div class="ml-2 flex items-center">
			<IconCheck size={20} class="text-blue-600 dark:text-blue-400" />
		</div>
	{/if}
</div>
