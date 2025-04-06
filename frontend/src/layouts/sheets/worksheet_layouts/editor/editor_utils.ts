import { PAGE_SETTINGS } from "../page/page_settings";

/**
 * CSS für Editor-Inhalte
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
  }
`;

/**
 * Wendet die Editor-Stile auf das Dokument an
 */
export const applyEditorStyles = (): void => {
  const style = document.createElement("style");
  style.textContent = EDITOR_STYLES;
  document.head.appendChild(style);
};
