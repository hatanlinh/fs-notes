<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { EditorView, basicSetup } from 'codemirror';
	import { EditorState } from '@codemirror/state';
	import { markdown } from '@codemirror/lang-markdown';

	interface Props {
		content?: string;
		onContentChange?: (content: string) => void;
		onCursorChange?: (line: number, column: number) => void;
	}

	let { content = '', onContentChange, onCursorChange }: Props = $props();

	let editorContainer: HTMLDivElement;
	let editorView: EditorView | null = null;

	onMount(() => {
		// Create editor state
		const startState = EditorState.create({
			doc: content,
			extensions: [
				basicSetup,
				markdown(),
				EditorView.updateListener.of((update) => {
					if (update.docChanged && onContentChange) {
						onContentChange(update.state.doc.toString());
					}

					// Update cursor position
					if (update.selectionSet && onCursorChange) {
						const pos = update.state.selection.main.head;
						const line = update.state.doc.lineAt(pos);
						const lineNumber = line.number;
						const column = pos - line.from + 1;
						onCursorChange(lineNumber, column);
					}
				})
			]
		});

		// Create editor view
		editorView = new EditorView({
			state: startState,
			parent: editorContainer
		});
	});

	onDestroy(() => {
		if (editorView) {
			editorView.destroy();
		}
	});

	// Update editor content when prop changes
	$effect(() => {
		if (editorView && content !== editorView.state.doc.toString()) {
			editorView.dispatch({
				changes: {
					from: 0,
					to: editorView.state.doc.length,
					insert: content
				}
			});
		}
	});
</script>

<div bind:this={editorContainer} class="h-full w-full"></div>

<style>
	:global(.cm-editor) {
		height: 100%;
		font-size: 14px;
	}

	:global(.cm-scroller) {
		overflow: auto;
	}

	:global(.cm-content) {
		padding: 16px;
	}
</style>
