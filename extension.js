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

		const match = /Version\s+(\d+)\.(\d+)(?:\.(\d+))?/.exec(
			versionElement.textContent
		);
		if (!match) {
			return;
		}

		const [, maj, min, patch = "0"] = match;
		return [parseInt(maj, 10), parseInt(min, 10), parseInt(patch, 10)];
	};

	const parseVersionString = (versionStr) => {
		const parts = versionStr.split(".").map((n) => parseInt(n, 10));
		while (parts.length < 3) parts.push(0);
		return parts.slice(0, 3);
	};

	const compareVersions = (a, b) => {
		for (let i = 0; i < 3; i++) {
			if (a[i] > b[i]) return 1;
			if (a[i] < b[i]) return -1;
		}
		return 0;
	};

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
};

const getSetting = async (feature) => {
	const result = await chrome.storage.sync.get({ [feature]: true });
	return result[feature];
};

function stripHtml(html) {
	let tmp = document.createElement("div");
	tmp.innerHTML = html;
	return tmp.textContent || tmp.innerText || "";
}

window.addEventListener("load", async function () {
	const ciEnabled = await getSetting("ci");
	if (!ciEnabled) return;

	/**
	 * Handle context menu
	 */
	(async () => {
		const enabled = await getSetting("contextMenu");
		// Disable when not supported by version
		if (!supportedByVersion("5.5") || !enabled) {
			return;
		}

		// TODO: Currently only works on lists that are displayed in an 'ul' element. Some pages use a 'table' element instead. Also support this.
		const entries = this.document.querySelectorAll(
			".tl_file, .tl_content, .tl_folder, tr"
		);

		// Create context menu element
		const contextMenu = document.createElement("div");
		contextMenu.className = "context-menu";
		contextMenu.id = "context-menu";

		// Add the context menu to the body
		document.body.appendChild(contextMenu);

		if (entries.length === 0 || !contextMenu) return;

		entries.forEach((entry) => {
			entry.addEventListener("contextmenu", (e) => {
				e.preventDefault();
				e.stopPropagation();

				contextMenu.classList.add("open");
				// TODO: Make sure the context element has space on the screen (eg. display it on the left or top when there is no space)
				const posX = e.clientX - window.scrollX;
				const posY = e.clientY + window.scrollY;
				contextMenu.style.left = `${posX}px`;
				contextMenu.style.top = `${posY}px`;
				contextMenu.innerHTML = "";

				const actions = entry.querySelectorAll(
					".tl_right a, .tl_content_right a, .tl_right_nowrap a"
				);
				if (actions.length === 0) {
					contextMenu.classList.remove("open");
					contextMenu.innerHTML = "";
				}
				actions.forEach((action) => {
					const actionClone = action.cloneNode(true);
					const actionText = document.createElement("span");
					// Contao earlier than 5.0 dont have an title attribute, use the alt text of the icon instead
					actionText.innerHTML =
						actionClone.title == ""
							? actionClone.childNodes[0].alt
							: actionClone.title;
					actionClone.appendChild(actionText);
					contextMenu.appendChild(actionClone);
				});
			});
		});

		window.addEventListener("click", (e) => {
			if (contextMenu.classList.contains("open")) {
				contextMenu.classList.remove("open");

				const removeContent = () => {
					contextMenu.innerHTML = "";
					contextMenu.removeEventListener("transitionend", removeContent);
				};
				contextMenu.addEventListener("transitionend", removeContent);
			}
		});
	})();

	/**
	 * Display id of elements
	 */
	(async () => {
		const enabled = await getSetting("displayIds");
		if (!enabled) {
			return;
		}

		const entries = document.querySelectorAll(
			".tl_file, .tl_content, .tl_folder, tr"
		);

		let idElements = [];

		entries.forEach((entry) => {
			const idRegex = /ID\s\d+/g.exec(entry.innerHTML);
			if (idRegex == null) return;
			const id = idRegex[0]; // Search the id inside the html

			const right = entry.querySelectorAll(
				".tl_right, .tl_content_right, .tl_right_nowrap"
			);
			right.forEach((right) => {
				const idElement = document.createElement("span");
				idElement.className = "tl_id";
				idElement.innerHTML = id;
				idElements.push(idElement);
				right.appendChild(idElement);
			});
		});

		let widestId = 0;
		idElements.forEach((idElement) => {
			const computedStyle = window.getComputedStyle(idElement);
			const paddingLeft = parseFloat(computedStyle.paddingLeft);
			const paddingRight = parseFloat(computedStyle.paddingRight);
			const width = idElement.clientWidth - paddingLeft - paddingRight;
			if (width > widestId) {
				widestId = width;
			}
		});

		idElements.forEach((idElement) => {
			idElement.style.width = `${widestId}px`;
		});
	})();

	/**
	 * Create search bar when editing multiple settings
	 */
	(async () => {
		const searchMode = await getSetting("searchMode");
		if (searchMode == "disabled") return;

		const searchAutoFocus = await getSetting("searchAutoFocus");

		const formEdit = document.querySelector(".tl_formbody_edit");
		if (formEdit == null) return;

		const fields = Array.from(
			document.querySelectorAll(".tl_checkbox_container > :not(legend, br)")
		);
		if (fields.length == 0) return;

		const map = [];
		fields.forEach((child) => {
			// not an input
			if (child.getAttribute("for") == null) {
				map.push({
					id: child.id,
					input: child,
					label: null,
				});
			} else {
				const name = child.getAttribute("for");
				map.filter((i) => i.id == name)[0].label = child;
			}
		});

		const cleanup = () => {
			map.forEach((item) => {
				item.input.classList.remove(
					"search-highlight",
					"search-fade",
					"search-hide"
				);
				item.label.classList.remove(
					"search-highlight",
					"search-fade",
					"search-hide"
				);
			});
		};

		const searchBarContainer = this.document.createElement("div");
		searchBarContainer.classList.add("search-bar");
		const searchBarLabel = this.document.createElement("p");
		searchBarLabel.innerHTML = "Nach Einstellung suchen";
		searchBarContainer.appendChild(searchBarLabel);

		const fieldset = this.document.querySelector(
			".tl_tbox .widget .tl_checkbox_container"
		);

		if (fieldset == null) return;

		const searchBar = this.document.createElement("input");
		searchBar.type = "text";
		searchBar.id = "settings-search-bar";
		searchBar.classList.add("tl_text");
		searchBar.addEventListener("keyup", (e) => {
			cleanup();
			const query = e.target.value.toLowerCase();

			map.forEach((item) => {
				const inner = item.label.textContent.toLowerCase();
				if (searchMode == "highlight") {
					if (inner.includes(query)) {
						item.input.classList.add("search-highlight");
						item.label.classList.add("search-highlight");
					} else {
						item.input.classList.add("search-fade");
						item.label.classList.add("search-fade");
					}
				} else if (searchMode == "filter") {
					if (!inner.includes(query)) {
						item.input.classList.add("search-hidden");
						item.label.classList.add("search-hidden");
					} else {
						item.input.classList.remove("search-hidden");
						item.label.classList.remove("search-hidden");
					}

					fieldset.style.height =
						map.filter((i) => !i.label.classList.contains("search-hidden"))
							.length *
							18.8 +
						19 +
						"px";
				}
			});

			if (query == "") cleanup();
		});

		searchBarContainer.appendChild(searchBar);

		fieldset.before(searchBarContainer);

		if (searchAutoFocus) {
			// Focus the search bar automatically
			searchBar.focus();
		}
	})();

	/**
	 * Handle extra tiny features
	 */
	(async () => {
		const enabled = await getSetting("tinyFeatures");
		if (!enabled) {
			return;
		}

		const tinyEditors = document.querySelectorAll(".widget:has(.tox-tinymce)");
		tinyEditors.forEach((editor) => {
			// Get the iframe inside the editor
			const iframe = editor.querySelector(".tox-edit-area iframe");
			if (!iframe) return;

			// Wait for the iframe to be loaded
			iframe.addEventListener("load", () => {
				// Get the body inside the iframe's document
				const textArea = iframe.contentDocument && iframe.contentDocument.body;
				if (!textArea) return;

				const menuBar = editor.querySelector(".tox-menubar");
				if (!menuBar) return;

				// Create info container and append once
				const infoContainer = document.createElement("div");
				infoContainer.className = "tiny-info";

				const charInfo = document.createElement("span");
				const wordInfo = document.createElement("span");
				const loremBtn = document.createElement("button");
				loremBtn.innerHTML = 'Add lorem';
				loremBtn.classList.add('tiny_btn');


				loremBtn.addEventListener('click', (e) => {
					e.preventDefault();
					e.stopPropagation();
					lorem();
				});

				infoContainer.appendChild(charInfo);
				infoContainer.appendChild(wordInfo);
				infoContainer.appendChild(loremBtn);

				menuBar.appendChild(infoContainer);

				// Function to update info
				const updateInfo = () => {
					const text = stripHtml(textArea.innerHTML);
					charInfo.innerHTML = `Zeichen: ${text.length}`;
					// Count words: split by whitespace, filter out empty strings
					const words =
						text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
					wordInfo.innerHTML = `Wörter: ${words}`;
				};

				const lorem = () => {
					textArea.innerHTML = textArea.innerHTML.trim() + '<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.</p>'
					updateInfo();
				}

				// Initial update
				updateInfo();

				// Update on input/change
				textArea.addEventListener("input", updateInfo);
			});

			// If the iframe is already loaded, trigger the load handler manually
			if (
				iframe.contentDocument &&
				iframe.contentDocument.readyState === "complete"
			) {
				const event = new Event("load");
				iframe.dispatchEvent(event);
			}
		});
	})();

	/**
	 * Add useful shortcuts
	 */
	(async () => {
		const enabled = await getSetting("shortcuts");
		if (!enabled) {
			return;
		}

		// tiny link shortcut
		const tinyEditorIframe = this.document.querySelector(
			".tox-editor-container iframe"
		);
		if (!tinyEditorIframe) return;

		const tinyDocument =
			tinyEditorIframe.contentDocument ||
			tinyEditorIframe.contentWindow.document;
		const tinyToolbar = document.querySelector(".tox-toolbar__primary");
		const tinyLinkGroup = tinyToolbar.querySelector(
			".tox-toolbar__group:first-of-type"
		);
		const addLink = tinyLinkGroup.querySelector("button:first-of-type");

		// the text area is inside in an iframe
		// so we have to add the listener to the iframes document
		tinyDocument.addEventListener("keyup", (e) => {
			if (e.ctrlKey && e.altKey && e.code == "KeyL") {
				addLink.click();
			}
		});
	})();

	/**
	 * Convert element infos to copy links
	 */
	(async () => {
		const enabled = await getSetting("elementInfo");
		if (!enabled) {
			return;
		}

		const autoClose = await getSetting("elementInfoAutoClose");

		// TODO: ADD NOTIFICATION WHEN COPIED

		// Function to add copy functionality to table rows
		const addCopyFunctionality = (document, modal = null) => {
			const rows = document.querySelectorAll(
				"body table tr td:not(:has(span), .tl_label)"
			);
			rows.forEach((row) => {
				// Skip if already processed
				if (row.querySelector(".copy-link")) return;

				row.innerHTML = `<a href="#" class="copy-link">${row.innerHTML}</a>`;
				row.style.textDecoration = "underline";
				row.addEventListener("click", async (e) => {
					e.preventDefault();
					const text = row.innerText;

					// Try to copy to clipboard with fallback methods
					try {
						if (navigator.clipboard && navigator.clipboard.writeText) {
							await navigator.clipboard.writeText(text);
						} else {
							// Fallback for older browsers or restricted contexts
							const textArea = document.createElement("textarea");
							textArea.value = text;
							textArea.style.position = "fixed";
							textArea.style.left = "-999999px";
							textArea.style.top = "-999999px";
							document.body.appendChild(textArea);
							textArea.focus();
							textArea.select();

							const successful = document.execCommand("copy");
							document.body.removeChild(textArea);

							if (!successful) {
								throw new Error("Fallback copy failed");
							}
						}
					} catch (err) {
						console.error("Failed to copy text:", err);
					}

					// Auto-close modal if we have a modal reference
					if (autoClose && modal) {
						const closeBtn = modal.querySelector("a.close");
						if (closeBtn) {
							closeBtn.click();
						}
					}
				});
			});
		};

		// Check if we're directly on a page that contains the table (opened in new tab)
		// Look for typical Contao admin table structures
		const directPageTable = document.querySelector(
			"body:not(.be_main) table tr td:not(:has(span), .tl_label)"
		);
		if (directPageTable) {
			// We're on the direct page, add functionality immediately
			addCopyFunctionality(document, null);
		}

		// Also handle modal context
		let modalHandled = false;

		// check when element with id "simple-modal-overlay" is created or deleted
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === "childList") {
					const modalOverlay = document.querySelector(".simple-modal");

					// Modal was added
					if (modalOverlay && !modalHandled) {
						currentModal = modalOverlay;
						modalHandled = true;
						handleModal(modalOverlay);
					}
					// Modal was removed
					else if (!modalOverlay && modalHandled) {
						modalHandled = false;
						currentModal = null;
					}
				}
			});
		});

		// Start observing the document body for child list changes
		observer.observe(document.body, { childList: true, subtree: true });

		const handleModal = (modal) => {
			const modalIFrame = document.querySelector(".simple-modal iframe");
			if (!modalIFrame) return;

			// when iframe is loaded, add the click listener to the table rows
			modalIFrame.addEventListener("load", () => {
				addCopyFunctionality(modalIFrame.contentDocument, modal);
			});
		};
	})();

	/**
	 * Auto published pages and articles
	 */
	(async () => {
		const enabled = await getSetting("autoPublished");
		if (!enabled) {
			return;
		}

		// get all mandatory fields
		const mandatoryFields = document.querySelectorAll(
			".mandatory:is(input, textarea, select)"
		);

		if (mandatoryFields.length === 0) {
			return;
		}

		// When the mandatory fields are empty, when loading the edit page,
		// we can assume that the user is creating a new page or article.
		let hasEmptyMandatory = false;
		mandatoryFields.forEach((field) => {
			if (field.value.trim() === "") {
				hasEmptyMandatory = true;
			}
		});

		if (!hasEmptyMandatory) {
			return;
		}

		const publishedContainer = document.querySelector('#ctrl_published');
		if (!publishedContainer) {
			return;
		}

		const publishedCheckbox = publishedContainer.querySelector('input[type="checkbox"]');
		if (!publishedCheckbox) {
			return;
		}

		publishedCheckbox.checked = true; // Set the checkbox to checked
	})();

	/**
	 * Better styling
	 */
	(async () => {
		const enabled = await getSetting("betterStyling");
		if (!enabled) {
			return;
		}

		const style = document.createElement("link");
		style.rel = "stylesheet";
		style.href = chrome.runtime.getURL("./assets/style_be.css");
		document.head.appendChild(style);
	})();

	/**
	 * New sidebar sorting
	 */
	(async () => {
		const enabled = await getSetting("newSorting");

		// Disable when not supported by version
		if (!supportedByVersion("5.0.0") || !enabled) {
			return;
		}

		const contentGroup = document.querySelector('ul#content');
		const pageEntry = document.querySelector('ul#design > li:has(a.page)');
		const filesEntry = document.querySelector('ul#system > li:has(a.files)');

		const articleEntry = document.querySelector('ul#content > li:has(a.article)');
		contentGroup.prepend(pageEntry);
		articleEntry.after(filesEntry);
	})();

	(async () => {
		const enabled = await getSetting("stickySidebar");

		if (!enabled) {
			return;
		}

		const sidebar = document.querySelector('ul.menu_level_0');

		if (!sidebar) return;

		sidebar.style.position = 'sticky';
		sidebar.style.top = '0px';
	})();
});