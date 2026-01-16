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
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		onclick={handleCancel}
		onkeydown={handleKeydown}
		role="button"
		tabindex="-1"
	>
		<div
			class="w-96 rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			tabindex="0"
		>
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
					New {itemType === 'file' ? 'File' : 'Directory'}
				</h3>
				<button
					onclick={handleCancel}
					class="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
					aria-label="Close"
				>
					<IconX size={20} />
				</button>
			</div>

			<form onsubmit={handleSubmit}>
				<div class="mb-4">
					<label
						for="item-name"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						{itemType === 'file' ? 'File' : 'Directory'} name
					</label>
					<input
						bind:this={inputElement}
						bind:value={inputValue}
						type="text"
						id="item-name"
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
						placeholder={itemType === 'file' ? 'example.txt' : 'my-folder'}
					/>
				</div>

				<div class="flex justify-end gap-2">
					<button
						type="button"
						onclick={handleCancel}
						class="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-800"
					>
						Create
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
