/**
 * UI Utilities Module
 * Handles common UI operations like notifications, clipboard, and modal management
 */

// Module state and references
let notification;
let notificationTimeout;
let elementToFocusOnModalClose = null;

// DOM elements for sliders
let brightnessSlider;
let saturationSlider;
let brightnessValueSpan;
let saturationValueSpan;

// Modal elements
let hslPopup;
let closePopupBtn;
let favoritesModal;
let closeFavoritesModalBtn;
let loadPaletteBtn;

/**
 * Initializes the module with DOM references
 */
function init(elements) {
    // Store DOM references
    notification = elements.notification;
    
    // Slider elements
    brightnessSlider = elements.brightnessSlider;
    saturationSlider = elements.saturationSlider;
    brightnessValueSpan = elements.brightnessValueSpan;
    saturationValueSpan = elements.saturationValueSpan;
    
    // Modal elements
    hslPopup = elements.hslPopup;
    closePopupBtn = elements.closePopupBtn;
    favoritesModal = elements.favoritesModal;
    closeFavoritesModalBtn = elements.closeFavoritesModalBtn;
    loadPaletteBtn = elements.loadPaletteBtn;
    
    // Initialize modal controls
    initializeModalControls();
}

/**
 * Initializes modal controls for HSL popup and favorites modal
 */
function initializeModalControls() {
    // Only initialize if all required elements are available
    if (hslPopup && closePopupBtn) {
        window.hslModalControls = setupModalFocus(hslPopup, closePopupBtn);
    }
    
    if (favoritesModal && closeFavoritesModalBtn && loadPaletteBtn) {
        window.favoritesModalControls = setupModalFocus(favoritesModal, closeFavoritesModalBtn, loadPaletteBtn);
    }
}

/**
 * Shows a notification message
 */
function showNotification(message, isError = false, duration = 3000) {
    if (!notification) return;
    if (notificationTimeout) clearTimeout(notificationTimeout);

    notification.textContent = message;
    notification.setAttribute('role', isError ? 'alert' : 'status'); // Use alert for errors
    notification.style.backgroundColor = isError ? 'var(--wcag-fail-color)' : 'var(--accent-primary)';
    notification.style.color = isError ? '#ffffff' : 'var(--accent-primary-text)'; // Ensure contrast for error

    notification.hidden = false; // Make it visible for transition
    // Force reflow to ensure transition plays
    void notification.offsetWidth;
    notification.style.opacity = '1';
    notification.style.transform = 'translate(-50%, 0) scale(1)';

    notificationTimeout = setTimeout(() => {
         notification.style.opacity = '0';
         notification.style.transform = 'translate(-50%, 20px) scale(0.95)';
         // Hide fully after transition ends
         setTimeout(() => { notification.hidden = true; }, 400); // Match transition duration
    }, duration);
}

/**
 * Copies text to clipboard
 * @param {string} text - Text to copy
 */
function copyToClipboard(text) {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    
    // Select and copy the text
    textarea.select();
    document.execCommand('copy');
    
    // Clean up
    document.body.removeChild(textarea);
}

/** Updates the UI percentage display for sliders. */
function updateGlobalSlidersUI() {
    // MODIFICATION START
    brightnessValueSpan.textContent = `${parseInt(brightnessSlider.value, 10)}%`;
    // MODIFICATION END
    saturationValueSpan.textContent = `${Math.round(parseFloat(saturationSlider.value) * 100)}%`; // This one was already correct
}

/** Manages focus trapping and returning for modals/popups. */
function setupModalFocus(modalElement, closeButton, openButton) {
    const focusableElements = modalElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Function to trap focus
    const trapFocus = (e) => {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    };

    // Function to handle Escape key
    const closeOnEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    };

    // Open modal function
    const openModal = () => {
        elementToFocusOnModalClose = openButton || document.activeElement; // Store focus
        modalElement.hidden = false;
        // Force reflow before adding class/setting focus
        void modalElement.offsetWidth;
        firstElement?.focus(); // Focus the first element inside
        modalElement.addEventListener('keydown', trapFocus);
        document.addEventListener('keydown', closeOnEscape); // Listen globally for Escape
    };

    // Close modal function
    const closeModal = () => {
        modalElement.hidden = true;
        modalElement.removeEventListener('keydown', trapFocus);
        document.removeEventListener('keydown', closeOnEscape);
        elementToFocusOnModalClose?.focus(); // Return focus
        elementToFocusOnModalClose = null;
    };

    // Attach listeners
    closeButton.addEventListener('click', () => closeModal(modalElement));
    // Close if clicking backdrop (optional)
    modalElement.addEventListener('click', (e) => {
         if (e.target === modalElement) {
             closeModal(modalElement);
         }
    });

    return { openModal, closeModal }; // Return functions to be called externally
}

// Export functions
export {
    init,
    showNotification,
    copyToClipboard,
    updateGlobalSlidersUI
};