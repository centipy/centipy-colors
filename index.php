<!DOCTYPE html>
<html lang="es">
<?php include 'includes/header.php'; ?>
<body>
    <div class="page-wrapper">

        <header class="main-header">
            <h1>CENTIPY COLOR</h1>
            <p class="tagline">Estudio avanzado para crear, ajustar y previsualizar colores.</p>
            <button type="button" id="theme-toggle-btn" class="theme-toggle" title="Cambiar Tema Claro/Oscuro">
                <svg class="icon icon-sun" width="20" height="20" aria-hidden="true"><use xlink:href="#icon-sun"></use></svg>
                <svg class="icon icon-moon" width="20" height="20" aria-hidden="true"><use xlink:href="#icon-moon"></use></svg>
                <span class="visually-hidden">Cambiar Tema</span> </button>
        </header>

        <main class="palette-generator-section" aria-labelledby="palette-generator-heading">
            <h2 id="palette-generator-heading" class="container-title">
                <svg width="24" height="24" class="title-icon" aria-hidden="true"><use xlink:href="#icon-palette"></use></svg>
                Generador de Paletas
            </h2>

            <div class="palette-content-wrapper">
                <section class="controls" aria-label="Controles de generación de paleta">
                     <div class="control-group">
                        <label for="harmony-select">Tipo de Armonía:</label>
                        <select id="harmony-select" title="Selecciona el tipo de relación armónica entre colores">
                            <option value="analogous">Análoga</option>
                            <option value="monochromatic">Monocromática</option>
                            <option value="complementary">Complementaria</option>
                            <option value="split-complementary">Complementaria Dividida</option>
                            <option value="triadic">Triádica</option>
                            <option value="tetradic">Tetrádica (Rectangular)</option>
                            <option value="square">Cuadrada</option>
                            <option value="random">Aleatoria (Vibrante)</option>
                            <option value="random-soft">Aleatoria (Suave)</option>
                        </select>
                    </div>

                     <div class="control-group">
                        <label for="color-count-input">Número de Colores:</label>
                        <input type="number" id="color-count-input" min="3" max="8" value="5" title="Cantidad de colores a generar (3 a 8)">
                    </div>

                     <div class="control-group range-group">
                        <label for="brightness-slider">Brillo Global:</label>
                        <input type="range" id="brightness-slider" min="-100" max="100" value="0" step="5" title="Ajustar Brillo Global en tiempo real (-100% a 100%)">
                        <span id="brightness-value" class="range-value">0%</span>
                    </div>
                     <div class="control-group range-group">
                        <label for="saturation-slider">Saturación Global:</label>
                        <input type="range" id="saturation-slider" min="-100" max="100" value="0" step="5" title="Ajustar Saturación Global en tiempo real (-100% a 100%)">
                        <span id="saturation-value" class="range-value">0%</span>
                    </div>

                    <div class="button-group main-actions">
                         <button type="button" id="generate-btn" class="action-btn primary-btn" title="Generar nueva paleta con la configuración actual (Espacio)">
                            <svg width="16" height="16" aria-hidden="true"><use xlink:href="#icon-palette"></use></svg> Generar Paleta
                        </button>
                         <button type="button" id="undo-btn" class="action-btn secondary-btn" title="Deshacer la última generación de paleta" disabled>
                             <svg width="16" height="16" aria-hidden="true"><use xlink:href="#icon-undo"></use></svg> Deshacer
                         </button>
                    </div>
                    <div class="button-group export-actions">
                        <button type="button" id="copy-all-btn" class="action-btn secondary-btn" title="Copiar todos los códigos HEX de la paleta actual al portapapeles">
                            <svg width="16" height="16" aria-hidden="true"><use xlink:href="#icon-copy"></use></svg> Copiar HEX
                        </button>
                         <button type="button" id="export-css-btn" class="action-btn secondary-btn" title="Copiar la paleta como variables CSS personalizadas (:root)">
                            <svg width="16" height="16" aria-hidden="true"><use xlink:href="#icon-css"></use></svg> Copiar CSS
                        </button>
                        <button type="button" id="export-palette-img-btn" class="action-btn secondary-btn" title="Descargar la paleta actual como una imagen PNG">
                             <svg width="16" height="16" aria-hidden="true"><use xlink:href="#icon-export"></use></svg> Exportar PNG
                         </button>
                     </div>
                     <div class="button-group storage-actions">
                         <button type="button" id="save-palette-btn" class="action-btn accent-btn" title="Guardar la paleta actual en tus favoritos (LocalStorage)">
                            <svg width="16" height="16" aria-hidden="true"><use xlink:href="#icon-save"></use></svg> Guardar Fav
                         </button>
                         <button type="button" id="load-palette-btn" class="action-btn accent-btn" title="Ver y copiar paletas guardadas previamente">
                             <svg width="16" height="16" aria-hidden="true"><use xlink:href="#icon-eye"></use></svg> Ver Favoritas
                         </button>
                     </div>
                </section>

                <section id="palette-container" class="palette-container" aria-label="Paleta de colores generada" aria-live="polite">
                </section>
            </div>

            <div id="hsl-sliders-popup" class="hsl-sliders-popup" role="dialog" aria-modal="true" aria-labelledby="hsl-popup-title" hidden>
                 <button type="button" class="close-popup-btn" title="Cerrar ventana de ajuste (Esc)" aria-label="Cerrar ajuste HSL">
                     <svg width="20" height="20" aria-hidden="true"><use xlink:href="#icon-close"></use></svg>
                 </button>
                 <h4 id="hsl-popup-title">Ajustar Color Individualmente</h4>
                 <div class="slider-wrap">
                     <label for="h-slider">Matiz (H):</label>
                     <input type="range" class="hsl-slider" id="h-slider" min="0" max="360" step="1">
                     <span id="h-value" class="range-value">0</span>
                 </div>
                 <div class="slider-wrap">
                     <label for="s-slider">Saturación (S):</label>
                     <input type="range" class="hsl-slider" id="s-slider" min="0" max="100" step="1">
                     <span id="s-value" class="range-value">0%</span>
                 </div>
                 <div class="slider-wrap">
                     <label for="l-slider">Luminosidad (L):</label>
                     <input type="range" class="hsl-slider" id="l-slider" min="0" max="100" step="1">
                     <span id="l-value" class="range-value">0%</span>
                 </div>
                 <div class="popup-color-preview" id="popup-color-preview" aria-label="Vista previa del color ajustado">
                    </div>
            </div>

            <div id="favorites-modal" class="modal" role="dialog" aria-modal="true" aria-labelledby="favorites-modal-title" hidden>
                <div class="modal-content">
                    <button type="button" class="close-modal-btn" title="Cerrar ventana de favoritos (Esc)" aria-label="Cerrar favoritos">
                         <svg width="20" height="20" aria-hidden="true"><use xlink:href="#icon-close"></use></svg>
                    </button>
                    <h2 id="favorites-modal-title">Paletas Favoritas Guardadas</h2>
                    <div id="favorites-list" aria-live="polite">
                        </div>
                     <p class="modal-tip">Haz clic en una paleta para cargarla. Usa ( <svg width="12" height="12" style="vertical-align: baseline;" aria-hidden="true"><use xlink:href="#icon-trash"></use></svg> ) para borrarla y ( <svg width="12" height="12" style="vertical-align: baseline;" aria-hidden="true"><use xlink:href="#icon-copy"></use></svg> ) para copiarla.</p>
                </div>
            </div>
        </main>

        <section class="container preview-section" aria-labelledby="preview-heading">
            <h2 id="preview-heading">
                <svg width="24" height="24" class="title-icon" aria-hidden="true"><use xlink:href="#icon-settings"></use></svg>
                Previsualizador de Combinaciones
            </h2>

            <div class="preview-controls" aria-label="Controles de previsualización">
                 <button type="button" id="generate-combo-btn" class="action-btn primary-btn" title="Generar nueva combinación aleatoria Fondo/Texto para las vistas previas">Nueva Combinación</button>
                 <div class="gradient-controls">
                    <label for="gradient-type-select" class="visually-hidden">Tipo de Gradiente</label>
                    <select id="gradient-type-select" title="Seleccionar tipo de gradiente a generar">
                        <option value="linear">Lineal</option>
                        <option value="radial">Radial</option>
                    </select>
                    <button type="button" id="generate-gradient-btn" class="action-btn accent-btn" title="Generar un fondo gradiente aleatorio para las vistas previas">Generar Gradiente</button>
                    <button type="button" id="copy-gradient-css-btn" class="action-btn secondary-btn" title="Copiar el código CSS del gradiente actual" disabled>
                         <svg width="16" height="16" aria-hidden="true"><use xlink:href="#icon-copy"></use></svg> Copiar CSS Gradiente
                    </button>
                 </div>
                 <button type="button" id="toggle-mode-btn" class="action-btn secondary-btn" title="Invertir colores de fondo y texto en las vistas (simula modo oscuro/claro)">Invertir Vista</button>
                 <button type="button" id="export-preview-btn" class="action-btn secondary-btn" title="Descargar las vistas previas actuales como una imagen PNG">
                     <svg width="16" height="16" aria-hidden="true"><use xlink:href="#icon-export"></use></svg> Exportar Vistas (PNG)
                 </button>
            </div>

            <div id="preview-area" class="preview-area" aria-label="Área de previsualización de combinaciones">
                <div class="device-wrapper">
                     <span class="device-label" id="preview1-label">Combinación 1 (Fondo | Texto)</span>
                     <div id="mobile-preview-1" class="device-preview mobile" role="img" aria-labelledby="preview1-label" title="Clic para copiar colores BG/Texto. El texto dentro es editable." aria-live="polite">
                        <div class="mobile-top-elements" aria-hidden="true"> <span class="speaker"></span> </div>
                        <div class="mobile-content">
                             <div class="contrast-info" aria-live="polite">
                                <span class="contrast-ratio">Ratio: --</span>
                                <span class="wcag-level">--</span>
                            </div>
                            <div class="editable-content-wrapper">
                                <div class="color-name" contenteditable="true" spellcheck="false" aria-label="Texto de ejemplo editable (nombre de color)">EDITAME</div>
                                <div class="hex-badge" contenteditable="true" spellcheck="false" aria-label="Texto de ejemplo editable (código hex)">#TEXTO</div>
                            </div>
                         </div>
                        <div class="mobile-bottom-bar" aria-hidden="true"></div>
                    </div>
                     <div class="color-codes" aria-label="Códigos de color para Combinación 1">
                        <span class="bg-code">BG: #------</span> | <span class="text-code">TXT: #------</span>
                    </div>
                </div>

                <div class="device-wrapper">
                     <span class="device-label" id="preview2-label">Combinación 2 (Texto | Fondo)</span>
                     <div id="mobile-preview-2" class="device-preview mobile" role="img" aria-labelledby="preview2-label" title="Clic para copiar colores BG/Texto. El texto dentro es editable." aria-live="polite">
                         <div class="mobile-top-elements" aria-hidden="true"> <span class="speaker"></span> </div>
                        <div class="mobile-content">
                            <div class="contrast-info" aria-live="polite">
                                <span class="contrast-ratio">Ratio: --</span>
                                <span class="wcag-level">--</span>
                            </div>
                             <div class="editable-content-wrapper">
                                 <div class="color-name" contenteditable="true" spellcheck="false" aria-label="Texto de ejemplo editable (nombre de color)">EDITAME</div>
                                 <div class="hex-badge" contenteditable="true" spellcheck="false" aria-label="Texto de ejemplo editable (código hex)">#FONDO</div>
                             </div>
                         </div>
                        <div class="mobile-bottom-bar" aria-hidden="true"></div>
                    </div>
                    <div class="color-codes" aria-label="Códigos de color para Combinación 2">
                        <span class="bg-code">BG: #------</span> | <span class="text-code">TXT: #------</span>
                    </div>
                </div>
            </div>
             <p class="preview-tip">Haz clic en una pantalla para copiar sus colores BG/Texto. El texto dentro es editable.</p>
        </section>

    </div> <div id="notification" class="notification" role="alert" aria-live="assertive" hidden>
        </div>

    <style>.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}</style>
    <?php include 'includes/footer.php'; ?>
    
    <script type="module" src="src/js/script.js"></script>
    
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const exportCssBtn = document.getElementById('export-css-btn');
        const exportPaletteImgBtn = document.getElementById('export-palette-img-btn');
        const exportPreviewBtn = document.getElementById('export-preview-btn');
        const savePaletteBtn = document.getElementById('save-palette-btn');
        const loadPaletteBtn = document.getElementById('load-palette-btn');
        
        // No longer need a local showNotification here, use UIUtils.showNotification

        if (exportCssBtn) {
            exportCssBtn.addEventListener('click', function() {
                const colorSwatches = document.querySelectorAll('#palette-container .color-swatch');
                
                if (colorSwatches.length === 0) {
                    UIUtils.showNotification('No hay colores para exportar. Genera una paleta primero.', 'error'); // Use UIUtils with type
                    return;
                }
                
                let cssText = ':root {\n';
                colorSwatches.forEach((swatch, index) => {
                    const hexCode = swatch.querySelector('.hex-code').textContent;
                    cssText += `  --color-${index + 1}: ${hexCode};\n`;
                });
                cssText += '}';
                
                navigator.clipboard.writeText(cssText)
                    .then(() => {
                        UIUtils.showNotification('Variables CSS copiadas al portapapeles', 'info'); // Use UIUtils with type
                    })
                    .catch(err => {
                        UIUtils.showNotification('Error al copiar: ' + err, 'error'); // Use UIUtils with type
                        console.error('Error al copiar: ', err);
                    });
            });
        }
        
        if (exportPaletteImgBtn) {
            exportPaletteImgBtn.addEventListener('click', function() {
                try {
                    const paletteContainer = document.getElementById('palette-container');
                    const colorSwatches = paletteContainer.querySelectorAll('.color-swatch');
                    const swatchCount = colorSwatches.length;
                    
                    if (swatchCount === 0) {
                        UIUtils.showNotification('No hay paleta para exportar. Genera una paleta primero.', 'error'); // Use UIUtils with type
                        return;
                    }
                    
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    const swatchWidth = 150;
                    const swatchHeight = 250;
                    const totalWidth = swatchCount * swatchWidth;
                    const totalHeight = swatchHeight;
                    
                    canvas.width = totalWidth;
                    canvas.height = totalHeight;
                    
                    const fontFamily = "'Pixelify Sans', sans-serif"; // Use the new pixel font for export text
                    
                    colorSwatches.forEach((swatch, index) => {
                        const hexCode = swatch.querySelector('.hex-code').textContent;
                        const x = index * swatchWidth;
                        const y = 0;
                        
                        ctx.fillStyle = hexCode;
                        ctx.fillRect(x, y, swatchWidth, swatchHeight);
                        
                        ctx.fillStyle = '#FFFFFF';
                        ctx.font = `bold 16px ${fontFamily}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        
                        ctx.fillText(hexCode, x + swatchWidth/2, y + swatchHeight/2);
                    });
                    
                    const link = document.createElement('a');
                    link.download = 'centipy-color-palette.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    
                    UIUtils.showNotification('Paleta exportada como imagen PNG', 'success'); // Use UIUtils with type
                } catch (error) {
                    console.error('Error al exportar la paleta:', error);
                    UIUtils.showNotification('Error al exportar la paleta: ' + error.message, 'error'); // Use UIUtils with type
                }
            });
        }
        
        if (exportPreviewBtn) {
            exportPreviewBtn.addEventListener('click', function() {
                const previewArea = document.getElementById('preview-area');
                
                if (!previewArea) {
                    UIUtils.showNotification('Error al exportar las vistas previas', 'error'); // Use UIUtils with type
                    return;
                }
                
                html2canvas(previewArea, {
                    backgroundColor: getComputedStyle(document.body).backgroundColor,
                    scale: 2,
                    logging: false
                }).then(canvas => {
                    const link = document.createElement('a');
                    link.download = 'centipy-color-preview.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    
                    UIUtils.showNotification('Vistas previas exportadas como imagen PNG', 'success'); // Use UIUtils with type
                }).catch(err => {
                    UIUtils.showNotification('Error al exportar las vistas previas: ' + err, 'error'); // Use UIUtils with type
                    console.error('Error al exportar las vistas previas:', err);
                });
            });
        }
        
        if (savePaletteBtn) {
            savePaletteBtn.addEventListener('click', function() {
                StorageManager.saveCurrentPalette(); // This already uses UIUtils.showNotification internally
            });
        }
        
        // The original local showNotification helper function is now removed.
    });
    </script>
    <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
    
    </body>
</html>