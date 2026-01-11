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

	// Dark theme
	const darkTheme = EditorView.theme(
		{
			'&': {
				height: '100%',
				fontSize: '14px',
				backgroundColor: '#111827'
			},
			'.cm-scroller': {
				overflow: 'auto',
				backgroundColor: '#111827'
			},
			'.cm-content': {
				padding: '16px',
				color: '#e5e7eb',
				caretColor: '#e5e7eb'
			},
			'.cm-gutters': {
				backgroundColor: '#1f2937',
				borderRight: '1px solid #374151',
				color: '#9ca3af'
			},
			'.cm-lineNumbers .cm-gutterElement': {
				color: '#9ca3af'
			},
			'.cm-activeLine': {
				backgroundColor: '#1f293780'
			},
			'.cm-activeLineGutter': {
				backgroundColor: '#1f2937'
			},
			'&.cm-focused .cm-cursor': {
				borderLeftColor: '#e5e7eb'
			},
			'&.cm-focused .cm-selectionBackground, ::selection': {
				backgroundColor: '#374151'
			}
		},
		{ dark: true }
	);

	onMount(() => {
		// Create editor state
		const startState = EditorState.create({
			doc: content,
			extensions: [
				basicSetup,
				markdown(),
				darkTheme,
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
