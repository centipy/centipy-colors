/**
 * Export Functions Module
 * Handles exporting palette data in various formats
 */

import { hslToHex, getDescriptiveColorName, hslToRgb } from './color_utils.js';

// Module state and references
let currentHslPaletteColors = [];
let paletteContainer;
let body;
let showNotification;
let copyToClipboard;

function init(elements, state, callbacks) {
    paletteContainer = elements.paletteContainer;
    body = elements.body;
    currentHslPaletteColors = state.currentHslPaletteColors;
    showNotification = callbacks.showNotification;
    copyToClipboard = callbacks.copyToClipboard;
}

function copyAllHex() {
    if (!currentHslPaletteColors || currentHslPaletteColors.length === 0) {
        showNotification('No hay colores para copiar.', true);
        return;
    }
    const hexCodes = currentHslPaletteColors.map(color => hslToHex(color.h, color.s, color.l));
    copyToClipboard(hexCodes.join('\n'))
        .then(() => showNotification('Códigos HEX copiados al portapapeles.', false))
        .catch(() => showNotification('Error al copiar códigos HEX.', true));
}

function rgbToHex(rgb) {
    const rgbMatch = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (!rgbMatch) return '#000000';
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function copyGradientCss(gradientElement) {
    if (!gradientElement || !gradientElement.style || !gradientElement.style.background) {
        showNotification("No hay gradiente activo para copiar", true);
        return;
    }
    const bgStyle = gradientElement.style.background;
    if (bgStyle && bgStyle.includes('gradient')) {
        copyToClipboard(`background: ${bgStyle};`)
            .then(() => showNotification("CSS del gradiente copiado.", false))
            .catch(() => showNotification("Error al copiar CSS del gradiente.", true));
    } else {
        showNotification("No se pudo obtener el CSS del gradiente.", true);
    }
}

/** Exports the current palette as CSS custom properties. */
function exportCssVariables() {
    if (currentHslPaletteColors.length === 0) {
        showNotification('No hay colores para exportar.', true);
        return;
    }
    let cssString = ':root {\n';
    currentHslPaletteColors.forEach((hsl, index) => {
        const hex = hslToHex(hsl.h, hsl.s, hsl.l);
        const name = getDescriptiveColorName(hsl).toLowerCase().replace(/\s+/g, '-');
        cssString += `  --color-${name}-${index + 1}: ${hex};\n`;
    });
    cssString += '}';

    // Llama a la función de copiado y LUEGO muestra la notificación
    copyToClipboard(cssString)
        .then(() => {
            showNotification('Variables CSS copiadas al portapapeles.', false);
        })
        .catch(err => {
            showNotification('Error al copiar variables CSS.', true);
            console.error('Error al copiar CSS:', err);
        });
}

/** Exports the palette container as a PNG image. */
function exportPaletteImage() {
    if (!paletteContainer || currentHslPaletteColors.length === 0) {
        return;
    }
    showNotification('Generando imagen de paleta...');
    const bgColor = getComputedStyle(body).getPropertyValue('--bg-secondary-light');
    html2canvas(paletteContainer, {
        backgroundColor: bgColor,
        scale: 2,
        logging: false,
        useCORS: true
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

export {
    init,
    copyAllHex,
    exportCssVariables,
    exportPaletteImage,
    rgbToHex,
    copyGradientCss
};