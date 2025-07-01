/**
 * Color Editor Module
 * Handles HSL color adjustment popup and related functionality
 */

import { hslToHex } from './color_utils.js';

// Module state
let activeSwatchIndex = -1;
let elementToFocusOnModalClose = null;

// These will be initialized in the init function
let currentHslPaletteColors = [];
let hslPopup;
let hSlider;
let sSlider;
let lSlider;
let hValueSpan;
let sValueSpan;
let lValueSpan;
let popupColorPreview;
let paletteContainer;

/**
 * Initializes the module with DOM references and state
 */
function init(elements, state) {
    // Store DOM references
    hslPopup = elements.hslPopup;
    hSlider = elements.hSlider;
    sSlider = elements.sSlider;
    lSlider = elements.lSlider;
    hValueSpan = elements.hValueSpan;
    sValueSpan = elements.sValueSpan;
    lValueSpan = elements.lValueSpan;
    popupColorPreview = elements.popupColorPreview;
    paletteContainer = elements.paletteContainer;
    
    // Store state reference
    currentHslPaletteColors = state.currentHslPaletteColors;
    
    // Setup event listeners
    const closePopupBtn = hslPopup.querySelector('.close-popup-btn');
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', closeHslPopup);
    }
    
    hSlider.addEventListener('input', handleHslSliderChange);
    sSlider.addEventListener('input', handleHslSliderChange);
    lSlider.addEventListener('input', handleHslSliderChange);
}

/**
 * Opens the HSL adjustment popup for a specific swatch
 */
function openHslPopup(index, triggerElement) {
    if (index < 0 || index >= currentHslPaletteColors.length) return;
    activeSwatchIndex = index;
    const hsl = currentHslPaletteColors[index];

    hSlider.value = hsl.h;
    sSlider.value = hsl.s;
    lSlider.value = hsl.l;
    hValueSpan.textContent = `${hsl.h}`;
    sValueSpan.textContent = `${hsl.s}%`;
    lValueSpan.textContent = `${hsl.l}%`;

    updatePopupPreviewColor(); // Update preview bg

    // Setup focus and open
    elementToFocusOnModalClose = triggerElement; // Store trigger for focus return
    hslPopup.hidden = false;
    // Defer focus setting slightly to ensure element is visible
    requestAnimationFrame(() => {
       hSlider.focus(); // Focus the first slider
    });

    // Add escape listener specific to this modal instance
     document.addEventListener('keydown', closeHslOnEscape);
}

/** Closes the HSL popup. */
function closeHslPopup() {
   hslPopup.hidden = true;
   activeSwatchIndex = -1;
   document.removeEventListener('keydown', closeHslOnEscape); // Clean up listener
   if (elementToFocusOnModalClose) {
        elementToFocusOnModalClose.focus(); // Return focus
        elementToFocusOnModalClose = null;
   }
}

/** Specific Escape key handler for HSL popup. */
function closeHslOnEscape(e) {
    if (e.key === 'Escape') {
        closeHslPopup();
    }
}

/** Updates the color preview inside the HSL popup. */
function updatePopupPreviewColor() {
   if (activeSwatchIndex < 0) return;
   const hsl = {
        h: parseInt(hSlider.value, 10),
        s: parseInt(sSlider.value, 10),
        l: parseInt(lSlider.value, 10)
   };
   const hex = hslToHex(hsl.h, hsl.s, hsl.l);
   popupColorPreview.style.backgroundColor = hex;
   // Also update the border color for immediate feedback
   hslPopup.style.borderTopColor = hex;
}

/** Handles changes on the HSL sliders. */
function handleHslSliderChange() {
    if (activeSwatchIndex < 0 || activeSwatchIndex >= currentHslPaletteColors.length) return;

    const h = parseInt(hSlider.value, 10);
    const s = parseInt(sSlider.value, 10);
    const l = parseInt(lSlider.value, 10);

    // Update displayed values
    hValueSpan.textContent = `${h}`;
    sValueSpan.textContent = `${s}%`;
    lValueSpan.textContent = `${l}%`;

    // Update the color in the main state array
    currentHslPaletteColors[activeSwatchIndex] = { h, s, l };

    // Update the corresponding swatch visually
    const hex = hslToHex(h, s, l);
    const swatch = paletteContainer.children[activeSwatchIndex];
    if (swatch) {
        swatch.style.backgroundColor = hex;
        swatch.querySelector('.hex-code').textContent = hex.toUpperCase();
        // Update ARIA label too
        swatch.setAttribute('aria-label', swatch.getAttribute('aria-label').replace(/#[A-Fa-f0-9]{3,6}/i, hex.toUpperCase()));
    }
    // Update popup preview
    updatePopupPreviewColor();
}

// Export functions
export {
    init,
    openHslPopup,
    closeHslPopup,
    updatePopupPreviewColor,
    handleHslSliderChange
};