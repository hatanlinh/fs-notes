import { writable } from 'svelte/store';

/**
 * Store for Google authentication state
 */
export const isGoogleAuthenticated = writable<boolean>(false);
