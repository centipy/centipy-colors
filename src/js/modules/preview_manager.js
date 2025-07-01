/**
 * Preview Manager Module
 * Handles color preview displays and gradient generation
 */

import { 
    getRandomHsl, 
    hslToHex, 
    hexToHsl, 
    getContrastRatio, 
    getDescriptiveColorName 
} from './color_utils.js';

// Module state
let isGradientActive = false;
let currentPreviewColors = [{}, {}]; // Array of {bgColorHsl, textColorHsl} objects
let DARK_BG_LUMINANCE_THRESHOLD = 50;
let WCAG_AA_THRESHOLD = 4.5;
let WCAG_AAA_THRESHOLD = 7;

// DOM elements
let previewElements = [];
let mobilePreview1;
let mobilePreview2;
let copyGradientCssBtn;
let gradientTypeSelect;

// Function references
let showNotification;
let copyToClipboard;

/**
 * Initializes the module with DOM references and helper functions
 */
function init(elements, constants, utils) {
    // Store DOM references
    previewElements = elements.previewElements;
    mobilePreview1 = elements.mobilePreview1;
    mobilePreview2 = elements.mobilePreview2;
    copyGradientCssBtn = elements.copyGradientCssBtn;
    gradientTypeSelect = elements.gradientTypeSelect;
    
    // Store constants
    DARK_BG_LUMINANCE_THRESHOLD = constants.DARK_BG_LUMINANCE_THRESHOLD;
    WCAG_AA_THRESHOLD = constants.WCAG_AA_THRESHOLD;
    WCAG_AAA_THRESHOLD = constants.WCAG_AAA_THRESHOLD;
    
    // Store utility functions
    showNotification = utils.showNotification;
    copyToClipboard = utils.copyToClipboard;
}

/**
 * Generates a random color combination for previews
 */
function generateCombination() {
    isGradientActive = false;
    copyGradientCssBtn.disabled = true;
    previewElements.forEach(el => el.classList.remove('has-gradient'));

   // Aim for decent contrast initially, but allow randomness
   let color1Hsl, color2Hsl, contrast = 0;
   let attempts = 0;
   const maxAttempts = 10;

   // Try a few times to get at least *some* contrast
   while (contrast < 1.5 && attempts < maxAttempts) {
       color1Hsl = getRandomHsl(10, 90, 5, 95); // Wider range
       color2Hsl = getRandomHsl(10, 90, 5, 95);
       contrast = getContrastRatio(color1Hsl, color2Hsl);
       attempts++;
   }

   currentPreviewColors[0] = { bgColorHsl: color1Hsl, textColorHsl: color2Hsl };
   currentPreviewColors[1] = { bgColorHsl: color2Hsl, textColorHsl: color1Hsl };

   updatePreview(mobilePreview1, 0);
   updatePreview(mobilePreview2, 1);
}

/** Generates a random gradient background for previews. */
function generateGradient() {
    isGradientActive = true;
    copyGradientCssBtn.disabled = false;
    
    // Only add has-gradient class to mobile previews, not the preview area
    const mobileElements = [mobilePreview1, mobilePreview2];
    mobileElements.forEach(el => el.classList.add('has-gradient'));
    
    // Remove has-gradient from preview area if it exists
    const previewArea = document.getElementById('preview-area');
    if (previewArea) {
        previewArea.classList.remove('has-gradient');
    }

    const color1Hsl = getRandomHsl(40, 100, 35, 80); // Vibrant gradient colors
    const color2Hsl = getRandomHsl(40, 100, 35, 80);
    const hex1 = hslToHex(color1Hsl.h, color1Hsl.s, color1Hsl.l);
    const hex2 = hslToHex(color2Hsl.h, color2Hsl.s, color2Hsl.l);
    const type = gradientTypeSelect.value;
    const angle = Math.floor(Math.random() * 360);

    let gradientCss;
    if (type === 'radial') {
       gradientCss = `radial-gradient(circle, ${hex1}, ${hex2})`;
    } else { // linear
       gradientCss = `linear-gradient(${angle}deg, ${hex1}, ${hex2})`;
    }

    // Store base colors for potential copy, display updates handle visual
    currentPreviewColors[0] = { bgColorHsl: color1Hsl, textColorHsl: color2Hsl };
    currentPreviewColors[1] = { bgColorHsl: color2Hsl, textColorHsl: color1Hsl };

    // Only apply gradient to mobile preview elements, not the preview area
    mobileElements.forEach((previewEl) => {
        // Apply gradient with proper containment properties
        previewEl.style.background = gradientCss;
        previewEl.style.backgroundSize = '100% 100%';
        previewEl.style.backgroundOrigin = 'padding-box';
        previewEl.style.backgroundClip = 'padding-box';
        previewEl.style.backgroundRepeat = 'no-repeat';
        updatePreviewGradientInfo(previewEl, type, hex1, hex2);
    });
}

// Add the exportPreviewImage function if it doesn't exist
function exportPreviewImage() {
    try {
        // Use html2canvas to capture the preview area
        if (typeof html2canvas === 'undefined') {
            showNotification("La biblioteca html2canvas no está disponible", true);
            return;
        }
        
        const previewArea = document.getElementById('preview-area');
        if (!previewArea) {
            showNotification("No se encontró el área de previsualización", true);
            return;
        }
        
        html2canvas(previewArea, {
            backgroundColor: getComputedStyle(document.body).backgroundColor,
            scale: 2, // Higher quality
            logging: false
        }).then(canvas => {
            // Create download link
            const link = document.createElement('a');
            link.download = 'centipy-color-preview.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            showNotification("Vistas previas exportadas como imagen PNG");
        }).catch(err => {
            console.error('Error al exportar las vistas previas:', err);
            showNotification("Error al exportar las vistas previas: " + err.message, true);
        });
    } catch (error) {
        console.error('Error al exportar las vistas previas:', error);
        showNotification("Error al exportar las vistas previas: " + error.message, true);
    }
}

// Make sure to export the new function
export {
    init,
    generateCombination,
    generateGradient,
    updatePreviewGradientInfo,
    copyGradientCss,
    updatePreview,
    colorMix,
    togglePreviewMode,
    getWcagLevel,
    exportPreviewImage
};

/** Updates the display info specifically for gradient previews. */
function updatePreviewGradientInfo(previewEl, type, hex1, hex2) {
    const wrapper = previewEl.closest('.device-wrapper');
    if (wrapper) {
        wrapper.querySelector('.bg-code').textContent = `Grad: ${hex1.toUpperCase()}`;
        wrapper.querySelector('.text-code').textContent = ` -> ${hex2.toUpperCase()}`;
    }
    // Clear/update text inside preview for gradient
    const content = previewEl.querySelector('.mobile-content');
    const nameSpan = content.querySelector('.color-name');
    nameSpan.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)}`; // Show "Linear" or "Radial"
    nameSpan.style.color = 'rgba(255, 255, 255, 0.85)'; // Ensure visibility
    nameSpan.style.textShadow = '1px 1px 2px rgba(0,0,0,0.6)';
    // Remove editable aspect if needed? No, keep it potentially editable.

   // Hide contrast info as it's not applicable
   const contrastInfo = content.querySelector('.contrast-info');
   contrastInfo.style.opacity = 0; // Hide visually
   contrastInfo.setAttribute('aria-hidden', 'true');
}

/** Copies the CSS background property of the current gradient. */
function copyGradientCss() {
   if (!isGradientActive) {
        showNotification("No hay gradiente activo para copiar.", true);
        return;
   }
   // Use the style directly from the element
   const bgStyle = mobilePreview1.style.background;
   if (bgStyle && bgStyle.includes('gradient')) {
       copyToClipboard(`background: ${bgStyle};`, "CSS del gradiente copiado!");
   } else {
       showNotification("No se pudo obtener el CSS del gradiente.", true);
   }
}

/** Updates a single mobile preview display with given colors. */
function updatePreview(previewElement, index) {
   if (!currentPreviewColors[index]) return;

   const { bgColorHsl, textColorHsl } = currentPreviewColors[index];
   const bgColorHex = hslToHex(bgColorHsl.h, bgColorHsl.s, bgColorHsl.l);
   const textColorHex = hslToHex(textColorHsl.h, textColorHsl.s, textColorHsl.l);

   previewElement.style.background = bgColorHex;
   previewElement.style.color = textColorHex; // Default text color for content

   // Add/remove class for dark background styling (e.g., home bar)
   previewElement.classList.toggle('dark-bg', bgColorHsl.l < DARK_BG_LUMINANCE_THRESHOLD);

   const content = previewElement.querySelector('.mobile-content');
   const nameSpan = content.querySelector('.color-name');
   const hexBadge = content.querySelector('.hex-badge');
   const contrastInfo = content.querySelector('.contrast-info');
   const contrastRatioSpan = contrastInfo.querySelector('.contrast-ratio');
   const wcagLevelSpan = contrastInfo.querySelector('.wcag-level');

   // Update content text if it's still the default placeholder
   if (nameSpan.textContent === 'EDITAME') {
        nameSpan.textContent = getDescriptiveColorName(textColorHsl);
   }
    if (hexBadge.textContent === '#TEXTO' || hexBadge.textContent === '#FONDO') {
        hexBadge.textContent = textColorHex.toUpperCase();
    }

   // Style the hex badge based on background/text colors
   hexBadge.style.backgroundColor = bgColorHex;
   hexBadge.style.color = textColorHex;
   hexBadge.style.borderColor = colorMix(textColorHex, 'transparent', 0.8); // Border slightly transparent version of text

   // Update contrast info
   const contrast = getContrastRatio(bgColorHsl, textColorHsl);
   const wcag = getWcagLevel(contrast);
   contrastRatioSpan.textContent = `Ratio: ${contrast.toFixed(2)}`;
   wcagLevelSpan.textContent = wcag.level;
   wcagLevelSpan.className = `wcag-level ${wcag.class}`; // Update class for styling
   contrastInfo.style.opacity = 1; // Ensure visible for solid colors
   contrastInfo.removeAttribute('aria-hidden');

   // Update color codes below preview
   const wrapper = previewElement.closest('.device-wrapper');
   if (wrapper) {
       wrapper.querySelector('.bg-code').textContent = `BG: ${bgColorHex.toUpperCase()}`;
       wrapper.querySelector('.text-code').textContent = `TXT: ${textColorHex.toUpperCase()}`;
   }
}

/** Utility function to mix colors (basic CSS color-mix simulation) */
function colorMix(color1, color2, weight = 0.5) {
   // Basic implementation - assumes hex for now
    const hsl1 = hexToHsl(color1);
    // For now, just return a semi-transparent version of color1
    if (hsl1) {
        return `hsla(${hsl1.h}, ${hsl1.s}%, ${hsl1.l}%, ${1 - weight})`;
    }
    return 'rgba(0,0,0,0.2)'; // Fallback
}

/** Inverts the background and text colors in the previews. */
function togglePreviewMode() {
    if (isGradientActive) {
        showNotification("La inversión no aplica a gradientes. Genera una combinación sólida.", true);
        return;
    }
    if (!currentPreviewColors[0] || !currentPreviewColors[1]) {
        showNotification("Genera una combinación primero.", true);
        return;
    }

    // Swap the color objects in the state array
    [currentPreviewColors[0], currentPreviewColors[1]] = [currentPreviewColors[1], currentPreviewColors[0]];

    // Update both previews with the swapped colors
    updatePreview(mobilePreview1, 0);
    updatePreview(mobilePreview2, 1);
    showNotification("Vistas claro/oscuro invertidas.");
}

/**
 * Determines WCAG compliance level based on contrast ratio
 */
function getWcagLevel(contrast) {
    if (contrast >= WCAG_AAA_THRESHOLD) {
        return { level: 'AAA', class: 'wcag-aaa' };
    } else if (contrast >= WCAG_AA_THRESHOLD) {
        return { level: 'AA', class: 'wcag-aa' };
    } else {
        return { level: 'Fail', class: 'wcag-fail' };
    }
}

