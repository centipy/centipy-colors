/**
 * Color Utilities Module
 * Provides functions for color conversion, manipulation, and analysis
 */

// Helper function for clamping values
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

// Color format validation functions
const isValidHex = (hex) => /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex.trim());
const isValidRgb = (rgb) => /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i.test(rgb.trim());
const isValidHsl = (hsl) => /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?\s*\)$/i.test(hsl.trim());

/** Calculates luminance from RGB values (0-1). WCAG formula. */
function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
        v /= 1.0; // Ensure float division
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function hslToHex(h, s, l) {
    s = clamp(s / 100, 0, 1);
    l = clamp(l / 100, 0, 1);
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c / 2,
        r = 0, g = 0, b = 0;

    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    const toHex = val => clamp(val, 0, 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHsl(hex) {
    hex = hex.trim().replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) return null; // Invalid hex length

    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    return rgbToHsl(r, g, b);
}

function rgbToHsl(r, g, b) {
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h = (h / 6) * 360;
         if (h < 0) h += 360;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
    s = clamp(s / 100, 0, 1);
    l = clamp(l / 100, 0, 1);
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c / 2,
        r = 0, g = 0, b = 0;

    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }

    return { r: clamp(r + m, 0, 1), g: clamp(g + m, 0, 1), b: clamp(b + m, 0, 1) };
}

/** Parses various color string formats (HEX, RGB, HSL) into an HSL object. */
function parseColorString(str) {
    str = str.trim().toLowerCase();
    if (isValidHex(str)) {
        return hexToHsl(str);
    } else if (isValidRgb(str)) {
        const match = str.match(/rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/i);
        if (match) {
            const r = clamp(parseInt(match[1], 10), 0, 255) / 255;
            const g = clamp(parseInt(match[2], 10), 0, 255) / 255;
            const b = clamp(parseInt(match[3], 10), 0, 255) / 255;
            return rgbToHsl(r, g, b);
        }
    } else if (isValidHsl(str)) {
         const match = str.match(/hsl\((\d{1,3}),\s*(\d{1,3})%?,\s*(\d{1,3})%?\)/i);
         if (match) {
             return {
                 h: clamp(parseInt(match[1], 10), 0, 360),
                 s: clamp(parseInt(match[2], 10), 0, 100),
                 l: clamp(parseInt(match[3], 10), 0, 100)
             };
         }
    }
    return null; // Invalid format
}

/** Generates a random HSL color within specified ranges. */
function getRandomHsl(minS = 30, maxS = 95, minL = 25, maxL = 85) {
    return {
        h: Math.random() * 360,
        s: clamp(minS + Math.random() * (maxS - minS), 0, 100),
        l: clamp(minL + Math.random() * (maxL - minL), 0, 100)
    };
}

/** Adjusts HSL color by brightness and saturation factors. */
function adjustHsl(hsl, brightnessFactor = 1, saturationFactor = 1) {
    if (!hsl) return null;
    return {
        h: hsl.h,
        s: clamp(Math.round(hsl.s * saturationFactor), 0, 100),
        l: clamp(Math.round(hsl.l * brightnessFactor), 0, 100)
    };
}

/** Calculates contrast ratio between two HSL colors. */
function getContrastRatio(hsl1, hsl2) {
    try {
        const rgb1 = hslToRgb(hsl1.h, hsl1.s, hsl1.l);
        const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
        const rgb2 = hslToRgb(hsl2.h, hsl2.s, hsl2.l);
        const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return ((brightest + 0.05) / (darkest + 0.05));
    } catch (e) {
        console.error("Error calculating contrast:", e, hsl1, hsl2);
        return 1; // Return minimum contrast on error
    }
}

/** Generates a more descriptive color name based on HSL values. */
function getDescriptiveColorName(hsl) {
    if (!hsl) return "Color Desconocido";
    const { h, s, l } = hsl;

    // Handle Grays/Black/White first
    if (s < 10) {
       if (l < 5) return "Negro";
       if (l < 15) return "Casi Negro";
       if (l < 35) return "Gris Muy Oscuro";
       if (l < 65) return "Gris Medio";
       if (l < 85) return "Gris Claro";
       if (l < 95) return "Gris Muy Claro";
       return "Blanco";
    }

    // Luminance description
    let lDesc = "";
    if (l < 20) lDesc = "Muy Oscuro ";
    else if (l < 40) lDesc = "Oscuro ";
    else if (l > 85) lDesc = "Muy Claro "; // Moved Muy Claro threshold
    else if (l > 75) lDesc = "Claro "; // Moved Claro threshold

    // Saturation description
    let sDesc = "";
    // Desaturated only if not already light/dark
    if (s < 30 && l >= 40 && l <= 70) sDesc = "Apagado ";
    else if (s > 80) sDesc = "Vívido "; // Increased vivid threshold

    // Hue description (more nuanced)
    let hDesc;
       if (h < 12 || h >= 350) hDesc = "Rojo";
       else if (h < 25) hDesc = "Rojo Anaranjado";
       else if (h < 45) hDesc = "Naranja";
       else if (h < 55) hDesc = "Ámbar";
       else if (h < 65) hDesc = "Amarillo";
       else if (h < 80) hDesc = "Lima";
       else if (h < 140) hDesc = "Verde";
       else if (h < 160) hDesc = "Verde Azulado";
       else if (h < 190) hDesc = "Cian";
       else if (h < 210) hDesc = "Azul Celeste";
       else if (h < 250) hDesc = "Azul";
       else if (h < 270) hDesc = "Violeta";
       else if (h < 290) hDesc = "Púrpura";
       else if (h < 320) hDesc = "Magenta";
       else if (h < 350) hDesc = "Rosa";

    return `${lDesc}${sDesc}${hDesc}`.trim();
}

// Export all functions and helper utilities
export {
    clamp,
    isValidHex,
    isValidRgb,
    isValidHsl,
    getLuminance,
    hslToHex,
    hexToHsl,
    rgbToHsl,
    hslToRgb,
    parseColorString,
    getRandomHsl,
    adjustHsl,
    getContrastRatio,
    getDescriptiveColorName
};
