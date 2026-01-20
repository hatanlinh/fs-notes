import { writable, derived } from 'svelte/store';
import type { TabInfo, FileNode, StorageType } from '$lib/types';
import { generateDefaultFileName } from '$lib/utils/filename';

// Store for all open tabs
export const tabs = writable<TabInfo[]>([]);

// Store for the active tab ID
export const activeTabId = writable<string | null>(null);

// Derived store for the active tab
export const activeTab = derived([tabs, activeTabId], ([$tabs, $activeTabId]) => {
	return $tabs.find((tab) => tab.id === $activeTabId) || null;
});

// Helper to generate a unique tab ID
function generateTabId(filePath: string): string {
	return `tab-${filePath}-${Date.now()}`;
}

// Open a file in a new tab or switch to existing tab
export function openTab(file: FileNode, content: string = '') {
	tabs.update((currentTabs) => {
		// Check if file is already open
		const existingTab = currentTabs.find((tab) => tab.file && tab.file.path === file.path);

		if (existingTab) {
			// Switch to existing tab
			activeTabId.set(existingTab.id);
			return currentTabs;
		}

		// Create new tab
		const newTab: TabInfo = {
			id: generateTabId(file.path),
			file,
			content,
			isDirty: false
		};

		activeTabId.set(newTab.id);
		return [...currentTabs, newTab];
	});
}

// Close a tab
export function closeTab(tabId: string) {
	tabs.update((currentTabs) => {
		const index = currentTabs.findIndex((tab) => tab.id === tabId);
		if (index === -1) return currentTabs;

		const newTabs = currentTabs.filter((tab) => tab.id !== tabId);

		// Update active tab if we closed the active one
		activeTabId.update((currentActiveId) => {
			if (currentActiveId === tabId) {
				// Switch to adjacent tab or null
				if (newTabs.length > 0) {
					const newIndex = Math.min(index, newTabs.length - 1);
					return newTabs[newIndex].id;
				}
				return null;
			}
			return currentActiveId;
		});

		return newTabs;
	});
}

// Create a new unsaved tab
export function createNewTab() {
	const defaultFileName = generateDefaultFileName();
	const newTab: TabInfo = {
		id: `tab-${defaultFileName}-${Date.now()}`,
		file: null,
		content: '',
		isDirty: false,
		isUnsaved: true,
		defaultFileName
	};

	tabs.update((currentTabs) => {
		return [...currentTabs, newTab];
	});

	activeTabId.set(newTab.id);

	return newTab.id;
}

// Update tab content
export function updateTabContent(tabId: string, content: string) {
	tabs.update((currentTabs) =>
		currentTabs.map((tab) => (tab.id === tabId ? { ...tab, content, isDirty: true } : tab))
	);
}

// Update tab file info after saving an unsaved tab
export function updateTabFile(tabId: string, file: FileNode) {
	tabs.update((currentTabs) =>
		currentTabs.map((tab) =>
			tab.id === tabId ? { ...tab, file, isDirty: false, isUnsaved: false } : tab
		)
	);
}

// Mark tab as saved
export function markTabSaved(tabId: string) {
	tabs.update((currentTabs) =>
		currentTabs.map((tab) => (tab.id === tabId ? { ...tab, isDirty: false } : tab))
	);
}

export function closeTabsByStorageType(storageType: StorageType) {
	tabs.update((currentTabs) => {
		const tabsToKeep = currentTabs.filter(
			(tab) => !tab.file || tab.file.storageType !== storageType
		);

		if (tabsToKeep.length === currentTabs.length) {
			return currentTabs;
		}

		activeTabId.update((currentActiveId) => {
			const activeTabRemoved = currentTabs.some(
				(tab) => tab.id === currentActiveId && tab.file && tab.file.storageType === storageType
			);

			if (activeTabRemoved) {
				if (tabsToKeep.length > 0) {
					return tabsToKeep[0].id;
				}
				return null;
			}
			return currentActiveId;
		});

		return tabsToKeep;
	});
}

export function closeAllTabs() {
	tabs.set([]);
	activeTabId.set(null);
}
