/**
 * Export Functions Module
 * Handles exporting palette data in various formats
 */

import { hslToHex, getDescriptiveColorName } from './color_utils.js';

// Module state and references
let currentHslPaletteColors = [];
let paletteContainer;
let body;
let showNotification;
let copyToClipboard;

/**
 * Initializes the module with DOM references and state
 */
function init(elements, state, callbacks) {
    paletteContainer = elements.paletteContainer;
    body = elements.body;
    
    // Important: Store a reference to the array, not a copy
    currentHslPaletteColors = state.currentHslPaletteColors;
    
    showNotification = callbacks.showNotification;
    copyToClipboard = callbacks.copyToClipboard;
}

/**
 * Copies all hex color codes from the current palette to clipboard
 */
function copyAllHex() {
    console.log("copyAllHex called, colors:", currentHslPaletteColors);
    
    // Verificar si hay elementos en el DOM aunque el array esté vacío
    const colorElements = paletteContainer.querySelectorAll('.color-swatch');
    
    if ((!currentHslPaletteColors || currentHslPaletteColors.length === 0) && colorElements.length === 0) {
        showNotification('No hay colores para copiar', 'error');
        return;
    }
    
    // Si el array está vacío pero hay elementos en el DOM, intentar obtener los colores de los elementos
    let hexCodes = [];
    
    if (currentHslPaletteColors && currentHslPaletteColors.length > 0) {
        hexCodes = currentHslPaletteColors.map(color => hslToHex(color.h, color.s, color.l));
    } else if (colorElements.length > 0) {
        // Extraer colores de los elementos del DOM
        hexCodes = Array.from(colorElements).map(el => {
            const bgColor = getComputedStyle(el).backgroundColor;
            // Convertir rgb/rgba a hex
            return rgbToHex(bgColor);
        });
    }
    
    if (hexCodes.length === 0) {
        showNotification('No se pudieron obtener los colores', 'error');
        return;
    }
    
    const hexText = hexCodes.join('\n');
    
    copyToClipboard(hexText);
    showNotification('Códigos HEX copiados al portapapeles', 'success');
}

/**
 * Convierte un valor RGB/RGBA a formato hexadecimal
 */
function rgbToHex(rgb) {
    // Extraer valores R, G, B de la cadena rgb/rgba
    const rgbMatch = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (!rgbMatch) return '#000000'; // Valor por defecto si no hay coincidencia
    
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    
    // Convertir a hex
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

/**
 * Copies the CSS gradient code to clipboard
 */
function copyGradientCss(gradientElement) {
    if (!gradientElement || !gradientElement.style || !gradientElement.style.background) {
        showNotification("No hay gradiente activo para copiar", 'error');
        return;
    }
    
    const bgStyle = gradientElement.style.background;
    if (bgStyle && bgStyle.includes('gradient')) {
        copyToClipboard(`background: ${bgStyle};`, "CSS del gradiente copiado al portapapeles");
    } else {
        showNotification("No se pudo obtener el CSS del gradiente", 'error');
    }
}

export {
    init,
    copyAllHex,
    exportCssVariables,
    exportPaletteImage,
    rgbToHex,
    copyGradientCss // Export the new function
};

/** Exports the current palette as CSS custom properties. */
function exportCssVariables() {
    if (currentHslPaletteColors.length === 0) return;
    let cssString = ':root {\n';
    currentHslPaletteColors.forEach((hsl, index) => {
        const hex = hslToHex(hsl.h, hsl.s, hsl.l);
        // Generate a semantic name if possible, fallback to index
        const name = getDescriptiveColorName(hsl).toLowerCase().replace(/\s+/g, '-');
        cssString += `  --color-${name}-${index + 1}: ${hex};\n`; // Example name: --color-vivid-blue-1
    });
    cssString += '}';
    copyToClipboard(cssString, 'Variables CSS copiadas!');
}

/** Exports the palette container as a PNG image. */
function exportPaletteImage() {
    if (!paletteContainer || currentHslPaletteColors.length === 0) {
        //Dejar vacio el return
        return;
    }
    showNotification('Generando imagen de paleta...');
    // Temporarily set background for capture if needed, or use html2canvas option
    const bgColor = getComputedStyle(body).getPropertyValue('--bg-secondary-light'); // Use body bg for context

    html2canvas(paletteContainer, {
        backgroundColor: bgColor, // Ensures background isn't transparent
        scale: 2, // Higher resolution
        logging: false, // Reduce console noise
        useCORS: true // If using external resources (fonts maybe?)
    }).then(canvas => {
       const link = document.createElement('a');
       link.download = `centipy-color-palette-${Date.now()}.png`;
       link.href = canvas.toDataURL('image/png');
       link.click();
       showNotification('Imagen de paleta descargada.', false);
   }).catch(err => {
        console.error("Error al exportar paleta con html2canvas:", err);
        showNotification('Error al exportar imagen de paleta.', true);
   });
}
