<script lang="ts">
	import { IconX } from '@tabler/icons-svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		onSave: (fileName: string) => void;
		defaultFileName?: string;
	}

	let {
		isOpen = $bindable(false),
		onClose,
		onSave,
		defaultFileName = 'untitled.txt'
	}: Props = $props();

	let inputValue = $state('');
	let error = $state('');

	$effect(() => {
		if (isOpen) {
			inputValue = defaultFileName;
		}
	});

	function handleSubmit(e: Event) {
		e.preventDefault();

		if (!inputValue.trim()) {
			error = 'File name cannot be empty';
			return;
		}

		// Basic validation for invalid characters
		// eslint-disable-next-line no-control-regex
		if (/[<>:"\\|?*\x00-\x1F]/g.test(inputValue)) {
			error = 'File name contains invalid characters';
			return;
		}

		error = '';
		onSave(inputValue.trim());
		isOpen = false;
		inputValue = '';
	}

	function handleCancel() {
		error = '';
		inputValue = '';
		onClose();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleCancel();
		}
	}

	function handleBackdropKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleCancel();
		}
	}
</script>

{#if isOpen}
	<div
		class="dialog-backdrop"
		onclick={handleBackdropClick}
		onkeydown={handleBackdropKeyDown}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="dialog-container">
			<div class="dialog-header">
				<h2 class="dialog-title">Save File</h2>
				<button onclick={handleCancel} class="btn-dialog-close" aria-label="Close">
					<IconX size={20} />
				</button>
			</div>

			<form onsubmit={handleSubmit}>
				<div class="dialog-content">
					<label for="fileName" class="label-base">File Name</label>
					<input
						type="text"
						id="fileName"
						bind:value={inputValue}
						class="input-text"
						placeholder="Enter file name"
					/>
					{#if error}
						<p class="error-message">{error}</p>
					{/if}
				</div>

				<p class="form-hint mb-4">The file will be saved in the currently opened folder.</p>

				<div class="dialog-footer">
					<button type="button" onclick={handleCancel} class="btn-secondary">Cancel</button>
					<button type="submit" class="btn-primary">Save</button>
				</div>
			</form>
		</div>
	</div>
{/if}
