import { isGoogleAuthenticated } from '$lib/stores/google-auth';
import { env } from '$env/dynamic/public';

// Google API scopes - using drive.file for app-created files only
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient: any | null = null;
let gapiInited = false;
let gisInited = false;

/**
 * Initialize the Google API client (gapi)
 */
async function initGapi(): Promise<void> {
	if (gapiInited) return;

	return new Promise((resolve, reject) => {
		if (typeof gapi === 'undefined') {
			reject(new Error('Google API script not loaded'));
			return;
		}

		gapi.load('client', async () => {
			try {
				await gapi.client.init({
					apiKey: '', // Not using API key, OAuth only
					discoveryDocs: [
						env.PUBLIC_GOOGLE_DISCOVERY_DOC ||
							'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
					]
				});
				gapiInited = true;
				resolve();
			} catch (error) {
				reject(error);
			}
		});
	});
}

/**
 * Initialize the Google Identity Services (GIS) token client
 */
function initGis(): Promise<void> {
	if (gisInited) return Promise.resolve();

	return new Promise((resolve, reject) => {
		if (typeof google === 'undefined' || !google.accounts) {
			reject(new Error('Google Identity Services script not loaded'));
			return;
		}

		try {
			tokenClient = google.accounts.oauth2.initTokenClient({
				client_id: env.PUBLIC_GOOGLE_CLIENT_ID || '',
				scope: SCOPES,
				callback: (response) => {
					if (response.error) {
						console.error('OAuth error:', response);
						isGoogleAuthenticated.set(false);
						return;
					}

					if (response.access_token) {
						// Save token info
						saveToken(response.access_token, response.expires_in || 3600);

						// Set authentication state
						isGoogleAuthenticated.set(true);
					}
				}
			});

			gisInited = true;
			resolve();
		} catch (error) {
			reject(error);
		}
	});
}

/**
 * Initialize both GAPI and GIS
 */
export async function initGoogleAuth(): Promise<void> {
	try {
		await Promise.all([initGapi(), initGis()]);

		// Try to restore existing token
		const restored = restoreToken();
		if (restored) {
			console.log('Restored existing Google auth session');
		}
	} catch (error) {
		console.error('Failed to initialize Google Auth:', error);
		throw error;
	}
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<void> {
	if (!tokenClient) {
		throw new Error('Google Auth not initialized. Call initGoogleAuth() first.');
	}

	return new Promise((resolve, reject) => {
		// Store the original callback
		const originalCallback = tokenClient.callback;

		// Wrap the callback to resolve/reject the promise
		tokenClient.callback = (response: any) => {
			// Call original callback
			originalCallback(response);

			// Resolve or reject based on response
			if (response.error) {
				reject(new Error(response.error));
			} else if (response.access_token) {
				resolve();
			} else {
				reject(new Error('No access token received'));
			}

			// Restore original callback
			tokenClient.callback = originalCallback;
		};

		// Request access token - this will show OAuth popup
		tokenClient.requestAccessToken({ prompt: 'consent' });
	});
}

/**
 * Sign out and clear authentication
 */
export async function disconnectGoogleDrive(): Promise<void> {
	await signOut();
}

/**
 * Sign out and revoke tokens
 */
export async function signOut(): Promise<void> {
	const token = localStorage.getItem('google_access_token');

	if (token && typeof google !== 'undefined' && google.accounts?.oauth2) {
		// Revoke the token
		google.accounts.oauth2.revoke(token, () => {
			console.log('Token revoked');
		});
	}

	// Clear stored tokens
	localStorage.removeItem('google_access_token');
	localStorage.removeItem('google_token_expiry');

	// Clear GAPI token
	if (gapiInited && gapi.client.getToken()) {
		gapi.client.setToken(null);
	}

	// Update stores
	isGoogleAuthenticated.set(false);
}

/**
 * Get current access token
 */
export function getAccessToken(): string | null {
	return localStorage.getItem('google_access_token');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
	const token = getAccessToken();
	const expiry = localStorage.getItem('google_token_expiry');

	if (!token || !expiry) {
		return false;
	}

	// Check if token is expired
	return Date.now() < parseInt(expiry);
}

/**
 * Save access token to localStorage
 */
function saveToken(token: string, expiresIn: number): void {
	const expiryTime = Date.now() + expiresIn * 1000;

	localStorage.setItem('google_access_token', token);
	localStorage.setItem('google_token_expiry', expiryTime.toString());

	// Set token in gapi client
	if (gapiInited) {
		gapi.client.setToken({ access_token: token });
	}
}

/**
 * Restore token from localStorage on app load
 */
function restoreToken(): boolean {
	const token = getAccessToken();
	const expiry = localStorage.getItem('google_token_expiry');

	if (!token || !expiry) {
		return false;
	}

	// Check if token is still valid
	if (Date.now() >= parseInt(expiry)) {
		// Token expired, clear it
		localStorage.removeItem('google_access_token');
		localStorage.removeItem('google_token_expiry');
		return false;
	}

	// Token is valid, restore it
	if (gapiInited) {
		gapi.client.setToken({ access_token: token });
	}

	isGoogleAuthenticated.set(true);
	return true;
}

/**
 * Setup auto token refresh (checks every minute)
 */
export function setupTokenRefresh(): void {
	setInterval(() => {
		const expiry = localStorage.getItem('google_token_expiry');

		if (!expiry) return;

		const expiryTime = parseInt(expiry);
		const now = Date.now();

		// Refresh 5 minutes before expiry
		if (now > expiryTime - 5 * 60 * 1000 && now < expiryTime) {
			console.log('Token expiring soon, requesting refresh...');
			if (tokenClient) {
				tokenClient.requestAccessToken({ prompt: '' });
			}
		}
	}, 60000); // Check every minute
}
