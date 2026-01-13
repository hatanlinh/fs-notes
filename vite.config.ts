import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		port: 3000,
		strictPort: true
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					// Only apply to client build, not SSR
					if (id.includes('node_modules')) {
						if (id.includes('codemirror') || id.includes('@codemirror')) {
							return 'codemirror';
						}
						if (id.includes('@tabler/icons-svelte')) {
							return 'icons';
						}
					}
				}
			}
		},
		chunkSizeWarningLimit: 600
	}
});
