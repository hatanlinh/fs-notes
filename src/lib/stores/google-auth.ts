import { writable } from 'svelte/store';

export const isGoogleAuthenticated = writable<boolean>(false);
