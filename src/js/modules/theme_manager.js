/**
 * Theme Manager Module
 * Handles theme switching between light and dark modes
 */

// Module references
let body;
let themeToggleBtn;

/**
 * Initializes the module with DOM references
 */
function init(elements) {
    // Store DOM references
    body = elements.body;
    themeToggleBtn = elements.themeToggleBtn;
    
    // Initialize theme from localStorage
    loadSavedTheme();
}

/**
 * Loads the saved theme from localStorage if available
 */
function loadSavedTheme() {
    try {
        const savedTheme = localStorage.getItem('centipyColorTheme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-theme');
            themeToggleBtn.title = 'Cambiar a Tema Claro';
        } else {
            body.classList.remove('dark-theme');
            themeToggleBtn.title = 'Cambiar a Tema Oscuro';
        }
    } catch (e) {
        console.warn("localStorage no disponible para cargar tema.");
    }
}

/** Toggles the light/dark theme. */
function toggleTheme() {
    body.classList.toggle('dark-theme');
    const isDark = body.classList.contains('dark-theme');
    themeToggleBtn.title = isDark ? 'Cambiar a Tema Claro' : 'Cambiar a Tema Oscuro';
    // Update aria-label potentially?
    try {
        localStorage.setItem('centipyColorTheme', isDark ? 'dark' : 'light');
    } catch (e) { console.warn("localStorage no disponible para guardar tema.")}
    // Update custom select arrow color if needed (CSS handles this now)
}

// Export functions
export {
    init,
    loadSavedTheme,
    toggleTheme
};