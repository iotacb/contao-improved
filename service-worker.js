console.log('🚀 Contao Improved Service Worker Started');

// Your 23 icon rules
const iconRules = [
    {
        id: 1,
        urlFilter: "*/system/themes/flexible/icons/visible.svg",
        extensionPath: "/assets/icons/eye.svg"
    },
    {
        id: 2,
        urlFilter: "*/system/themes/flexible/icons/invisible.svg",
        extensionPath: "/assets/icons/eye-hidden.svg"
    },
    {
        id: 3,
        urlFilter: "*/system/themes/flexible/icons/visible--dark.svg",
        extensionPath: "/assets/icons/eye.svg"
    },
    {
        id: 4,
        urlFilter: "*/system/themes/flexible/icons/invisible--dark.svg",
        extensionPath: "/assets/icons/eye-hidden.svg"
    },
    {
        id: 5,
        urlFilter: "*/system/themes/flexible/icons/edit.svg",
        extensionPath: "/assets/icons/edit.svg"
    },
    {
        id: 6,
        urlFilter: "*/system/themes/flexible/icons/children.svg",
        extensionPath: "/assets/icons/children.svg"
    },
    {
        id: 7,
        urlFilter: "*/system/themes/flexible/icons/copy.svg",
        extensionPath: "/assets/icons/copy.svg"
    },
    {
        id: 8,
        urlFilter: "*/system/themes/flexible/icons/cut.svg",
        extensionPath: "/assets/icons/cut.svg"
    },
    {
        id: 9,
        urlFilter: "*/system/themes/flexible/icons/delete.svg",
        extensionPath: "/assets/icons/delete.svg"
    },
    {
        id: 10,
        urlFilter: "*/system/themes/flexible/icons/show.svg",
        extensionPath: "/assets/icons/show.svg"
    },
    {
        id: 11,
        urlFilter: "*/system/themes/flexible/icons/new.svg",
        extensionPath: "/assets/icons/new.svg"
    },
    {
        id: 12,
        urlFilter: "*/system/themes/flexible/icons/all.svg",
        extensionPath: "/assets/icons/all.svg"
    },
    {
        id: 13,
        urlFilter: "*/system/themes/flexible/icons/sync.svg",
        extensionPath: "/assets/icons/sync.svg"
    },
    {
        id: 14,
        urlFilter: "*/system/themes/flexible/icons/newfolder.svg",
        extensionPath: "/assets/icons/newfolder.svg"
    },
    {
        id: 15,
        urlFilter: "*/system/themes/flexible/icons/drag.svg",
        extensionPath: "/assets/icons/drag.svg"
    },
    {
        id: 16,
        urlFilter: "*/system/themes/flexible/icons/drag--dark.svg",
        extensionPath: "/assets/icons/drag.svg"
    },
    {
        id: 17,
        urlFilter: "*/system/themes/flexible/icons/editor--dark.svg",
        extensionPath: "/assets/icons/editor.svg"
    },
    {
        id: 18,
        urlFilter: "*/system/themes/flexible/icons/editor.svg",
        extensionPath: "/assets/icons/editor.svg"
    },
    {
        id: 19,
        urlFilter: "*/system/themes/flexible/icons/editor--disabled--dark.svg",
        extensionPath: "/assets/icons/editor-disabled.svg"
    },
    {
        id: 20,
        urlFilter: "*/system/themes/flexible/icons/editor--disabled.svg",
        extensionPath: "/assets/icons/editor-disabled.svg"
    },
    {
        id: 21,
        urlFilter: "*/system/themes/flexible/icons/diffTemplate.svg",
        extensionPath: "/assets/icons/diffTemplate.svg"
    },
    {
        id: 22,
        urlFilter: "*/system/themes/flexible/icons/diffTemplate--dark.svg",
        extensionPath: "/assets/icons/diffTemplate.svg"
    },
    {
        id: 23,
        urlFilter: "*/system/themes/flexible/icons/rss.svg",
        extensionPath: "/assets/icons/rss.svg"
    },
    {
        id: 24,
        urlFilter: "*/system/themes/flexible/icons/article.svg",
        extensionPath: "/assets/icons/article.svg"
    },
    {
        id: 25,
        urlFilter: "*/system/themes/flexible/icons/article--dark.svg",
        extensionPath: "/assets/icons/article.svg"
    },
    {
        id: 26,
        urlFilter: "*/system/themes/flexible/icons/articles.svg",
        extensionPath: "/assets/icons/article.svg"
    },
    {
        id: 27,
        urlFilter: "*/system/themes/flexible/icons/articles--dark.svg",
        extensionPath: "/assets/icons/article.svg"
    },
    {
        id: 28,
        urlFilter: "*/system/themes/flexible/icons/articles_1.svg",
        extensionPath: "/assets/icons/article-disabled.svg"
    },
    {
        id: 29,
        urlFilter: "*/system/themes/flexible/icons/articles_1--dark.svg",
        extensionPath: "/assets/icons/article-disabled.svg"
    },
    {
        id: 30,
        urlFilter: "*/system/themes/flexible/icons/article--disabled.svg",
        extensionPath: "/assets/icons/article-disabled.svg"
    },
    {
        id: 31,
        urlFilter: "*/system/themes/flexible/icons/article--disabled--dark.svg",
        extensionPath: "/assets/icons/article-disabled.svg"
    },
    {
        id: 32,
        urlFilter: "*/system/themes/flexible/icons/regular.svg",
        extensionPath: "/assets/icons/regular.svg"
    },
    {
        id: 33,
        urlFilter: "*/system/themes/flexible/icons/regular--dark.svg",
        extensionPath: "/assets/icons/regular.svg"
    },
    {
        id: 34,
        urlFilter: "*/system/themes/flexible/icons/regular_2.svg",
        extensionPath: "/assets/icons/regular_2.svg"
    },
    {
        id: 35,
        urlFilter: "*/system/themes/flexible/icons/regular_2--dark.svg",
        extensionPath: "/assets/icons/regular_2.svg"
    },
    {
        id: 36,
        urlFilter: "*/system/themes/flexible/icons/redirect.svg",
        extensionPath: "/assets/icons/redirect.svg"
    },
    {
        id: 37,
        urlFilter: "*/system/themes/flexible/icons/redirect--dark.svg",
        extensionPath: "/assets/icons/redirect.svg"
    },
    {
        id: 38,
        urlFilter: "*/system/themes/flexible/icons/redirect_1.svg",
        extensionPath: "/assets/icons/redirect_1.svg"
    },
    {
        id: 39,
        urlFilter: "*/system/themes/flexible/icons/redirect_1--dark.svg",
        extensionPath: "/assets/icons/redirect_1.svg"
    },
    {
        id: 40,
        urlFilter: "*/system/themes/flexible/icons/regular_1.svg",
        extensionPath: "/assets/icons/regular_1.svg"
    },
    {
        id: 41,
        urlFilter: "*/system/themes/flexible/icons/regular_1--dark.svg",
        extensionPath: "/assets/icons/regular_1.svg"
    },
    {
        id: 42,
        urlFilter: "*/system/themes/flexible/icons/regular_3.svg",
        extensionPath: "/assets/icons/regular_3.svg"
    },
    {
        id: 43,
        urlFilter: "*/system/themes/flexible/icons/regular_3--dark.svg",
        extensionPath: "/assets/icons/regular_3.svg"
    },
    {
        id: 44,
        urlFilter: "*/system/themes/flexible/icons/folderC.svg",
        extensionPath: "/assets/icons/folderC.svg"
    },
    {
        id: 45,
        urlFilter: "*/system/themes/flexible/icons/folderC--dark.svg",
        extensionPath: "/assets/icons/folderC.svg"
    },
    {
        id: 46,
        urlFilter: "*/system/themes/flexible/icons/folderCP.svg",
        extensionPath: "/assets/icons/folderCP.svg"
    },
    {
        id: 47,
        urlFilter: "*/system/themes/flexible/icons/folderCP--dark.svg",
        extensionPath: "/assets/icons/folderCP.svg"
    },
    {
        id: 48,
        urlFilter: "*/system/themes/flexible/icons/modules.svg",
        extensionPath: "/assets/icons/modules.svg"
    },
    {
        id: 49,
        urlFilter: "*/system/themes/flexible/icons/back.svg",
        extensionPath: "/assets/icons/back.svg"
    },
    {
        id: 50,
        urlFilter: "*/system/themes/flexible/icons/copychildren.svg",
        extensionPath: "/assets/icons/copychildren.svg"
    },
    {
        id: 51,
        urlFilter: "*/system/themes/flexible/icons/copychildren--dark.svg",
        extensionPath: "/assets/icons/copychildren.svg"
    }
];

// Initialize on startup
chrome.runtime.onStartup.addListener(initializeExtension);
chrome.runtime.onInstalled.addListener(initializeExtension);

async function initializeExtension() {
    // Apply current settings
    await applyIconReplacementSettings();
}

// Listen for settings changes - specifically betterStyling
chrome.storage.onChanged.addListener(async (changes, namespace) => {
    if (namespace === 'sync' && changes.betterStyling) {
        console.log('Better styling setting changed:', changes.betterStyling.newValue);
        await applyIconReplacementSettings();
    }
});

// Handle tab reloads (when settings are saved)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' && tab.url?.includes('contao')) {
        // Reapply icon settings when Contao pages reload
        await applyIconReplacementSettings();
    }
});

async function applyIconReplacementSettings() {
    try {
        // Get the betterStyling setting (defaults to true)
        const result = await chrome.storage.sync.get({ betterStyling: true });
        const isEnabled = result.betterStyling;

        // Clear all existing dynamic rules
        const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
        const ruleIds = existingRules.map(rule => rule.id);

        if (ruleIds.length > 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: ruleIds
            });
        }

        if (isEnabled) {
            // Convert to declarativeNetRequest format
            const rules = iconRules.map(rule => ({
                id: rule.id,
                priority: 1,
                action: {
                    type: "redirect",
                    redirect: {
                        extensionPath: rule.extensionPath
                    }
                },
                condition: {
                    urlFilter: rule.urlFilter,
                    resourceTypes: ["image"]
                }
            }));

            await chrome.declarativeNetRequest.updateDynamicRules({
                addRules: rules
            });

            console.log(`✅ Better styling enabled - ${rules.length} icon replacement rules added`);
        } else {
            console.log('❌ Better styling disabled - icon replacement rules removed');
        }
    } catch (error) {
        console.error('Failed to apply icon replacement settings:', error);
    }
}