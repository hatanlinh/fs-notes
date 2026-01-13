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
		if (/[<>:"/\\|?*\x00-\x1F]/g.test(inputValue)) {
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
		class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
		onclick={handleBackdropClick}
		onkeydown={handleBackdropKeyDown}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Save File</h2>
				<button
					onclick={handleCancel}
					class="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
					aria-label="Close"
				>
					<IconX size={20} />
				</button>
			</div>

			<form onsubmit={handleSubmit}>
				<div class="mb-4">
					<label
						for="fileName"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						File Name
					</label>
					<input
						type="text"
						id="fileName"
						bind:value={inputValue}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
						placeholder="Enter file name"
					/>
					{#if error}
						<p class="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
					{/if}
				</div>

				<p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
					The file will be saved in the currently opened folder.
				</p>

				<div class="flex justify-end gap-2">
					<button
						type="button"
						onclick={handleCancel}
						class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
					>
						Save
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
