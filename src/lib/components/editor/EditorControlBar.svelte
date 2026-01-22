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

<div class="editor-control-bar">
	<button
		onclick={onUndo}
		class="editor-control-btn-left"
		title="Undo (Ctrl+Z)"
		aria-label="Undo"
	>
		<IconArrowNarrowLeft size={20} />
	</button>

	<button
		onclick={onRedo}
		class="editor-control-btn-middle"
		title="Redo (Ctrl+Y)"
		aria-label="Redo"
	>
		<IconArrowNarrowRight size={20} />
	</button>

	<button
		onclick={onSave}
		disabled={!isActiveTabDirty}
		class="editor-control-btn-middle"
		title="Save (Ctrl+S)"
		aria-label="Save"
	>
		<IconDeviceFloppy
			size={20}
			class={isActiveTabDirty ? 'editor-control-icon-active' : ''}
		/>
	</button>

	<button
		onclick={onSaveAll}
		disabled={!hasDirtyTabs}
		class="editor-control-btn-right"
		title="Save All (Ctrl+Shift+S)"
		aria-label="Save All"
	>
		<IconBoxMultiple size={20} />
	</button>

	{#if isLoading}
		<div class="editor-control-status">
			<IconLoader size={20} class="editor-control-spinner" />
		</div>
	{:else if showSuccess}
		<div class="editor-control-status">
			<IconCheck size={20} class="editor-control-success" />
		</div>
	{/if}
</div>
