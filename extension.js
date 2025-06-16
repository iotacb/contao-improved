/**
 * Check the version of Contao and compare them to the given max and min version
 * @param {*} maxVersion 
 * @param {*} minVersion 
 * @returns {boolean} true if the current version is between the given versions, false otherwise
 */
const supportedByVersion = (maxVersion, minVersion = "0.0.0") => {
    const getContaoVersion = () => {
        const versionElement = document.querySelector(".version");
        if (!versionElement) {
            return;
        }

        const match = /Version\s+(\d+)\.(\d+)(?:\.(\d+))?/.exec(versionElement.textContent);
        if (!match) {
            return;
        }

        const [, maj, min, patch = "0"] = match;
        return [parseInt(maj, 10), parseInt(min, 10), parseInt(patch, 10)];
    }

    const parseVersionString = (versionStr) => {
        const parts = versionStr.split(".").map(n => parseInt(n, 10));
        while (parts.length < 3) parts.push(0);
        return parts.slice(0, 3);
    }

    const compareVersions = (a, b) => {
        for (let i = 0; i < 3; i++) {
            if (a[i] > b[i]) return 1;
            if (a[i] < b[i]) return -1;
        }
        return 0;
    }

    try {
        const current = getContaoVersion();
        if (!current) {
            return false;
        }

        const minV = parseVersionString(minVersion);
        const maxV = parseVersionString(maxVersion);

        const tooLow = compareVersions(current, minV) < 0;
        const tooHigh = compareVersions(current, maxV) > 0;
        return !tooLow && !tooHigh;
    } catch (e) {
        return false;
    }
}

const isFeatureEnabled = async (feature) => {
    const result = await chrome.storage.sync.get({ [feature]: true });
    return result[feature] === true;
};

const getMode = async (feature) => {
    const result = await chrome.storage.sync.get({ [feature]: true });
    return result[feature];
}

window.addEventListener('load', async function () {
    /**
     * Handle context menu
     */
    (async () => {
        const enabled = await isFeatureEnabled("contextMenu")
        // Disable when not supported by version
        if (!supportedByVersion("5.5") || !enabled) {
            return;
        }

        // TODO: Currently only works on lists that are displayed in an 'ul' element. Some pages use a 'table' element instead. Also support this.
        const entries = this.document.querySelectorAll('.tl_file, .tl_content, .tl_folder');

        // Create context menu element
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.id = 'context-menu';

        // Add the context menu to the body
        document.body.appendChild(contextMenu);

        if (entries.length === 0 || !contextMenu) return;

        entries.forEach(entry => {
            entry.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();

                contextMenu.classList.add('open');
                // TODO: Make sure the context element has space on the screen (eg. display it on the left or top when there is no space)
                const posX = e.clientX - window.scrollX;
                const posY = e.clientY + window.scrollY;
                contextMenu.style.left = `${posX}px`;
                contextMenu.style.top = `${posY}px`;
                contextMenu.innerHTML = '';

                const actions = entry.querySelectorAll('.tl_right a, .tl_content_right a');
                if (actions.length === 0) {
                    contextMenu.classList.remove('open');
                    contextMenu.innerHTML = '';
                }
                actions.forEach(action => {
                    const actionClone = action.cloneNode(true);
                    const actionText = document.createElement('span');
                    // Contao earlier than 5.0 dont have an title attribute, use the alt text of the icon instead
                    actionText.innerHTML = actionClone.title == '' ? actionClone.childNodes[0].alt : actionClone.title;
                    actionClone.appendChild(actionText);
                    contextMenu.appendChild(actionClone);
                });
            });
        });

        window.addEventListener('click', (e) => {
            if (contextMenu.classList.contains('open')) {
                contextMenu.classList.remove('open');
                contextMenu.innerHTML = '';
            }
        });
    })();

    /**
     * Display id of elements
     */
    (async () => {
        const enabled = await isFeatureEnabled('displayIds');
        if (!enabled) {
            return;
        }

        const entries = this.document.querySelectorAll('.tl_file, .tl_content, .tl_folder');
        entries.forEach(entry => {
            const idRegex = /ID\s\d+/g.exec(entry.innerHTML);
            if (idRegex == null) return;
            const id = idRegex[0]; // Search the id inside the html
            const idElement = document.createElement('span');
            idElement.className = 'tl_id';
            idElement.innerHTML = id;

            entry.appendChild(idElement);
        });
    })();

    // Create search bar when editing muliple
    (async () => {
        const searchMode = await getMode('searchMode');
        if (searchMode == 'disabled') return;
        
        const formEdit = document.querySelector('.tl_formbody_edit');
        if (formEdit == null) return;

        const fields = Array.from(document.querySelectorAll('.tl_checkbox_container > :not(legend, br)'));
        if (fields.length == 0) return;

        const map = [];
        fields.forEach(child => {
            // not an input
            if (child.getAttribute('for') == null) {
                map.push(
                    {
                        id: child.id,
                        input: child,
                        label: null
                    }
                );
            } else {
                const name = child.getAttribute('for');
                map.filter(i => i.id == name)[0].label = child;
            }
        });

        const cleanup = () => {
            map.forEach(item => {
                item.input.classList.remove('search-highlight', 'search-fade', 'search-hide');
                item.label.classList.remove('search-highlight', 'search-fade', 'search-hide');
            })
        }

        const searchBarContainer = this.document.createElement('div');
        searchBarContainer.classList.add('search-bar');
        const searchBarLabel = this.document.createElement('p');
        searchBarLabel.innerHTML = "Nach Einstellung suchen";
        searchBarContainer.appendChild(searchBarLabel);

        const fieldset = this.document.querySelector('.tl_tbox .widget .tl_checkbox_container');

        if (fieldset == null) return;

        const searchBar = this.document.createElement('input');
        searchBar.type = 'text';
        searchBar.id = 'settings-search-bar';
        searchBar.classList.add("tl_text");
        searchBar.addEventListener('keyup', (e) => {
            cleanup();
            const query = e.target.value.toLowerCase();

            map.forEach(item => {
                const inner = item.label.textContent.toLowerCase();
                if (searchMode == 'highlight') {
                    if (inner.includes(query)) {
                        item.input.classList.add('search-highlight');
                        item.label.classList.add('search-highlight');
                    } else {
                        item.input.classList.add('search-fade');
                        item.label.classList.add('search-fade');
                    }
                } else if (searchMode == 'filter') {
                    if (!inner.includes(query)) {
                        item.input.classList.add('search-hidden');
                        item.label.classList.add('search-hidden');
                    } else {
                        item.input.classList.remove('search-hidden');
                        item.label.classList.remove('search-hidden');
                    }

                    fieldset.style.height = ((map.filter(i => !i.label.classList.contains('search-hidden')).length * 18.8) + 19) + 'px';
                }
            });

            if (query == '') cleanup();
        });

        searchBarContainer.appendChild(searchBar);

        fieldset.before(searchBarContainer);
    })();
});