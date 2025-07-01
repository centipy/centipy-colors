/**
 * Palette Generator Module
 * Handles color palette generation with various harmony types and user settings
 */

import { 
    clamp, 
    hslToHex, 
    parseColorString, 
    getRandomHsl, 
    adjustHsl, 
    getDescriptiveColorName 
} from './color_utils.js';

// Module state and references
let currentHslPaletteColors = [];
let lockedColors = [];
let paletteHistory = [];
let MAX_HISTORY = 10;

// DOM elements
let paletteContainer;
let colorCountInput;
let harmonySelect;
let brightnessSlider;
let saturationSlider;
let baseColorInput;
let undoBtn;

// Function references
let showNotification;
let openHslPopup;
let copyToClipboard;
let updateActionButtonsState;

/**
 * Initializes the module with DOM references and helper functions
 */
function init(elements, state, constants, utils) {
    // Store DOM references
    paletteContainer = elements.paletteContainer;
    colorCountInput = elements.colorCountInput;
    harmonySelect = elements.harmonySelect;
    brightnessSlider = elements.brightnessSlider;
    saturationSlider = elements.saturationSlider;
    baseColorInput = elements.baseColorInput;
    undoBtn = elements.undoBtn;
    
    // Store state references
    currentHslPaletteColors = state.currentHslPaletteColors;
    lockedColors = state.lockedColors;
    paletteHistory = state.paletteHistory;
    
    // Store constants
    MAX_HISTORY = constants.MAX_HISTORY;
    
    // Store utility functions
    showNotification = utils.showNotification;
    openHslPopup = utils.openHslPopup;
    copyToClipboard = utils.copyToClipboard;
    updateActionButtonsState = utils.updateActionButtonsState;
}

/**
 * Saves the current palette state to the history array
 */
function saveToHistory() {
    // Make deep copies of the arrays to avoid reference issues
    const colorsCopy = currentHslPaletteColors.map(color => ({ ...color }));
    const lockedCopy = [...lockedColors];
    
    // Add to history
    paletteHistory.push({
        colors: colorsCopy,
        locked: lockedCopy
    });
    
    // Limit history size
    if (paletteHistory.length > MAX_HISTORY) {
        paletteHistory.shift();
    }
    
    // Update undo button state
    if (updateActionButtonsState) {
        updateActionButtonsState();
    }
    
    console.log("Saved to history. History length:", paletteHistory.length);
}

/**
 * Restores the previous palette state from history
 */

/**
 * Reverts to the previous palette state from history
 */
function undoLastPalette() {
    if (paletteHistory.length === 0) {
        console.log("No hay historial para deshacer");
        return;
    }
    
    // Get the last state from history
    const lastState = paletteHistory.pop();
    
    // Restore colors and locked state
    currentHslPaletteColors.length = 0;
    lockedColors.length = 0;
    
    lastState.colors.forEach(color => {
        currentHslPaletteColors.push({ ...color });
    });
    
    lastState.locked.forEach(locked => {
        lockedColors.push(locked);
    });
    
    // Display the restored palette
    displayPalette();
    
    // Update undo button state
    updateActionButtonsState();
    
    console.log("Palette reverted to previous state");
}

function undoLastGeneration() {
    console.log("Undo last palette called");
    
    if (paletteHistory.length === 0) {
        console.log("No history to undo");
        return;
    }
    
    // Get the last state from history
    const lastState = paletteHistory.pop();
    
    // Restore the state
    currentHslPaletteColors = lastState.colors.map(color => ({ ...color }));
    lockedColors = [...lastState.locked];
    
    // Display the restored palette
    displayPalette();
    
    // Update undo button state
    if (updateActionButtonsState) {
        updateActionButtonsState();
    }
    
    console.log("Palette restored from history. Remaining history:", paletteHistory.length);
    
    // Show notification
    if (showNotification) {
        showNotification('Paleta anterior restaurada', 'success');
    }
}

/**
 * Generates a color harmony based on the specified parameters
 */
function generateHarmony(baseHue, colorCount, harmonyType, brightnessMult = 1, saturationMult = 1) {
    const colors = [];
    
    // Default saturation and lightness values
    const baseSaturation = 70 * saturationMult;
    const baseLightness = 60 * brightnessMult;
    
    switch (harmonyType) {
        case 'monochromatic':
            // Modificación para asegurar variación en paletas monocromáticas
            // Si no hay un color base específico, generamos uno aleatorio cada vez
            if (!baseColorInput.value.trim()) {
                baseHue = Math.floor(Math.random() * 360);
            } else {
                // Pequeña variación incluso con color seleccionado
                baseHue = (baseHue + Math.floor(Math.random() * 10) - 5 + 360) % 360;
            }
            
            // Mismo matiz, variando saturación y luminosidad
            const lightnessStep = 80 / (colorCount - 1);
            const minLightness = 10;
            
            for (let i = 0; i < colorCount; i++) {
                const lightness = minLightness + (lightnessStep * i);
                // Añadir variación de saturación para más variedad
                const saturationVariation = Math.random() * 10 - 5; // Variación de -5% a +5%
                const s = Math.max(0, Math.min(100, baseSaturation + saturationVariation));
                colors.push({ h: baseHue, s, l: lightness });
            }
            
            // Ordenar por luminosidad, de oscuro a claro
            colors.sort((a, b) => a.l - b.l);
            break;
            
        case 'analogous':
            // Adjacent hues on the color wheel (±30°)
            const analogousRange = 60;
            for (let i = 0; i < colorCount; i++) {
                const step = i / (colorCount - 1);
                const hueOffset = -analogousRange/2 + (step * analogousRange);
                const h = (baseHue + hueOffset + 360) % 360;
                const s = clamp(baseSaturation - 10 + (Math.random() * 20), 50, 90);
                const l = clamp(baseLightness - 10 + (Math.random() * 20), 40, 70);
                colors.push({ h, s, l });
            }
            break;
            
        case 'complementary':
            // Base color and its complement (180° apart)
            const complementHue = (baseHue + 180) % 360;
            
            // Distribute colors between the base and its complement
            for (let i = 0; i < colorCount; i++) {
                let h, s, l;
                
                if (i < colorCount / 2) {
                    // Colors around the base hue
                    const step = i / Math.max(1, (colorCount / 2) - 1);
                    h = (baseHue - 15 + (step * 30) + 360) % 360;
                    s = clamp(baseSaturation - 10 + (step * 20), 50, 90);
                    l = clamp(baseLightness - 10 + (step * 20), 40, 70);
                } else {
                    // Colors around the complement
                    const step = (i - colorCount / 2) / Math.max(1, colorCount - (colorCount / 2) - 1);
                    h = (complementHue - 15 + (step * 30) + 360) % 360;
                    s = clamp(baseSaturation - 10 + (step * 20), 50, 90);
                    l = clamp(baseLightness - 10 + (step * 20), 40, 70);
                }
                
                colors.push({ h, s, l });
            }
            break;
            
        // Add other harmony types here...
        
        case 'random':
        default:
            // Completely random colors with high saturation
            for (let i = 0; i < colorCount; i++) {
                const randomHsl = getRandomHsl(true); // true for vibrant colors
                colors.push(randomHsl);
            }
            break;
    }
    
    return colors;
}

// Eliminar estas funciones que están causando el error
// Eliminar completamente la función generateMonochromaticHarmony
// y cualquier otra función duplicada que esté causando conflictos
/**
 * Generates a new color palette based on user settings
 */
// Find the function that generates monochromatic harmonies
// Also in the generatePalette function, add this before calling the harmony generation functions
function generatePalette() {
    // Save current state to history before generating a new one
    if (currentHslPaletteColors.length > 0) {
        saveToHistory();
    }
    
    // Get the number of colors to generate
    const colorCount = parseInt(colorCountInput.value, 10) || 5;
    
    // Get the harmony type
    const harmonyType = harmonySelect.value;
    
    // Get the brightness and saturation multipliers
    const brightnessMult = parseFloat(brightnessSlider.value);
    const saturationMult = parseFloat(saturationSlider.value);
    
    // Generate base color if none exists
    let baseHue;
    if (currentHslPaletteColors.length === 0 || !currentHslPaletteColors[0]) {
        baseHue = Math.floor(Math.random() * 360);
    } else {
        baseHue = currentHslPaletteColors[0].h;
    }
    
    // Generate new colors based on harmony type
    const newColors = generateHarmony(baseHue, colorCount, harmonyType, brightnessMult, saturationMult);
    
    // Apply locked colors
    if (lockedColors.length > 0) {
        for (let i = 0; i < Math.min(newColors.length, lockedColors.length); i++) {
            if (lockedColors[i] && i < currentHslPaletteColors.length) {
                newColors[i] = { ...currentHslPaletteColors[i] };
            }
        }
    }
    
    // Update state
    currentHslPaletteColors = newColors;
    
    // Ensure lockedColors array matches the new colors array length
    if (lockedColors.length !== newColors.length) {
        lockedColors = Array(newColors.length).fill(false);
        if (lockedColors.length > 0) {
            for (let i = 0; i < Math.min(newColors.length, lockedColors.length); i++) {
                lockedColors[i] = lockedColors[i] || false;
            }
        }
    }
    
    // Display the new palette
    displayPalette();
    
    console.log("New palette generated with", colorCount, "colors using", harmonyType, "harmony");
}

/**
 * Applies a user-specified base color
 */
function applyBaseColor() {
    const colorInput = baseColorInput.value.trim();
    
    if (!colorInput) {
        // If empty, generate a random color
        const randomHsl = getRandomHsl();
        baseColorInput.value = hslToHex(randomHsl.h, randomHsl.s, randomHsl.l);
        showNotification('Color base aleatorio generado', 'info');
        return;
    }
    
    try {
        const parsedColor = parseColorString(colorInput);
        if (parsedColor) {
            baseColorInput.value = hslToHex(parsedColor.h, parsedColor.s, parsedColor.l);
            showNotification('Color base aplicado', 'success');
        } else {
            throw new Error('Formato de color no reconocido');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

/**
 * Displays the current palette in the UI
 */
function displayPalette() {
    // Clear existing swatches
    paletteContainer.innerHTML = '';
    
    // Crear un fragment para mejorar el rendimiento
    const fragment = document.createDocumentFragment();
    
    // Create new swatches for each color
    currentHslPaletteColors.forEach((color, index) => {
        const hex = hslToHex(color.h, color.s, color.l);
        const isLocked = lockedColors[index];

        const swatch = document.createElement('div');
        swatch.className = `color-swatch ${isLocked ? 'locked' : ''}`;
        swatch.style.backgroundColor = hex;
        swatch.dataset.index = index;
        swatch.title = `Ajustar HSL (${getDescriptiveColorName(color)}) | Ctrl+Clic para copiar ${hex}`;
        swatch.setAttribute('aria-label', `Color ${index + 1}: ${hex}. ${isLocked ? 'Bloqueado.' : ''} ${swatch.title}`);
        swatch.setAttribute('role', 'button'); // Make it act like a button
        swatch.setAttribute('tabindex', '0'); // Make it focusable

        // Usar animación por defecto
        const animate = true;
        if (!animate) {
            swatch.style.animation = 'none';
            swatch.style.opacity = '1';
            swatch.style.transform = 'translateY(0) scale(1)';
        } else {
             // Ensure animation delay is calculated correctly even if palette size changes
             swatch.style.animationDelay = `${0.05 * index}s`;
        }

        const infoDiv = document.createElement('div');
        infoDiv.className = 'color-info';

        const hexSpan = document.createElement('span');
        hexSpan.className = 'hex-code';
        hexSpan.textContent = hex.toUpperCase();

        const lockButton = document.createElement('button');
        lockButton.type = 'button'; // Explicit type
        lockButton.className = 'lock-btn';
        lockButton.title = isLocked ? 'Desbloquear Color' : 'Bloquear Color';
        lockButton.setAttribute('aria-label', lockButton.title);
        lockButton.innerHTML = `<svg aria-hidden="true"><use xlink:href="#icon-${isLocked ? 'lock' : 'unlock'}"></use></svg>`;
        lockButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent swatch click event
            toggleLock(index);
        });

        infoDiv.appendChild(hexSpan);
        infoDiv.appendChild(lockButton);
        swatch.appendChild(infoDiv);

        // Event listeners for swatch interaction
        swatch.addEventListener('click', handleSwatchClick);
        swatch.addEventListener('keydown', (e) => {
             if (e.key === 'Enter' || e.key === ' ') {
                 e.preventDefault(); // Prevent space scrolling
                 handleSwatchClick(e);
             }
         });

        fragment.appendChild(swatch);
    });

    paletteContainer.appendChild(fragment);
    updateActionButtonsState(); // Update button states after display
}

/** Handles clicks or Enter/Space on a color swatch. */
function handleSwatchClick(e) {
     const swatch = e.currentTarget;
     const index = parseInt(swatch.dataset.index, 10);
     const hex = swatch.querySelector('.hex-code').textContent;

     if (e.ctrlKey || e.metaKey) { // Ctrl/Cmd + Click for copy
         copyToClipboard(hex, `Color ${hex} copiado!`);
     } else {
         openHslPopup(index, swatch); // Pass swatch as trigger element
     }
}

/** Toggles the lock state for a color swatch. */
function toggleLock(index) {
    if (index < 0 || index >= lockedColors.length) return;

    lockedColors[index] = !lockedColors[index];
    const isLocked = lockedColors[index];
    const swatch = paletteContainer.children[index]; // Assumes direct child relationship
    const lockButton = swatch?.querySelector('.lock-btn');

    if (swatch && lockButton) {
       swatch.classList.toggle('locked', isLocked);
       swatch.setAttribute('aria-label', swatch.getAttribute('aria-label').replace(isLocked ? 'Desbloqueado.' : 'Bloqueado.', isLocked ? 'Bloqueado.' : 'Desbloqueado.')); // Update ARIA label
       lockButton.title = isLocked ? 'Desbloquear Color' : 'Bloquear Color';
       lockButton.setAttribute('aria-label', lockButton.title);
       lockButton.innerHTML = `<svg aria-hidden="true"><use xlink:href="#icon-${isLocked ? 'lock' : 'unlock'}"></use></svg>`;
       showNotification(`Color ${index + 1} ${isLocked ? 'bloqueado' : 'desbloqueado'}.`);
    }
}

/**
 * Adjusts the saturation of all colors in the current palette in real-time
 * @param {number} saturationValue - Value from -100 to 100 representing saturation adjustment
 */
function adjustPaletteSaturation(saturationValue) {
    if (!currentHslPaletteColors || currentHslPaletteColors.length === 0) return;
    
    // Store original colors if not already stored
    if (!window._originalPaletteColors || window._originalPaletteColors.length !== currentHslPaletteColors.length) {
        window._originalPaletteColors = currentHslPaletteColors.map(color => ({ ...color }));
    }
    
    // Apply adjustment to each color
    currentHslPaletteColors.forEach((color, index) => {
        const originalColor = window._originalPaletteColors[index];
        
        // Calculate new saturation based on original color
        let newSaturation;
        if (saturationValue >= 0) {
            // Increase saturation (up to 100%)
            newSaturation = originalColor.s + ((100 - originalColor.s) * (saturationValue / 100));
        } else {
            // Decrease saturation (down to 0%)
            newSaturation = Math.max(0, originalColor.s + (originalColor.s * (saturationValue / 100)));
        }
        
        // Update the color
        color.s = Math.round(Math.max(0, Math.min(100, newSaturation)));
        
        // Update the DOM element if it exists
        const colorSwatch = paletteContainer.querySelector(`.color-swatch[data-index="${index}"]`);
        if (colorSwatch) {
            const hexCode = hslToHex(color.h, color.s, color.l);
            colorSwatch.style.backgroundColor = hexCode;
            
            // Update hex code display
            const hexElement = colorSwatch.querySelector('.hex-code');
            if (hexElement) {
                hexElement.textContent = hexCode.toUpperCase();
            }
        }
    });
}

/**
 * Adjusts the brightness of all colors in the current palette in real-time
 * @param {number} brightnessValue - Value from 0.1 to 1.9 representing brightness adjustment
 */
function adjustPaletteBrightness(brightnessValue) {
    if (!currentHslPaletteColors || currentHslPaletteColors.length === 0) return;
    
    // Store original colors if not already stored
    if (!window._originalPaletteBrightnessColors || window._originalPaletteBrightnessColors.length !== currentHslPaletteColors.length) {
        window._originalPaletteBrightnessColors = currentHslPaletteColors.map(color => ({ ...color }));
    }
    
    // Apply adjustment to each color
    currentHslPaletteColors.forEach((color, index) => {
        const originalColor = window._originalPaletteBrightnessColors[index];
        
        // Calculate new lightness based on brightness multiplier
        let newLightness;
        
        if (brightnessValue >= 1) {
            // Increase brightness (make lighter)
            const factor = brightnessValue - 1; // 0 to 0.9
            newLightness = originalColor.l + ((100 - originalColor.l) * factor);
        } else {
            // Decrease brightness (make darker)
            newLightness = originalColor.l * brightnessValue;
        }
        
        // Ensure lightness stays within valid range (0-100)
        newLightness = Math.round(Math.max(0, Math.min(100, newLightness)));
        
        // Update the color
        color.l = newLightness;
        
        // Update the DOM element if it exists
        const colorSwatch = paletteContainer.querySelector(`.color-swatch[data-index="${index}"]`);
        if (colorSwatch) {
            const hexCode = hslToHex(color.h, color.s, color.l);
            colorSwatch.style.backgroundColor = hexCode;
            
            // Update hex code display
            const hexElement = colorSwatch.querySelector('.hex-code');
            if (hexElement) {
                hexElement.textContent = hexCode.toUpperCase();
            }
        }
    });
}

// Update the export statement to include the new function
export {
    init,
    generatePalette,
    undoLastPalette,
    saveToHistory,
    displayPalette,
    adjustPaletteSaturation,
    adjustPaletteBrightness
};
