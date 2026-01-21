<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { initGoogleAuth, setupTokenRefresh } from '$lib/services/google-auth';

	let { children } = $props();

	onMount(async () => {
		try {
			await initGoogleAuth();
			setupTokenRefresh();
		} catch (error) {
			console.error('Failed to initialize Google Auth:', error);
		}
	});
</script>

<svelte:head><link rel="icon" href="/favicon.svg" /></svelte:head>
{@render children()}
