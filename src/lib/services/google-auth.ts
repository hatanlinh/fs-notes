import { isGoogleAuthenticated } from '$lib/stores/google-auth';
import { env } from '$env/dynamic/public';

const GOOGLE_DRIVE_SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let gapiInited = false;
let gisInited = false;

// Pending promise for sign-in requests
let pendingSignIn: {
	resolve: () => void;
	reject: (error: Error) => void;
} | null = null;

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
					apiKey: '',
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
				scope: GOOGLE_DRIVE_SCOPES,
				callback: (response) => {
					if (response.error) {
						console.error('OAuth error:', response);
						isGoogleAuthenticated.set(false);

						if (pendingSignIn) {
							pendingSignIn.reject(new Error(response.error));
							pendingSignIn = null;
						}
						return;
					}

					if (response.access_token) {
						const parsed = Number.parseInt(response.expires_in);
						const expires_in = Number.isFinite(parsed) ? parsed : 3600;
						saveToken(response.access_token, expires_in);
						isGoogleAuthenticated.set(true);

						if (pendingSignIn) {
							pendingSignIn.resolve();
							pendingSignIn = null;
						}
					} else if (pendingSignIn) {
						pendingSignIn.reject(new Error('No access token received'));
						pendingSignIn = null;
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

export async function initGoogleAuth(): Promise<void> {
	try {
		await Promise.all([initGapi(), initGis()]);

		const restored = restoreToken();
		if (restored) {
			console.log('Restored existing Google auth session');
		}
	} catch (error) {
		console.error('Failed to initialize Google Auth:', error);
		throw error;
	}
}

export async function signInWithGoogle(): Promise<void> {
	if (!tokenClient) {
		throw new Error('Google Auth not initialized. Call initGoogleAuth() first.');
	}

	return new Promise((resolve, reject) => {
		pendingSignIn = { resolve, reject };
		tokenClient!.requestAccessToken({ prompt: 'consent' });
	});
}

export async function disconnectGoogleDrive(): Promise<void> {
	await signOut();
}

export async function signOut(): Promise<void> {
	const token = localStorage.getItem('google_access_token');

	if (token && typeof google !== 'undefined' && google.accounts?.oauth2) {
		google.accounts.oauth2.revoke(token, () => {
			console.log('Token revoked');
		});
	}

	localStorage.removeItem('google_access_token');
	localStorage.removeItem('google_token_expiry');

	if (gapiInited && gapi.client.getToken()) {
		gapi.client.setToken(null);
	}

	isGoogleAuthenticated.set(false);
}

export function getAccessToken(): string | null {
	return localStorage.getItem('google_access_token');
}

export function isAuthenticated(): boolean {
	const token = getAccessToken();
	const expiry = localStorage.getItem('google_token_expiry');

	if (!token || !expiry) {
		return false;
	}

	return Date.now() < parseInt(expiry);
}

function saveToken(token: string, expiresIn: number): void {
	const expiryTime = Date.now() + expiresIn * 1000;

	localStorage.setItem('google_access_token', token);
	localStorage.setItem('google_token_expiry', expiryTime.toString());

	if (gapiInited) {
		gapi.client.setToken({ access_token: token });
	}
}

function restoreToken(): boolean {
	const token = getAccessToken();
	const expiry = localStorage.getItem('google_token_expiry');

	if (!token || !expiry) {
		return false;
	}

	if (Date.now() >= parseInt(expiry)) {
		localStorage.removeItem('google_access_token');
		localStorage.removeItem('google_token_expiry');
		return false;
	}

	if (gapiInited) {
		gapi.client.setToken({ access_token: token });
	}

	isGoogleAuthenticated.set(true);
	return true;
}

export function setupTokenRefresh(): void {
	setInterval(() => {
		const expiry = localStorage.getItem('google_token_expiry');

		if (!expiry) return;

		const expiryTime = parseInt(expiry);
		const now = Date.now();

		if (now > expiryTime - 5 * 60 * 1000 && now < expiryTime) {
			console.log('Token expiring soon, requesting refresh...');
			if (tokenClient) {
				tokenClient.requestAccessToken({ prompt: '' });
			}
		}
	}, 60000); // Check every minute
}
