<script lang="ts">
	import NavBar from './NavBar.svelte';
	import StatusBar from './StatusBar.svelte';
	import ExplorerPanel from '$lib/components/sidebar/ExplorerPanel.svelte';
	import EditorPanel from '$lib/components/editor/EditorPanel.svelte';
</script>

<div class="flex h-screen flex-col overflow-hidden bg-gray-100 dark:bg-gray-950">
	<!-- Top Navigation -->
	<NavBar />

	<!-- Main Content Area -->
	<div class="flex flex-1 overflow-hidden">
		<!-- Left Sidebar - File Explorer -->
		<ExplorerPanel />

		<!-- Right Side - Editor -->
		<EditorPanel />
	</div>

	<!-- Bottom Status Bar -->
	<StatusBar />
</div>
