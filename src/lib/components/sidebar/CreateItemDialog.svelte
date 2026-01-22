<script lang="ts">
	import { IconX } from '@tabler/icons-svelte';

	interface Props {
		isOpen: boolean;
		itemType: 'file' | 'directory';
		onClose: () => void;
		onCreate: (name: string) => void;
	}

	let { isOpen = $bindable(false), itemType, onClose, onCreate }: Props = $props();

	let inputValue = $state('');
	let inputElement = $state<HTMLInputElement>();

	function handleSubmit(e: Event) {
		e.preventDefault();
		const trimmedName = inputValue.trim();
		if (trimmedName) {
			onCreate(trimmedName);
			inputValue = '';
			isOpen = false;
		}
	}

	function handleCancel() {
		inputValue = '';
		onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleCancel();
		}
	}

	$effect(() => {
		if (isOpen && inputElement) {
			setTimeout(() => inputElement?.focus(), 0);
		}
	});
</script>

{#if isOpen}
	<div
		class="dialog-backdrop"
		onclick={handleCancel}
		onkeydown={handleKeydown}
		role="button"
		tabindex="-1"
	>
		<div
			class="dialog-container-small"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			tabindex="0"
		>
			<div class="dialog-header">
				<h3 class="dialog-title-small">
					New {itemType === 'file' ? 'File' : 'Directory'}
				</h3>
				<button onclick={handleCancel} class="btn-dialog-close" aria-label="Close">
					<IconX size={20} />
				</button>
			</div>

			<form onsubmit={handleSubmit}>
				<div class="dialog-content">
					<label for="item-name" class="label-base">
						{itemType === 'file' ? 'File' : 'Directory'} name
					</label>
					<input
						bind:this={inputElement}
						bind:value={inputValue}
						type="text"
						id="item-name"
						class="input-text"
						placeholder={itemType === 'file' ? 'example.txt' : 'my-folder'}
					/>
				</div>

				<div class="dialog-footer">
					<button type="button" onclick={handleCancel} class="btn-secondary">Cancel</button>
					<button type="submit" class="btn-primary">Create</button>
				</div>
			</form>
		</div>
	</div>
{/if}
