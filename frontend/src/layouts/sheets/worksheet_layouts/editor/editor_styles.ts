import { PAGE_SETTINGS } from "../page/page_settings";

/**
 * CSS styles for editor content
 * Defines the visual appearance of the ProseMirror editor
 */
export const EDITOR_STYLES = `
  .ProseMirror {
    outline: none;
    min-height: 257mm; /* 297mm (A4) - top and bottom margins */
    line-height: ${PAGE_SETTINGS.lineHeight};
    font-size: ${PAGE_SETTINGS.fontSize};
    font-family: ${PAGE_SETTINGS.fontFamily};
  }
  
  .ProseMirror h1 {
    font-size: 18pt;
    font-weight: bold;
    margin-bottom: 16px;
    margin-top: 0;
  }
  
  .ProseMirror p {
    margin-bottom: 8px;
  }
  
  .ProseMirror ul, .ProseMirror ol {
    padding-left: 20px;
    margin-left: 20px; /* Fügt zusätzlichen linken Rand hinzu */
    list-style-position: outside; /* Stellt sicher, dass Marker außerhalb des Textflusses sind */
    margin-bottom: 8px; /* Fügt Abstand nach der Liste hinzu */
  }

  .ProseMirror ul {
      list-style-type: disc; /* Explizit Punkte für ul */
  }

  .ProseMirror ol {
      list-style-type: decimal; /* Explizit Zahlen für ol */
  }

  /* Text alignment styles */
  .ProseMirror .text-left {
    text-align: left;
  }
  
  .ProseMirror .text-center {
    text-align: center;
  }
  
  .ProseMirror .text-right {
    text-align: right;
  }
  
  .ProseMirror .text-justify {
    text-align: justify;
  }

  /* Link styles */
  .ProseMirror a {
    color: #3182ce;
    text-decoration: underline;
    cursor: pointer;
  }

  /* Image styles */
  .ProseMirror img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 1em 0;
  }

  /* Table styles */
  .ProseMirror table {
    border-collapse: collapse;
    margin: 1em 0;
    width: 100%;
    table-layout: fixed;
    overflow: hidden;
  }
  
  .ProseMirror th,
  .ProseMirror td {
    border: 1px solid #ddd;
    padding: 0.5em;
    position: relative;
    vertical-align: top;
  }
  
  .ProseMirror th {
    font-weight: bold;
    background-color: #f8f9fa;
  }

  /* Task list styles */
  .ProseMirror ul[data-type="taskList"] {
    list-style: none;
    padding: 0;
  }
  
  .ProseMirror ul[data-type="taskList"] li {
    display: flex;
    align-items: flex-start;
    margin-bottom: 0.5em;
  }
  
  .ProseMirror ul[data-type="taskList"] li > label {
    margin-right: 0.5em;
    user-select: none;
  }
  
  .ProseMirror ul[data-type="taskList"] li > div {
    flex: 1;
  }

  /* Highlight styles */
  .ProseMirror mark {
    background-color: #fef3c7;
    padding: 0 0.2em;
    border-radius: 0.2em;
  }

  /* Direkte Unterstützung für TextStyle und Color Extensions */
  /* Diese Selektoren sind nun nicht mehr notwendig, da inline-Styles verwendet werden */
  /*
  .ProseMirror [style*="--text-color"] {
    color: var(--text-color);
  }
  
  .ProseMirror [style*="--font-size"] {
    font-size: var(--font-size);
  }
  */
  
  /* Stelle sicher, dass inline-Styles für Farbe funktionieren */
  .ProseMirror [style*="color:"] {
    /* Nichts überschreiben - die inline styles funktionieren */
  }

  /* Stelle sicher, dass inline-Styles für Schriftgröße funktionieren */
  .ProseMirror [style*="font-size:"] {
    /* Nichts überschreiben - die inline styles funktionieren */
  }
`;

/**
 * Fügt die Editor-Styles zum Dokument hinzu
 */
export const applyEditorStyles = () => {
  const DOCUMENT_STYLE = document.createElement("style");
  DOCUMENT_STYLE.textContent = EDITOR_STYLES;
  document.head.appendChild(DOCUMENT_STYLE);
};

/**
 * Stilkonfiguration für den PDF-Export
 */
export const getPdfStyles = () => `
  /* Styles for content */
  .ProseMirror, .sheet-container [contenteditable=true] {
    font-family: ${PAGE_SETTINGS.fontFamily} !important;
    font-size: ${PAGE_SETTINGS.fontSize} !important;
    line-height: ${PAGE_SETTINGS.lineHeight} !important;
  }
`;

export default { EDITOR_STYLES, applyEditorStyles, getPdfStyles };
