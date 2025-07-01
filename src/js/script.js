// Import all modules
import * as ColorUtils from './modules/color_utils.js';
import * as ColorEditor from './modules/color_editor.js';
import * as ExportFunctions from './modules/export_functions.js';
import * as PaletteGenerator from './modules/palette_generator.js';
import * as PreviewManager from './modules/preview_manager.js';
import * as StorageManager from './modules/storage_manager.js';
import * as ThemeManager from './modules/theme_manager.js';
import * as UIUtils from './modules/ui_utils.js';

// Optional: Import any third-party libraries
// import html2canvas from './lib/html2canvas.min.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing CENTIPY COLOR...");
    
    // --- Constants ---
    const MAX_HISTORY = 10;
    const WCAG_AA_THRESHOLD = 4.5;
    const WCAG_AAA_THRESHOLD = 7;
    const DARK_BG_LUMINANCE_THRESHOLD = 50;
    
    // --- DOM Element References ---
    // Common elements
    const body = document.body;
    const notification = document.getElementById('notification');
    
    // Theme elements
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    
    // Palette generator elements
    const paletteContainer = document.getElementById('palette-container');
    const colorCountInput = document.getElementById('color-count-input');
    const harmonySelect = document.getElementById('harmony-select');
    const baseColorInput = document.getElementById('base-color-input');
    const applyBaseColorBtn = document.getElementById('apply-base-color');
    const generateBtn = document.getElementById('generate-btn');
    const undoBtn = document.getElementById('undo-btn');
    
    // Slider elements
    const brightnessSlider = document.getElementById('brightness-slider');
    const saturationSlider = document.getElementById('saturation-slider');
    const brightnessValueSpan = document.getElementById('brightness-value');
    const saturationValueSpan = document.getElementById('saturation-value');
    
    // Export elements
    const copyAllBtn = document.getElementById('copy-all-btn');
    const exportCssBtn = document.getElementById('export-css-btn');
    const exportPaletteImgBtn = document.getElementById('export-palette-img-btn');
    
    // Storage elements
    const savePaletteBtn = document.getElementById('save-palette-btn');
    const loadPaletteBtn = document.getElementById('load-palette-btn');
    const favoritesListContainer = document.getElementById('favorites-list');
    const favoritesModal = document.getElementById('favorites-modal');
    const closeFavoritesModalBtn = document.querySelector('#favorites-modal .close-modal-btn');
    
    // HSL editor elements
    const hslPopup = document.getElementById('hsl-sliders-popup');
    const closePopupBtn = document.querySelector('#hsl-sliders-popup .close-popup-btn');
    const hSlider = document.getElementById('h-slider');
    const sSlider = document.getElementById('s-slider');
    const lSlider = document.getElementById('l-slider');
    const hValue = document.getElementById('h-value');
    const sValue = document.getElementById('s-value');
    const lValue = document.getElementById('l-value');
    const popupColorPreview = document.getElementById('popup-color-preview');
    
    // Preview elements
    const previewArea = document.getElementById('preview-area');
    const mobilePreview1 = document.getElementById('mobile-preview-1');
    const mobilePreview2 = document.getElementById('mobile-preview-2');
    const generateComboBtn = document.getElementById('generate-combo-btn');
    const toggleModeBtn = document.getElementById('toggle-mode-btn');
    const exportPreviewBtn = document.getElementById('export-preview-btn');
    const gradientTypeSelect = document.getElementById('gradient-type-select');
    const generateGradientBtn = document.getElementById('generate-gradient-btn');
    const copyGradientCssBtn = document.getElementById('copy-gradient-css-btn');
    
    // --- State Variables ---
    // These need to be objects so they can be passed by reference
    const state = {
        currentHslPaletteColors: [], // Array of {h, s, l} objects
        lockedColors: [], // Array of booleans matching currentHslPaletteColors
        paletteHistory: [], // Array of { colors: [], locked: [] } states
        activeSwatchIndex: -1
    };
    
    // --- Initialize UI Utils first (needed by other modules) ---
    UIUtils.init({
        notification,
        brightnessSlider,
        saturationSlider,
        brightnessValueSpan,
        saturationValueSpan,
        hslPopup,
        closePopupBtn,
        favoritesModal,
        closeFavoritesModalBtn,
        loadPaletteBtn
    });
    
    // --- Initialize Theme Manager ---
    ThemeManager.init({
        body,
        themeToggleBtn
    });
    
    // --- Initialize Color Editor ---
    ColorEditor.init({
        hslPopup,
        hSlider,
        sSlider,
        lSlider,
        hValue,
        sValue,
        lValue,
        popupColorPreview,
        paletteContainer
    }, {
        currentHslPaletteColors: state.currentHslPaletteColors
    });
    
    // --- Initialize Palette Generator ---
    PaletteGenerator.init({
        paletteContainer,
        colorCountInput,
        harmonySelect,
        brightnessSlider,
        saturationSlider,
        baseColorInput,
        undoBtn
    }, {
        currentHslPaletteColors: state.currentHslPaletteColors,
        lockedColors: state.lockedColors,
        paletteHistory: state.paletteHistory
    }, {
        MAX_HISTORY
    }, {
        showNotification: UIUtils.showNotification,
        openHslPopup: ColorEditor.openHslPopup,
        copyToClipboard: UIUtils.copyToClipboard,
        updateActionButtonsState: () => {
            undoBtn.disabled = state.paletteHistory.length === 0;
        }
    });
    
    // --- Initialize Export Functions ---
    ExportFunctions.init({
        paletteContainer,
        body
    }, {
        currentHslPaletteColors: state.currentHslPaletteColors
    }, {
        showNotification: UIUtils.showNotification,
        copyToClipboard: UIUtils.copyToClipboard
    });
    
    // --- Initialize Storage Manager ---
    StorageManager.init(
        { 
            colorCountInput, 
            favoritesListContainer, 
            favoritesModal, 
            favoritesModalControls: {
                openModal: () => {
                    favoritesModal.hidden = false;
                },
                closeModal: () => {
                    favoritesModal.hidden = true;
                }
            }
        },
        { 
            currentHslPaletteColors: state.currentHslPaletteColors, 
            lockedColors: state.lockedColors 
        },
        { 
            showNotification: UIUtils.showNotification, 
            saveToHistory: PaletteGenerator.saveToHistory, 
            displayPalette: PaletteGenerator.displayPalette
        }
    );
    
    // --- Initialize Preview Manager ---
    PreviewManager.init({
        previewElements: [previewArea, mobilePreview1, mobilePreview2],
        mobilePreview1,
        mobilePreview2,
        copyGradientCssBtn,
        gradientTypeSelect
    }, {
        DARK_BG_LUMINANCE_THRESHOLD,
        WCAG_AA_THRESHOLD,
        WCAG_AAA_THRESHOLD
    }, {
        showNotification: UIUtils.showNotification,
        copyToClipboard: UIUtils.copyToClipboard
    });
    
    // --- Event Listeners Setup ---
    function setupEventListeners() {
        // Theme toggle
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', ThemeManager.toggleTheme);
        }
        
        // Slider events
        if (brightnessSlider) {
            brightnessSlider.addEventListener('input', function() {
                const value = parseFloat(this.value);
                const percentage = Math.round(value * 100);
                brightnessValueSpan.textContent = `${percentage}%`;
                
                // Apply changes in real-time to the palette
                PaletteGenerator.adjustPaletteBrightness(value);
            });
        }
        if (saturationSlider) {
            saturationSlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                saturationValueSpan.textContent = `${value}%`;
                
                // Apply changes in real-time to the palette
                PaletteGenerator.adjustPaletteSaturation(value);
            });
        }
        
        // Palette generation events
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                PaletteGenerator.generatePalette();
                
                // Reset sliders when generating new palette
                if (brightnessSlider && brightnessValueSpan) {
                    brightnessSlider.value = 1;
                    brightnessValueSpan.textContent = '100%';
                }
                
                if (saturationSlider && saturationValueSpan) {
                    saturationSlider.value = 0;
                    saturationValueSpan.textContent = '0%';
                }
                
                // Clear stored original colors
                window._originalPaletteColors = null;
                window._originalPaletteBrightnessColors = null;
                
                console.log("Generate palette clicked");
            });
        }
        if (applyBaseColorBtn) {
            applyBaseColorBtn.addEventListener('click', PaletteGenerator.applyBaseColor);
        }
        
        // Fix for undo button
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                console.log("Undo button clicked");
                console.log("History length:", state.paletteHistory.length);
                PaletteGenerator.undoLastPalette();
            });
        }
        
        // Export events
        if (copyAllBtn) {
            copyAllBtn.addEventListener('click', ExportFunctions.copyAllHex);
        }
        if (exportCssBtn) {
            exportCssBtn.addEventListener('click', ExportFunctions.exportCssVariables);
        }
        if (exportPaletteImgBtn) {
            exportPaletteImgBtn.addEventListener('click', ExportFunctions.exportPaletteImage);
        }
        
        // Storage events
        if (savePaletteBtn) {
            savePaletteBtn.addEventListener('click', StorageManager.saveCurrentPalette);
        }
        if (loadPaletteBtn) {
            loadPaletteBtn.addEventListener('click', StorageManager.loadSavedPalettes);
        }
        
        // Preview events
        if (generateComboBtn) {
            generateComboBtn.addEventListener('click', PreviewManager.generateCombination);
        }
        if (toggleModeBtn) {
            toggleModeBtn.addEventListener('click', PreviewManager.togglePreviewMode);
        }
        if (exportPreviewBtn) {
            exportPreviewBtn.addEventListener('click', PreviewManager.exportPreviewImage);
        }
        if (generateGradientBtn) {
            generateGradientBtn.addEventListener('click', PreviewManager.generateGradient);
        }
        if (copyGradientCssBtn) {
            copyGradientCssBtn.addEventListener('click', PreviewManager.copyGradientCss);
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Space to generate new palette (when not in input/textarea)
            if (e.code === 'Space' && 
                !['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                PaletteGenerator.generatePalette();
            }
            
            // Ctrl+Z to undo
            if (e.ctrlKey && e.key === 'z' && !undoBtn.disabled) {
                e.preventDefault();
                PaletteGenerator.undoLastPalette();
            }
        });
    }
    
    // --- Initialization ---
    function initializeApp() {
        // Initialize UI elements
        UIUtils.updateGlobalSlidersUI();
        
        // Set up event listeners
        setupEventListeners();
        
        // Generate initial palette
        PaletteGenerator.generatePalette();
        
        console.log("CENTIPY COLOR initialized successfully!");
    }
    
    // Run initialization
    initializeApp();
});

// Find the function that renders the favorites list and modify it to include the copy button

function renderFavoritesList() {
    const favoritesList = document.getElementById('favorites-list');
    favoritesList.innerHTML = '';
    
    const savedPalettes = JSON.parse(localStorage.getItem('savedPalettes')) || [];
    
    if (savedPalettes.length === 0) {
        favoritesList.innerHTML = '<p class="no-favorites">No hay paletas guardadas.</p>';
        return;
    }
    
    savedPalettes.forEach((palette, index) => {
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'favorite-item';
        favoriteItem.setAttribute('data-index', index);
        
        // Create palette name/date
        const paletteName = document.createElement('span');
        paletteName.className = 'favorite-name';
        paletteName.textContent = palette.name || `Paleta - ${new Date(palette.date).toLocaleDateString()}`;
        
        // Create color swatches
        const swatchesContainer = document.createElement('div');
        swatchesContainer.className = 'favorite-swatches';
        
        palette.colors.forEach(color => {
            const swatch = document.createElement('span');
            swatch.className = 'fav-swatch';
            swatch.style.backgroundColor = color;
            swatchesContainer.appendChild(swatch);
        });
        
        // Create action buttons container
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'favorite-actions';
        
        // Create copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-fav-btn';
        copyBtn.title = 'Copiar códigos HEX de esta paleta';
        copyBtn.innerHTML = '<svg width="16" height="16" aria-hidden="true"><use xlink:href="#icon-copy"></use></svg>';
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            copyPaletteColors(palette.colors);
        });
        
        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-fav-btn';
        deleteBtn.title = 'Eliminar esta paleta';
        deleteBtn.innerHTML = '<svg width="16" height="16" aria-hidden="true"><use xlink:href="#icon-trash"></use></svg>';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSavedPalette(index);
        });
        
        // Add buttons to actions container
        actionsContainer.appendChild(copyBtn);
        actionsContainer.appendChild(deleteBtn);
        
        // Add all elements to the favorite item
        favoriteItem.appendChild(paletteName);
        favoriteItem.appendChild(swatchesContainer);
        favoriteItem.appendChild(actionsContainer);
        
        // Add click event to load the palette
        favoriteItem.addEventListener('click', () => {
            loadSavedPalette(palette);
            closeFavoritesModal();
        });
        
        favoritesList.appendChild(favoriteItem);
    });
}

// Add a function to copy palette colors if it doesn't exist
function copyPaletteColors(colors) {
    const hexCodes = colors.join(', ');
    navigator.clipboard.writeText(hexCodes)
        .then(() => {
            showNotification('Códigos HEX copiados al portapapeles', 'success');
        })
        .catch(err => {
            showNotification('Error al copiar: ' + err, 'error');
            console.error('Error al copiar: ', err);
        });
}