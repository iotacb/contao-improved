// Saves options to chrome.storage
const saveOptions = () => {
  const displayIds = document.getElementById('display-ids').checked;
  const contextMenu = document.getElementById('context-menu').checked;
  const multiAction = document.getElementById('multi-action').checked;
  const multiEdit = document.getElementById('multi-edit').checked;
  const searchMode = document.getElementById('search-mode').value;
  chrome.storage.sync.set(
    {
      displayIds: displayIds,
      contextMenu: contextMenu,
      multiAction: multiAction,
      multiEdit: multiEdit,
      searchMode: searchMode,
    },

    () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.reload(tabs[0].id);
      });
    }
  )
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get(
    {
      displayIds: true,
      contextMenu: true,
      multiAction: true,
      multiEdit: true,
      searchMode: 'highlight',
    },
    (items) => {
      document.getElementById('display-ids').checked = items.displayIds;
      document.getElementById('context-menu').checked = items.contextMenu;
      document.getElementById('multi-action').checked = items.multiAction;
      document.getElementById('multi-edit').checked = items.multiEdit;
      document.getElementById('search-mode').value = items.searchMode;
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);

const version = chrome.runtime.getManifest().version;
const versionElement = document.getElementById('extension-version');
if (versionElement) {
  versionElement.textContent = `v${version}`;
}