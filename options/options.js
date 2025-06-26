// Saves options to chrome.storage
const saveOptions = () => {
  const displayIds = document.getElementById('display-ids').checked;
  const contextMenu = document.getElementById('context-menu').checked;
  const tinyInfo = document.getElementById('tiny-info').checked;
  const shortcuts = document.getElementById('shortcuts').checked;
  const elementInfo = document.getElementById('element-info').checked;
  const elementInfoAutoClose = document.getElementById('element-info-auto-close').checked;
  const autoPublished = document.getElementById('auto-published').checked;
  const ci = document.getElementById('ci-enabled').checked;
  const searchMode = document.getElementById('search-mode').value;
  const searchAutoFocus = document.getElementById('search-auto-focus').checked;
  chrome.storage.sync.set(
    {
      displayIds: displayIds,
      contextMenu: contextMenu,
      tinyInfo: tinyInfo,
      shortcuts: shortcuts,
      elementInfo: elementInfo,
      elementInfoAutoClose: elementInfoAutoClose,
      autoPublished: autoPublished,
      ci: ci,
      searchMode: searchMode,
      searchAutoFocus: searchAutoFocus,
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
      tinyInfo: true,
      shortcuts: true,
      elementInfo: true,
      elementInfoAutoClose: true,
      autoPublished: true,
      ci: true,
      searchMode: 'highlight',
      searchAutoFocus: true,
    },
    (items) => {
      document.getElementById('display-ids').checked = items.displayIds;
      document.getElementById('context-menu').checked = items.contextMenu;
      document.getElementById('tiny-info').checked = items.tinyInfo;
      document.getElementById('shortcuts').checked = items.shortcuts;
      document.getElementById('element-info').checked = items.elementInfo;
      document.getElementById('element-info-auto-close').checked = items.elementInfoAutoClose;
      document.getElementById('auto-published').checked = items.autoPublished;
      document.getElementById('ci-enabled').checked = items.ci;
      document.getElementById('search-mode').value = items.searchMode;
      document.getElementById('search-auto-focus').checked = items.searchAutoFocus;
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