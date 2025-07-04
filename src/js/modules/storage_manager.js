/**
 * Storage Manager Module
 * Handles saving and loading palettes from localStorage
 */

import { hslToHex, hexToHsl } from './color_utils.js';

// Module state and references
let currentHslPaletteColors = [];
let lockedColors = [];
let colorCountInput;
let favoritesListContainer;
let favoritesModal;
let favoritesModalControls;

// Function references
let showNotification;
let saveToHistory;
let displayPalette;

/**
 * Initializes the module with DOM references and helper functions
 */
function init(elements, state, utils) {
    // Store DOM references
    colorCountInput = elements.colorCountInput;
    favoritesListContainer = elements.favoritesListContainer;
    favoritesModal = elements.favoritesModal;
    favoritesModalControls = elements.favoritesModalControls;
    
    // Store state references
    currentHslPaletteColors = state.currentHslPaletteColors;
    lockedColors = state.lockedColors;
    
    // Store utility functions
    showNotification = utils.showNotification;
    saveToHistory = utils.saveToHistory;
    displayPalette = utils.displayPalette;
}

/**
 * Gets saved palettes from localStorage
 */
function getSavedPalettes() {
    try {
        const palettesJson = localStorage.getItem('centipyColorPalettes');
        return palettesJson ? JSON.parse(palettesJson) : [];
    } catch (e) {
         console.error("Error leyendo localStorage:", e);
         showNotification("Error al acceder a paletas guardadas.", true);
        return [];
    }
}

/** Safely saves palettes array to localStorage. */
function savePalettes(palettes) {
     try {
         localStorage.setItem('centipyColorPalettes', JSON.stringify(palettes));
         return true;
     } catch (e) {
         console.error("Error guardando en localStorage:", e);
         // Handle potential quota exceeded error
         if (e.name === 'QuotaExceededError') {
            showNotification("Error: Almacenamiento lleno. No se pudo guardar.", true);
         } else {
            showNotification("Error desconocido al guardar la paleta.", true);
         }
         return false;
     }
}

/** Prompts user and saves the current palette to favorites. */
function saveCurrentPalette() {
    console.log('Saving palette, current colors:', currentHslPaletteColors);
    
    if (!currentHslPaletteColors || currentHslPaletteColors.length === 0) {
        // Try to get colors directly from the DOM as a fallback
        const paletteContainer = document.getElementById('palette-container');
        if (paletteContainer) {
            const colorSwatches = paletteContainer.querySelectorAll('.color-swatch');
            
            if (colorSwatches && colorSwatches.length > 0) {
                // Extract colors from DOM and convert to HSL
                const hexCodes = [];
                colorSwatches.forEach(swatch => {
                    const hexElement = swatch.querySelector('.hex-code');
                    if (hexElement && hexElement.textContent) {
                        hexCodes.push(hexElement.textContent.trim());
                    }
                });
                
                if (hexCodes.length > 0) {
                    // Continue with saving using the extracted colors
                    promptAndSavePalette(hexCodes);
                    return;
                }
            }
        }
        
        // If we get here, we couldn't find colors
        showNotification("Genera una paleta antes de guardar.", true);
        return;
    }

    // If we have colors in the state, use those
    const hexCodes = currentHslPaletteColors.map(hsl => hslToHex(hsl.h, hsl.s, hsl.l));
    promptAndSavePalette(hexCodes);
}

// Helper function to handle the prompting and saving process
function promptAndSavePalette(hexCodes) {
    const paletteName = prompt("Ingresa un nombre para esta paleta:", `Paleta - ${new Date().toLocaleDateString()}`);
    if (!paletteName || paletteName.trim() === '') {
        showNotification("Guardado cancelado.", false);
        return; // User cancelled or entered empty name
    }

    const newPalette = {
        id: `palette-${Date.now()}-${Math.random().toString(16).slice(2)}`, // More unique ID
        name: paletteName.trim(),
        colors: hexCodes
    };

    const palettes = getSavedPalettes();
    palettes.push(newPalette);
    if (savePalettes(palettes)) {
        showNotification(`Paleta "${newPalette.name}" guardada!`);
    }
}

/** Loads and displays saved palettes in the favorites modal. */
 function loadSavedPalettes() {
     const palettes = getSavedPalettes();
     favoritesListContainer.innerHTML = ''; // Clear previous list

     if (palettes.length === 0) {
         favoritesListContainer.innerHTML = '<p class="empty-favorites-message">Aún no has guardado ninguna paleta.</p>';
         favoritesModalControls.openModal(); // Open modal even if empty
         return;
     }

     const fragment = document.createDocumentFragment();
     palettes.forEach(palette => {
         const item = document.createElement('div');
         item.className = 'favorite-item';
         item.dataset.paletteId = palette.id;
         item.setAttribute('role', 'button');
         item.setAttribute('tabindex', '0');
         item.setAttribute('aria-label', `Cargar paleta ${palette.name}`);

         const nameSpan = document.createElement('span');
         nameSpan.className = 'favorite-name';
         nameSpan.textContent = palette.name;

         const swatchesDiv = document.createElement('div');
         swatchesDiv.className = 'favorite-swatches';
         palette.colors.forEach(hex => {
             const swatch = document.createElement('div');
             swatch.className = 'fav-swatch';
             swatch.style.backgroundColor = hex;
             swatchesDiv.appendChild(swatch);
         });

         const deleteBtn = document.createElement('button');
         deleteBtn.type = 'button';
         deleteBtn.className = 'delete-fav-btn';
         deleteBtn.innerHTML = `<svg aria-hidden="true"><use xlink:href="#icon-trash"></use></svg>`;
         deleteBtn.title = `Eliminar paleta "${palette.name}"`;
         deleteBtn.setAttribute('aria-label', deleteBtn.title);
         deleteBtn.addEventListener('click', (e) => {
             e.stopPropagation(); // Prevent loading when deleting
             if (confirm(`¿Seguro que quieres eliminar la paleta "${palette.name}"?`)) {
                 deletePalette(palette.id);
             }
         });

         item.appendChild(nameSpan);
         item.appendChild(swatchesDiv);
         item.appendChild(deleteBtn);

         // Load palette on click or Enter/Space
         const loadAction = () => {
             loadPaletteFromFavorites(palette.id);
             favoritesModalControls.closeModal();
         };
         item.addEventListener('click', loadAction);
         item.addEventListener('keydown', (e) => {
             if (e.key === 'Enter' || e.key === ' ') {
                 e.preventDefault();
                 loadAction();
             }
         });

         fragment.appendChild(item);
     });
     favoritesListContainer.appendChild(fragment);
     favoritesModalControls.openModal(); // Open modal after filling
 }

/** Deletes a specific palette from favorites. */
function deletePalette(idToDelete) {
     let palettes = getSavedPalettes();
     const initialLength = palettes.length;
     palettes = palettes.filter(p => p.id !== idToDelete);

     if (palettes.length < initialLength) {
         if (savePalettes(palettes)) {
            showNotification("Paleta eliminada.");
            // Refresh the modal view immediately if it's open
            if (!favoritesModal.hidden) {
                loadSavedPalettes();
            }
         }
     } else {
        showNotification("No se encontró la paleta para eliminar.", true);
     }
}

/** Loads a selected palette from favorites into the main generator. */
function loadPaletteFromFavorites(idToLoad) {
    const palettes = getSavedPalettes();
    const palette = palettes.find(p => p.id === idToLoad);

    if (!palette || !palette.colors || !Array.isArray(palette.colors)) {
        showNotification("Error al cargar la paleta seleccionada.", true);
        return;
    }

    // Intenta analizar todos los colores primero para asegurar la validez
    const loadedHslColors = palette.colors.map(hex => hexToHsl(hex)).filter(hsl => hsl !== null);

    if (loadedHslColors.length !== palette.colors.length) {
        showNotification("Error: La paleta guardada contiene colores inválidos.", true);
        return; // No cargar parcialmente
    }

    saveToHistory(); // Guarda el estado actual antes de cargar uno nuevo

    // 1. Actualiza el estado de la aplicación
    currentHslPaletteColors.length = 0; // Limpia el array actual
    currentHslPaletteColors.push(...loadedHslColors); // Añade los nuevos colores
    
    // Asumiendo que al cargar una paleta, ningún color está bloqueado inicialmente
    lockedColors.length = 0;
    lockedColors.push(...Array(currentHslPaletteColors.length).fill(false));
    
    colorCountInput.value = currentHslPaletteColors.length; // Actualiza el input de cantidad

    // 2. Llama a la función principal para redibujar la paleta
    // Esto asegura que se usen los estilos, eventos y estructura correctos.
    displayPalette(); 

    // 3. Resetea los sliders globales a su estado por defecto
    const brightnessSlider = document.getElementById('brightness-slider');
    const brightnessValueSpan = document.getElementById('brightness-value');
    const saturationSlider = document.getElementById('saturation-slider');
    const saturationValueSpan = document.getElementById('saturation-value');
    
    if (brightnessSlider && brightnessValueSpan) {
        brightnessSlider.value = 0; // Se resetea a 0% en lugar de 100%
        brightnessValueSpan.textContent = '0%';
    }
    
    if (saturationSlider && saturationValueSpan) {
        saturationSlider.value = 0;
        saturationValueSpan.textContent = '0%';
    }

    // 4. Limpia los colores originales almacenados para ajustes
    window._originalPaletteColors = null;
    window._originalPaletteBrightnessColors = null;

    // 5. Muestra la notificación de éxito
    showNotification(`Paleta "${palette.name}" cargada.`);
    favoritesModalControls.closeModal(); // Cierra el modal después de cargar
}

// Modify the loadPalette function to properly handle palette loading
function loadPalette(paletteData) {
    // Display the palette without animation
    displayPalette(false);
    
    // Reset the global sliders
    const brightnessSlider = document.getElementById('brightness-slider');
    const brightnessValueSpan = document.getElementById('brightness-value');
    const saturationSlider = document.getElementById('saturation-slider');
    const saturationValueSpan = document.getElementById('saturation-value');
    
    if (brightnessSlider && brightnessValueSpan) {
        brightnessSlider.value = 1;
        brightnessValueSpan.textContent = '100%';
    }
    
    if (saturationSlider && saturationValueSpan) {
        saturationSlider.value = 0;
        saturationValueSpan.textContent = '0%';
    }
    
    // Clear any stored original palette colors
    window._originalPaletteColors = null;
    window._originalPaletteBrightnessColors = null;
    
    // Trigger a DOM update to ensure the palette is displayed
    setTimeout(() => {
        const paletteContainer = document.getElementById('palette-container');
        if (paletteContainer) {
            // Force a reflow
            paletteContainer.style.display = 'none';
            paletteContainer.offsetHeight; // Force reflow
            paletteContainer.style.display = '';
        }
    }, 0);
}

// Export functions
export {
    init,
    getSavedPalettes,
    savePalettes,
    saveCurrentPalette,
    loadSavedPalettes,
    deletePalette,
    loadPaletteFromFavorites,
    loadPalette
};
