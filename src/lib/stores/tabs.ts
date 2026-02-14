import { writable, derived } from "svelte/store";
import type { TabInfo, FileNode, StorageType } from "$lib/types";
import { generateDefaultFileName } from "$lib/utils/filename";

export const tabs = writable<TabInfo[]>([]);
export const activeTabId = writable<string | null>(null);
export const activeTab = derived(
  [tabs, activeTabId],
  ([$tabs, $activeTabId]) => {
    return $tabs.find((tab) => tab.id === $activeTabId) || null;
  },
);

function generateTabId(filePath: string): string {
  return `tab-${filePath}-${Date.now()}`;
}

export function openTab(file: FileNode, content: string = "") {
  tabs.update((currentTabs) => {
    const existingTab = currentTabs.find(
      (tab) => tab.file && tab.file.path === file.path,
    );

    if (existingTab) {
      activeTabId.set(existingTab.id);
      return currentTabs;
    }

    const newTab: TabInfo = {
      id: generateTabId(file.path),
      file,
      content,
      isDirty: false,
    };

    activeTabId.set(newTab.id);
    return [...currentTabs, newTab];
  });
}

export function closeTab(tabId: string) {
  tabs.update((currentTabs) => {
    const index = currentTabs.findIndex((tab) => tab.id === tabId);
    if (index === -1) return currentTabs;

    const newTabs = currentTabs.filter((tab) => tab.id !== tabId);

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

export function createNewTab() {
  const defaultFileName = generateDefaultFileName();
  const newTab: TabInfo = {
    id: `tab-${defaultFileName}-${Date.now()}`,
    file: null,
    content: "",
    isDirty: false,
    isUnsaved: true,
    defaultFileName,
  };

  tabs.update((currentTabs) => {
    return [...currentTabs, newTab];
  });

  activeTabId.set(newTab.id);
  return newTab.id;
}

export function updateTabContent(tabId: string, content: string) {
  tabs.update((currentTabs) =>
    currentTabs.map((tab) =>
      tab.id === tabId ? { ...tab, content, isDirty: true } : tab,
    ),
  );
}

export function updateTabFile(tabId: string, file: FileNode) {
  tabs.update((currentTabs) =>
    currentTabs.map((tab) =>
      tab.id === tabId
        ? { ...tab, file, isDirty: false, isUnsaved: false }
        : tab,
    ),
  );
}

export function markTabSaved(tabId: string) {
  tabs.update((currentTabs) =>
    currentTabs.map((tab) =>
      tab.id === tabId ? { ...tab, isDirty: false } : tab,
    ),
  );
}

export function closeTabsByStorageType(storageType: StorageType) {
  tabs.update((currentTabs) => {
    const tabsToKeep = currentTabs.filter(
      (tab) => !tab.file || tab.file.storageType !== storageType,
    );

    if (tabsToKeep.length === currentTabs.length) {
      return currentTabs;
    }

    activeTabId.update((currentActiveId) => {
      const activeTabRemoved = currentTabs.some(
        (tab) =>
          tab.id === currentActiveId &&
          tab.file &&
          tab.file.storageType === storageType,
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
