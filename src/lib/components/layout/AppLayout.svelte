<script lang="ts">
	import NavBar from './NavBar.svelte';
	import StatusBar from './StatusBar.svelte';
	import ExplorerPanel from '$lib/components/sidebar/ExplorerPanel.svelte';
	import EditorPanel from '$lib/components/editor/EditorPanel.svelte';
</script>

<div class="app-layout">
	<NavBar />

	<div class="app-main">
		<ExplorerPanel />
		<EditorPanel />
	</div>

	<StatusBar />
</div>
