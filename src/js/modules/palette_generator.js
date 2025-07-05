import { 
    clamp, 
    hslToHex, 
    parseColorString, 
    getRandomHsl, 
    getDescriptiveColorName 
} from './color_utils.js';

// Module state and references
let currentHslPaletteColors = [];
let lockedColors = [];
let paletteHistory = [];
let MAX_HISTORY = 10;
let paletteContainer, colorCountInput, harmonySelect, brightnessSlider, saturationSlider, undoBtn;
let showNotification, openHslPopup, copyToClipboard, updateActionButtonsState;

function init(elements, state, constants, utils) {
    paletteContainer = elements.paletteContainer;
    colorCountInput = elements.colorCountInput;
    harmonySelect = elements.harmonySelect;
    brightnessSlider = elements.brightnessSlider;
    saturationSlider = elements.saturationSlider;
    undoBtn = elements.undoBtn;
    
    currentHslPaletteColors = state.currentHslPaletteColors;
    lockedColors = state.lockedColors;
    paletteHistory = state.paletteHistory;
    
    MAX_HISTORY = constants.MAX_HISTORY;
    
    showNotification = utils.showNotification;
    openHslPopup = utils.openHslPopup;
    copyToClipboard = utils.copyToClipboard;
    updateActionButtonsState = utils.updateActionButtonsState;
}

function saveToHistory() {
    const colorsCopy = currentHslPaletteColors.map(color => ({ ...color }));
    const lockedCopy = [...lockedColors];
    paletteHistory.push({ colors: colorsCopy, locked: lockedCopy });
    if (paletteHistory.length > MAX_HISTORY) {
        paletteHistory.shift();
    }
    if (updateActionButtonsState) {
        updateActionButtonsState();
    }
}

function undoLastPalette() {
    if (paletteHistory.length === 0) return;
    const lastState = paletteHistory.pop();
    currentHslPaletteColors.length = 0;
    lockedColors.length = 0;
    lastState.colors.forEach(color => currentHslPaletteColors.push({ ...color }));
    lastState.locked.forEach(locked => lockedColors.push(locked));
    displayPalette();
    updateActionButtonsState();
}

function generateHarmony(baseHue, colorCount, harmonyType) {
    const colors = [];
    const baseSaturation = 70;
    const baseLightness = 60;

    switch (harmonyType) {
        case 'monochromatic': {
            const lightnessStep = colorCount > 1 ? 80 / (colorCount - 1) : 0;
            for (let i = 0; i < colorCount; i++) {
                const lightness = 10 + (lightnessStep * i);
                const saturation = clamp(baseSaturation + (Math.random() * 20 - 10), 40, 90);
                colors.push({ h: baseHue, s: saturation, l: lightness });
            }
            colors.sort((a, b) => a.l - b.l);
            break;
        }
        case 'analogous': {
            const range = 60;
            for (let i = 0; i < colorCount; i++) {
                const step = i / (colorCount - 1);
                const h = (baseHue - range / 2 + (step * range) + 360) % 360;
                const s = clamp(baseSaturation - 10 + (Math.random() * 20), 50, 90);
                const l = clamp(baseLightness - 10 + (Math.random() * 20), 40, 70);
                colors.push({ h, s, l });
            }
            break;
        }
        default: {
            for (let i = 0; i < colorCount; i++) {
                colors.push(getRandomHsl(40, 95, 30, 80));
            }
            break;
        }
    }
    return colors;
}

function generatePalette() {
    if (currentHslPaletteColors.length > 0) {
        saveToHistory();
    }

    const colorCount = parseInt(colorCountInput.value, 10) || 5;
    const harmonyType = harmonySelect.value;
    
    let baseHue;
    if (harmonyType === 'monochromatic' || harmonyType.includes('random') || (lockedColors[0] && currentHslPaletteColors[0])) {
        baseHue = Math.floor(Math.random() * 360);
    } else {
        baseHue = currentHslPaletteColors[0]?.h || Math.floor(Math.random() * 360);
    }

    const newColors = generateHarmony(baseHue, colorCount, harmonyType);

    const finalColors = newColors.map((color, i) => {
        return lockedColors[i] && currentHslPaletteColors[i] ? currentHslPaletteColors[i] : color;
    });

    currentHslPaletteColors.length = 0;
    currentHslPaletteColors.push(...finalColors);

    if (lockedColors.length !== colorCount) {
        lockedColors = Array(colorCount).fill(false);
    }
    
    displayPalette();
    
    // Al generar una nueva paleta, los ajustes de los sliders se aplican desde cero
    window._originalPaletteColors = null;
    window._originalPaletteBrightnessColors = null;
    
    adjustPaletteBrightness(parseFloat(brightnessSlider.value));
    adjustPaletteSaturation(parseInt(saturationSlider.value, 10));
}

function displayPalette() {
    paletteContainer.innerHTML = '';
    const fragment = document.createDocumentFragment();

    currentHslPaletteColors.forEach((color, index) => {
        const hex = hslToHex(color.h, color.s, color.l);
        const isLocked = lockedColors[index];

        const swatch = document.createElement('div');
        swatch.className = `color-swatch ${isLocked ? 'locked' : ''}`;
        swatch.style.backgroundColor = hex;
        swatch.dataset.index = index;
        swatch.title = `Clic para ajustar HSL (${getDescriptiveColorName(color)})`;
        swatch.setAttribute('role', 'button');
        swatch.setAttribute('tabindex', '0');
        swatch.style.opacity = '1';
        swatch.style.transform = 'translateY(0) scale(1)';
        swatch.style.animation = 'none';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'color-info';

        const hexSpan = document.createElement('span');
        hexSpan.className = 'hex-code';
        hexSpan.textContent = hex.toUpperCase();

        const actionButtons = document.createElement('div');
        actionButtons.className = 'swatch-actions';

        const copyButton = document.createElement('button');
        copyButton.type = 'button';
        copyButton.className = 'swatch-action-btn copy-btn';
        copyButton.title = `Copiar ${hex.toUpperCase()}`;
        copyButton.innerHTML = `<svg aria-hidden="true"><use xlink:href="#icon-copy"></use></svg>`;
        copyButton.addEventListener('click', (e) => {
            e.stopPropagation();
            copyToClipboard(hex.toUpperCase())
                .then(() => showNotification(`Color ${hex.toUpperCase()} copiado!`, false))
                .catch(err => showNotification(`Error al copiar: ${err.message}`, true));
        });

        const lockButton = document.createElement('button');
        lockButton.type = 'button';
        lockButton.className = 'swatch-action-btn lock-btn';
        lockButton.title = isLocked ? 'Desbloquear Color' : 'Bloquear Color';
        lockButton.innerHTML = `<svg aria-hidden="true"><use xlink:href="#icon-${isLocked ? 'lock' : 'unlock'}"></use></svg>`;
        lockButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLock(index);
        });

        actionButtons.appendChild(copyButton);
        actionButtons.appendChild(lockButton);
        infoDiv.appendChild(hexSpan);
        infoDiv.appendChild(actionButtons);
        swatch.appendChild(infoDiv);

        swatch.addEventListener('click', handleSwatchClick);
        swatch.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSwatchClick(e);
            }
        });
        fragment.appendChild(swatch);
    });
    paletteContainer.appendChild(fragment);
    updateActionButtonsState();
}

function handleSwatchClick(e) {
    const swatch = e.currentTarget;
    const index = parseInt(swatch.dataset.index, 10);
    openHslPopup(index, swatch);
}

function toggleLock(index) {
    if (index < 0 || index >= lockedColors.length) return;
    lockedColors[index] = !lockedColors[index];
    displayPalette();
    showNotification(`Color ${index + 1} ${lockedColors[index] ? 'bloqueado' : 'desbloqueado'}.`);
}

// =======================================================
// CÓDIGO RESTAURADO PARA LOS SLIDERS
// =======================================================
function adjustPaletteSaturation(saturationValue) {
    if (!currentHslPaletteColors || currentHslPaletteColors.length === 0) return;
    
    // Almacena los colores originales si no se han guardado para este ajuste
    if (!window._originalPaletteColors) {
        window._originalPaletteColors = currentHslPaletteColors.map(color => ({ ...color }));
    }
    
    currentHslPaletteColors.forEach((color, index) => {
        const originalColor = window._originalPaletteColors[index];
        let newSaturation;

        if (saturationValue >= 0) {
            newSaturation = originalColor.s + ((100 - originalColor.s) * (saturationValue / 100));
        } else {
            newSaturation = originalColor.s * (1 + (saturationValue / 100));
        }
        
        color.s = Math.round(clamp(newSaturation, 0, 100));
        
        const swatch = paletteContainer.querySelector(`.color-swatch[data-index="${index}"]`);
        if (swatch) {
            const hexCode = hslToHex(color.h, color.s, color.l);
            swatch.style.backgroundColor = hexCode;
            swatch.querySelector('.hex-code').textContent = hexCode.toUpperCase();
        }
    });
}

function adjustPaletteBrightness(brightnessValue) {
    if (!currentHslPaletteColors || currentHslPaletteColors.length === 0) return;
    
    // Almacena los colores originales si no se han guardado para este ajuste
    if (!window._originalPaletteBrightnessColors) {
        window._originalPaletteBrightnessColors = currentHslPaletteColors.map(color => ({ ...color }));
    }
    
    currentHslPaletteColors.forEach((color, index) => {
        const originalColor = window._originalPaletteBrightnessColors[index];
        let newLightness;

        if (brightnessValue > 0) {
            newLightness = originalColor.l + ((100 - originalColor.l) * (brightnessValue / 100));
        } else {
            newLightness = originalColor.l * (1 + (brightnessValue / 100));
        }
        
        color.l = Math.round(clamp(newLightness, 0, 100));
        
        const swatch = paletteContainer.querySelector(`.color-swatch[data-index="${index}"]`);
        if (swatch) {
            const hexCode = hslToHex(color.h, color.s, color.l);
            swatch.style.backgroundColor = hexCode;
            swatch.querySelector('.hex-code').textContent = hexCode.toUpperCase();
        }
    });
}
// =======================================================
// FIN DEL CÓDIGO RESTAURADO
// =======================================================

export {
    init,
    generatePalette,
    undoLastPalette,
    saveToHistory,
    displayPalette,
    adjustPaletteSaturation,
    adjustPaletteBrightness
};