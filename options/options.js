// Saves options to chrome.storage
const saveOptions = () => {
  const displayIds = document.getElementById('display-ids').checked;
  const contextMenu = document.getElementById('context-menu').checked;
  const tinyFeatures = document.getElementById('tiny-features').checked;
  const shortcuts = document.getElementById('shortcuts').checked;
  const elementInfo = document.getElementById('element-info').checked;
  const elementInfoAutoClose = document.getElementById('element-info-auto-close').checked;
  const autoPublished = document.getElementById('auto-published').checked;
  const betterStyling = document.getElementById('better-styling').checked;
  const newSorting = document.getElementById('new-sorting').checked;
  const stickySidebar = document.getElementById('sticky-sidebar').checked;
  const stickyToolbar = document.getElementById('sticky-toolbar').checked;
  const ci = document.getElementById('ci-enabled').checked;
  const searchMode = document.getElementById('search-mode').value;
  const searchAutoFocus = document.getElementById('search-auto-focus').checked;
  chrome.storage.sync.set(
    {
      displayIds,
      contextMenu,
      tinyFeatures,
      shortcuts,
      elementInfo,
      elementInfoAutoClose,
      autoPublished,
      betterStyling,
      newSorting,
      stickySidebar,
      stickyToolbar,
      ci,
      searchMode,
      searchAutoFocus,
    },

    () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.reload(tabs[0].id);
      });
    }
  );

  // close the popup window
  window.close();
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get(
    {
      displayIds: true,
      contextMenu: true,
      tinyFeatures: true,
      shortcuts: true,
      elementInfo: true,
      elementInfoAutoClose: true,
      autoPublished: true,
      betterStyling: true,
      newSorting: true,
      stickySidebar: true,
      stickyToolbar: true,
      ci: true,
      searchMode: 'highlight',
      searchAutoFocus: true,
    },
    (items) => {
      document.getElementById('display-ids').checked = items.displayIds;
      document.getElementById('context-menu').checked = items.contextMenu;
      document.getElementById('tiny-features').checked = items.tinyFeatures;
      document.getElementById('shortcuts').checked = items.shortcuts;
      document.getElementById('element-info').checked = items.elementInfo;
      document.getElementById('element-info-auto-close').checked = items.elementInfoAutoClose;
      document.getElementById('auto-published').checked = items.autoPublished;
      document.getElementById('better-styling').checked = items.betterStyling;
      document.getElementById('new-sorting').checked = items.newSorting;
      document.getElementById('sticky-sidebar').checked = items.stickySidebar;
      document.getElementById('sticky-toolbar').checked = items.stickyToolbar;
      document.getElementById('ci-enabled').checked = items.ci;
      document.getElementById('search-mode').value = items.searchMode;
      document.getElementById('search-auto-focus').checked = items.searchAutoFocus;
      
      // Update card states after checkboxes are set
      updateAllCardStates();
    }
  );
};

// Initialize card interactions
const initializeCardInteractions = () => {
  // Handle master toggle card
  const masterCard = document.querySelector('.master-toggle-card');
  if (masterCard) {
    masterCard.addEventListener('click', () => {
      const checkbox = masterCard.querySelector('input[type="checkbox"]');
      checkbox.checked = !checkbox.checked;
      updateCardState(masterCard, checkbox.checked);
    });
  }

  // Handle feature cards
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach(card => {
    card.addEventListener('click', () => {
      const checkbox = card.querySelector('input[type="checkbox"]');
      checkbox.checked = !checkbox.checked;
      updateCardState(card, checkbox.checked);
    });
  });
};

// Update card visual state
const updateCardState = (card, isActive) => {
  if (isActive) {
    card.classList.add('active');
  } else {
    card.classList.remove('active');
  }
};

// Update all card states based on current checkbox values
const updateAllCardStates = () => {
  // Master toggle
  const masterCard = document.querySelector('.master-toggle-card');
  const masterCheckbox = document.getElementById('ci-enabled');
  if (masterCard && masterCheckbox) {
    updateCardState(masterCard, masterCheckbox.checked);
  }

  // Feature cards
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach(card => {
    const checkbox = card.querySelector('input[type="checkbox"]');
    if (checkbox) {
      updateCardState(card, checkbox.checked);
    }
  });
};

// Tooltip functionality
let tooltipElement = null;
let tooltipTimeout = null;
let currentTooltipTarget = null;

const createTooltip = () => {
  if (!tooltipElement) {
    tooltipElement = document.createElement('div');
    tooltipElement.className = 'tooltip';
    document.body.appendChild(tooltipElement);
  }
  return tooltipElement;
};

const positionTooltip = (element, tooltip) => {
  // Position the tooltip
  const rect = element.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  
  // Calculate position
  let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
  let top = rect.bottom + 8;
  
  // Ensure tooltip stays within viewport
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Horizontal bounds checking
  if (left < 8) {
    left = 8;
  } else if (left + tooltipRect.width > viewportWidth - 8) {
    left = viewportWidth - tooltipRect.width - 8;
  }
  
  // Vertical bounds checking - show above if not enough space below
  let tooltipClass = 'tooltip tooltip-bottom';
  if (top + tooltipRect.height > viewportHeight - 8) {
    top = rect.top - tooltipRect.height - 8;
    tooltipClass = 'tooltip tooltip-top';
  }
  
  // Check if element is still visible in viewport
  if (rect.bottom < 0 || rect.top > viewportHeight || rect.right < 0 || rect.left > viewportWidth) {
    // Element is outside viewport, hide tooltip
    hideTooltip();
    return false;
  }
  
  // Set tooltip class
  tooltip.className = tooltipClass + (tooltip.classList.contains('show') ? ' show' : '');

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  
  return true;
};

const showTooltip = (element, text) => {
  const tooltip = createTooltip();
  const isAlreadyVisible = tooltip.classList.contains('show');
  const isSwitchingElements = currentTooltipTarget && currentTooltipTarget !== element;
  
  // Set current target for scroll updates
  currentTooltipTarget = element;
  
  if (isAlreadyVisible && isSwitchingElements) {
    // Switching between elements - smooth slide transition
    // Update content and position immediately, let CSS transition handle the movement
    tooltip.textContent = text;
    positionTooltip(element, tooltip);
    // Tooltip stays visible, just slides to new position
  } else if (isAlreadyVisible && !isSwitchingElements) {
    // Same element, just update position (for scroll updates)
    positionTooltip(element, tooltip);
  } else {
    // First time showing - normal delay behavior
    tooltip.textContent = text;
    tooltip.classList.remove('show');
    positionTooltip(element, tooltip);
    
    setTimeout(() => {
      if (element.matches(':hover') && currentTooltipTarget === element) {
        tooltip.classList.add('show');
      }
    }, 700);
  }
};

const hideTooltip = () => {
  currentTooltipTarget = null;
  if (tooltipElement) {
    tooltipElement.classList.remove('show');
  }
};

const updateTooltipPosition = () => {
  if (currentTooltipTarget && tooltipElement && tooltipElement.classList.contains('show')) {
    if (!positionTooltip(currentTooltipTarget, tooltipElement)) {
      // Positioning failed, hide tooltip
      hideTooltip();
    }
  }
};

const initializeTooltips = () => {
  // Get all elements with data-tooltip attribute
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  
  tooltipElements.forEach(element => {
    const tooltipText = element.getAttribute('data-tooltip');
    
    element.addEventListener('mouseenter', () => {
      showTooltip(element, tooltipText);
    });
    
    element.addEventListener('mouseleave', () => {
      const oldTooltipTarget = currentTooltipTarget;
      setTimeout(() => {
        // Only hide if we haven't moved to a new tooltip target
        if (currentTooltipTarget === oldTooltipTarget) {
          hideTooltip();
        }
      }, 100);
    });
  });

  // Update tooltip position on scroll instead of hiding
  let scrollTimeout;
  const handleScroll = () => {
    // Throttle scroll updates for performance
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateTooltipPosition, 16); // ~60fps
  };

  // Target the actual scrollable containers in the popup
  const scrollableContainers = [
    window,
    document,
    document.body,
    document.querySelector('.options-container'),
    document.querySelector('body.options')
  ];

  scrollableContainers.forEach(container => {
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
  });
  
  // Update tooltip position on window resize
  window.addEventListener('resize', updateTooltipPosition, { passive: true });
  
  // Hide tooltips on click anywhere
  document.addEventListener('click', hideTooltip, { passive: true });
};

document.addEventListener('DOMContentLoaded', () => {
  restoreOptions();
  initializeCardInteractions();
  initializeTooltips();
});

document.getElementById('save').addEventListener('click', saveOptions);

const version = chrome.runtime.getManifest().version;
const versionElement = document.getElementById('extension-version');
if (versionElement) {
  versionElement.textContent = `v${version}`;
}