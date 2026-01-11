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
	let themeObserver: MutationObserver | null = null;

	// Light theme
	const lightTheme = EditorView.theme({
		'&': {
			height: '100%',
			fontSize: '14px',
			backgroundColor: '#ffffff'
		},
		'.cm-scroller': {
			overflow: 'auto',
			backgroundColor: '#ffffff'
		},
		'.cm-scroller::-webkit-scrollbar': {
			width: '12px',
			height: '12px'
		},
		'.cm-scroller::-webkit-scrollbar-track': {
			backgroundColor: '#ffffff'
		},
		'.cm-scroller::-webkit-scrollbar-thumb': {
			backgroundColor: '#d1d5db',
			borderRadius: '6px',
			border: '2px solid #ffffff'
		},
		'.cm-scroller::-webkit-scrollbar-thumb:hover': {
			backgroundColor: '#9ca3af'
		},
		'.cm-scroller::-webkit-scrollbar-corner': {
			backgroundColor: '#ffffff'
		},
		'.cm-content': {
			padding: '16px',
			color: '#1f2937',
			caretColor: '#1f2937'
		},
		'.cm-gutters': {
			backgroundColor: '#f9fafb',
			borderRight: '1px solid #e5e7eb',
			color: '#6b7280'
		},
		'.cm-lineNumbers .cm-gutterElement': {
			color: '#6b7280'
		},
		'.cm-activeLine': {
			backgroundColor: '#f3f4f6'
		},
		'.cm-activeLineGutter': {
			backgroundColor: '#f3f4f6'
		},
		'&.cm-focused .cm-cursor': {
			borderLeftColor: '#1f2937'
		},
		'&.cm-focused .cm-selectionBackground, ::selection': {
			backgroundColor: '#dbeafe'
		}
	});

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
			'.cm-scroller::-webkit-scrollbar': {
				width: '12px',
				height: '12px'
			},
			'.cm-scroller::-webkit-scrollbar-track': {
				backgroundColor: '#111827'
			},
			'.cm-scroller::-webkit-scrollbar-thumb': {
				backgroundColor: '#374151',
				borderRadius: '6px',
				border: '2px solid #111827'
			},
			'.cm-scroller::-webkit-scrollbar-thumb:hover': {
				backgroundColor: '#4b5563'
			},
			'.cm-scroller::-webkit-scrollbar-corner': {
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

	// Custom styles to disable underlines in markdown
	const noUnderlineTheme = EditorView.theme({
		'.cm-content *': {
			textDecoration: 'none !important'
		}
	});

	function createEditor(isDark: boolean) {
		if (editorView) {
			editorView.destroy();
		}

		const state = EditorState.create({
			doc: content,
			extensions: [
				basicSetup,
				markdown(),
				isDark ? darkTheme : lightTheme,
				noUnderlineTheme,
				EditorView.updateListener.of((update) => {
					if (update.docChanged && onContentChange) {
						onContentChange(update.state.doc.toString());
					}

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

		editorView = new EditorView({
			state,
			parent: editorContainer
		});
	}

	onMount(() => {
		// Detect if dark mode is active using prefers-color-scheme
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const hasClassDark = document.documentElement.classList.contains('dark');
		const isDarkMode = hasClassDark || prefersDark;

		createEditor(isDarkMode);

		// Watch for theme changes via class
		themeObserver = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
					const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
					const hasClassDark = document.documentElement.classList.contains('dark');
					const isDark = hasClassDark || prefersDark;
					createEditor(isDark);
					break;
				}
			}
		});

		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class']
		});

		// Watch for system theme changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleMediaChange = (e: MediaQueryListEvent) => {
			const hasClassDark = document.documentElement.classList.contains('dark');
			const isDark = hasClassDark || e.matches;
			createEditor(isDark);
		};

		mediaQuery.addEventListener('change', handleMediaChange);

		return () => {
			mediaQuery.removeEventListener('change', handleMediaChange);
		};
	});

	onDestroy(() => {
		if (themeObserver) {
			themeObserver.disconnect();
			themeObserver = null;
		}
		if (editorView) {
			editorView.destroy();
			editorView = null;
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
