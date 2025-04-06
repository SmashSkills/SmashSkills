import React from "react";

type HTMLElementRef = React.RefObject<HTMLElement | null>;

/**
 * Configuration options for PDF export
 */
export interface PDFExportOptions {
  /**
   * Page size (e.g., 'A4', 'Letter')
   */
  pageSize?: string;

  /**
   * Page margins in mm
   */
  margins?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };

  /**
   * CSS classes to be hidden during printing
   */
  hideClasses?: string[];

  /**
   * CSS selectors for elements that should be treated as page breaks
   */
  pageBreakSelectors?: string[];

  /**
   * Additional CSS styles for printing
   */
  additionalStyles?: string;

  /**
   * ID for the element to be printed
   */
  printSectionId?: string;

  /**
   * Delay in ms before opening the print dialog
   */
  printDelay?: number;
}

/**
 * Default configuration for PDF export
 */
const DEFAULT_OPTIONS: PDFExportOptions = {
  pageSize: "A4",
  margins: {
    top: "20mm",
    right: "25mm",
    bottom: "20mm",
    left: "25mm",
  },
  hideClasses: ["print:hidden", "add-sheet-button", "delete-sheet-button"],
  pageBreakSelectors: [".sheet-container"],
  printSectionId: "printSection",
  printDelay: 200,
};

/**
 * Class for managing PDF export functionality
 */
class PDFExportManager {
  private elementRef: HTMLElementRef;
  private styleElement: HTMLStyleElement | null = null;
  private options: PDFExportOptions;

  /**
   * Creates a new instance of the PDF export manager
   * @param elementRef - Reference to the element to be printed
   * @param options - Configuration options for PDF export
   */
  constructor(elementRef: HTMLElementRef, options: PDFExportOptions = {}) {
    this.elementRef = elementRef;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Creates print styles for the PDF
   * @returns HTMLStyleElement containing print styles
   */
  private createPrintStyles(): HTMLStyleElement {
    const style = document.createElement("style");
    style.innerHTML = this.getPrintStyles();
    return style;
  }

  /**
   * Returns CSS styles for printing
   * @returns CSS styles as string
   */
  private getPrintStyles(): string {
    const {
      pageSize,
      margins,
      hideClasses,
      pageBreakSelectors,
      additionalStyles,
      printSectionId,
    } = this.options;

    // Create CSS for hidden classes
    const hideClassesCSS =
      hideClasses?.map((className) => `.${className}`).join(", ") || "";

    // Create CSS for page breaks
    const pageBreakCSS =
      pageBreakSelectors
        ?.map(
          (selector) =>
            `${selector} { break-after: page; margin: 0 !important; box-sizing: border-box !important; }`
        )
        .join("\n") || "";

    // Create CSS for the last page break
    const lastPageBreakCSS =
      pageBreakSelectors
        ?.map((selector) => `${selector}:last-child { break-after: avoid; }`)
        .join("\n") || "";

    return `
      @page {
        size: ${pageSize};
        margin: 0;
      }
      @media print {
        /* Hide everything except the print area */
        html, body, body * {
          visibility: hidden;
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
          height: auto !important;
        }
        
        /* Show only the print area */
        #${printSectionId}, #${printSectionId} * {
          visibility: visible;
        }
        
        /* Position the print area */
        #${printSectionId} {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          overflow: visible;
          contain: layout;
        }
        
        /* Page breaks for sheets */
        ${pageBreakCSS}
        
        /* Prevent page break after the last sheet */
        ${lastPageBreakCSS}
        
        /* Additional browser-specific rules */
        @page {
          size: ${pageSize};
          margin: 0;
        }
        
        /* Hide buttons and UI elements */
        button, ${hideClassesCSS} {
          display: none !important;
        }
        
        /* Force correct size for A4 sheet */
        .sheet-container > div {
          width: 210mm !important;
          height: 297mm !important;
          padding: ${margins?.top || "20mm"} ${margins?.right || "25mm"} ${
      margins?.bottom || "20mm"
    } ${margins?.left || "25mm"} !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
          page-break-inside: avoid !important;
        }

        /* Additional styles */
        ${additionalStyles || ""}
      }
    `;
  }

  /**
   * Prepares the DOM for printing
   */
  private prepareDOMForPrint(): void {
    if (!this.elementRef.current) return;

    const { pageBreakSelectors, printSectionId } = this.options;

    // Add attributes for order
    pageBreakSelectors?.forEach((selector) => {
      const elements = this.elementRef.current?.querySelectorAll(selector);
      elements?.forEach((element, index) => {
        element.setAttribute("data-print-order", String(index + 1));
        if (index === elements.length - 1) {
          element.classList.add("last-sheet");
        }
      });
    });

    // Add ID for print selector
    this.elementRef.current.id = printSectionId || "printSection";
  }

  /**
   * Cleans up the DOM after printing
   */
  private cleanupAfterPrint(): void {
    if (!this.elementRef.current) return;

    const { pageBreakSelectors } = this.options;

    // Remove attributes and classes
    pageBreakSelectors?.forEach((selector) => {
      const elements = this.elementRef.current?.querySelectorAll(selector);
      elements?.forEach((element) => {
        element.removeAttribute("data-print-order");
        element.classList.remove("last-sheet");
      });
    });

    // Remove ID
    this.elementRef.current.id = "";

    // Remove styles
    if (this.styleElement && document.head.contains(this.styleElement)) {
      document.head.removeChild(this.styleElement);
      this.styleElement = null;
    }
  }

  /**
   * Executes the PDF export
   */
  public export(): void {
    if (!this.elementRef.current) return;

    // Create and add styles
    this.styleElement = this.createPrintStyles();
    document.head.appendChild(this.styleElement);

    // Prepare DOM
    this.prepareDOMForPrint();

    // Open print dialog
    setTimeout(() => {
      window.print();

      // Clean up after printing
      this.cleanupAfterPrint();
    }, this.options.printDelay || 200);
  }
}

/**
 * Exports content to PDF using the native print dialog
 * @param elementRef - Reference to the element to be printed
 * @param options - Optional configuration for PDF export
 */
export const exportToPDF = (
  elementRef: HTMLElementRef,
  options?: PDFExportOptions
): void => {
  const pdfManager = new PDFExportManager(elementRef, options);
  pdfManager.export();
};
