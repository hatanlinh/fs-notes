<script lang="ts">
	import {
		IconArrowNarrowLeft,
		IconArrowNarrowRight,
		IconDeviceFloppy,
		IconBoxMultiple
	} from '@tabler/icons-svelte';
	import { tabs, activeTab } from '$lib/stores/tabs';

	interface Props {
		onUndo?: () => void;
		onRedo?: () => void;
		onSave?: () => void;
		onSaveAll?: () => void;
	}

	let { onUndo, onRedo, onSave, onSaveAll }: Props = $props();

	// Check if there are any dirty tabs
	const hasDirtyTabs = $derived($tabs.some((tab) => tab.isDirty));
	const isActiveTabDirty = $derived($activeTab?.isDirty || $activeTab?.isUnsaved || false);
</script>

<!-- Undo Button -->
<button
	onclick={onUndo}
	class="flex items-center rounded-l-md border border-gray-200 bg-white px-3 py-2 text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
	title="Undo (Ctrl+Z)"
	aria-label="Undo"
>
	<IconArrowNarrowLeft size={20} />
</button>

<!-- Redo Button -->
<button
	onclick={onRedo}
	class="flex items-center border border-l-0 border-gray-200 bg-white px-3 py-2 text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
	title="Redo (Ctrl+Y)"
	aria-label="Redo"
>
	<IconArrowNarrowRight size={20} />
</button>

<!-- Save Button -->
<button
	onclick={onSave}
	disabled={!isActiveTabDirty}
	class="flex items-center border border-l-0 border-gray-200 bg-white px-3 py-2 text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-75 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
	title="Save (Ctrl+S)"
	aria-label="Save"
>
	<IconDeviceFloppy size={20} class={isActiveTabDirty ? 'text-blue-600 dark:text-blue-400' : ''} />
</button>

<!-- Save All Button -->
<button
	onclick={onSaveAll}
	disabled={!hasDirtyTabs}
	class="flex items-center rounded-r-md border border-l-0 border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-75 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
	title="Save All (Ctrl+Shift+S)"
	aria-label="Save All"
>
	<IconBoxMultiple size={20} />
</button>
