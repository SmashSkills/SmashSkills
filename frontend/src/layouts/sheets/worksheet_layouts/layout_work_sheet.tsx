import React, { useState, useRef, useCallback } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import ButtonAddRounded from "../../../components/ui_elements/buttons/button_add_rounded";
import ButtonDeleteRounded from "../../../components/ui_elements/buttons/button_delete_rounded";
import ButtonPrimary from "../../../components/ui_elements/buttons/button_primary";
import { exportToPDF } from "../../../util/pdf_logic/pdf_export";
import { PAGE_SETTINGS } from "./util/page_settings";
import { getEditorExtensions } from "./editor/editor_extensions";
import { applyEditorStyles, getPdfStyles } from "./editor/editor_styles";
import TableControls from "../../../components/tiptap_addons/TableControls";

// Anwenden der Editor-Styles beim Import dieser Komponente
applyEditorStyles();

/**
 * Type definitions for worksheet content and data structures
 */
interface WorksheetContent {
  title: string;
  body: string;
}

/**
 * Represents a complete worksheet with unique identifier and content
 */
interface WorksheetData {
  id: string;
  content: WorksheetContent;
}

/**
 * Props for the main worksheet layout component
 */
interface LayoutWorkSheetProps {
  className?: string;
  onPrint?: () => void;
  onEditorMount?: (editor: Editor | null) => void;
}

/**
 * Props for individual worksheet items
 */
interface WorksheetItemProps {
  sheet: WorksheetData;
  index: number;
  className?: string;
  isLast: boolean;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onEditorMount: (editor: Editor | null) => void;
}

/**
 * Helper Functions
 */

/**
 * Generates a unique identifier for worksheets
 * @returns {string} A unique ID combining timestamp and random number
 */
const generateUniqueId = (): string =>
  `sheet-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

/**
 * Creates a default worksheet with initial content
 * @returns {WorksheetData} A new worksheet with default title and body
 */
const createDefaultWorksheet = (): WorksheetData => ({
  id: generateUniqueId(),
  content: {
    title: "Mein Arbeitsblatt",
    body: "Klicken Sie hier, um zu beginnen...",
  },
});

/**
 * WorksheetItem Component
 * Renders an individual worksheet with editor functionality
 */
const WorksheetItem: React.FC<WorksheetItemProps> = ({
  sheet,
  index,
  className = "",
  isLast,
  onDelete,
  onAdd,
  onEditorMount,
}) => {
  // State to track if the sheet is full
  const [isSheetFull, setIsSheetFull] = useState(false);
  // Ref to track the content before changes
  const contentBeforeChange = useRef<string | null>(null);
  // Ref to prevent recursive calls during truncation
  const isTruncating = useRef(false);

  // Editor for this specific worksheet
  const editor = useEditor({
    extensions: getEditorExtensions(),
    content: `
      <h1>${sheet.content.title}</h1>
      <p>${sheet.content.body}</p>
    `,
    editorProps: {
      attributes: {
        class: "focus:outline-none w-full h-full",
      },
    },
    onTransaction: ({ editor, transaction }) => {
      // Nur fortfahren, wenn sich der Inhalt tatsächlich geändert hat
      if (!transaction.docChanged) return;

      // Skip this check if we're already resetting content
      if (isTruncating.current) return;

      // Check if this transaction caused overflow
      const isOverflowing = checkContentOverflow(editor);

      if (isOverflowing) {
        // Markieren, dass wir gerade zurücksetzen
        isTruncating.current = true;
        console.warn(
          "Inhalt überschreitet Seitenlimit. Setze auf vorherigen Zustand zurück..."
        );

        // WICHTIG: Sofort auf den *letzten bekannten gültigen* Stand zurücksetzen
        // Dieser wurde in contentBeforeChange.current gespeichert, *bevor* diese Transaktion überlief
        if (contentBeforeChange.current) {
          // Verhindere weitere Transaktionen, während wir zurücksetzen
          editor.commands.setContent(
            JSON.parse(contentBeforeChange.current),
            false
          ); // false = keine neue Transaktion auslösen
        }

        setIsSheetFull(true); // Blatt als voll markieren

        // Sperre nach kurzem Delay aufheben, um dem Editor Zeit zum Verarbeiten zu geben
        setTimeout(() => {
          isTruncating.current = false;
        }, 50);
      } else {
        // Wenn *nicht* übergelaufen:
        // 1. Blatt als nicht voll markieren (falls es vorher voll war)
        if (isSheetFull) {
          setIsSheetFull(false);
        }
        // 2. Den aktuellen Zustand als letzten bekannten *gültigen* Zustand speichern
        contentBeforeChange.current = JSON.stringify(editor.getJSON());
      }
    },
    onBeforeCreate: () => {
      // Bei onBeforeCreate ist editor.state noch nicht initialisiert
      // Also setzen wir hier nichts
    },
    onCreate: ({ editor }) => {
      // Store initial content when editor is fully created
      contentBeforeChange.current = JSON.stringify(editor.getJSON());

      // Gebe den Editor nach außen weiter
      onEditorMount(editor);
    },
    onUpdate: () => {
      // '{ editor }' Parameter entfernt
      // NICHTS MEHR HIER TUN - Die Aktualisierung von contentBeforeChange
      // passiert jetzt nur noch am Ende einer erfolgreichen onTransaction.
    },
    onDestroy: () => {
      // Wenn der Editor zerstört wird, melden wir null nach außen
      onEditorMount(null);
    },
  });

  // Check if the content exceeds the A4 page height
  const checkContentOverflow = (editorInstance: Editor) => {
    if (!editorInstance) return false;

    const editorElement = editorInstance.view.dom;
    const contentHeight = editorElement.scrollHeight;
    const pageHeight = 297 - 40; // 297mm (A4) minus Ränder
    const pageHeightPx = pageHeight * 3.78; // Etwa 3.78px pro mm

    return contentHeight > pageHeightPx;
  };

  // Initial check for overflow
  React.useEffect(() => {
    if (editor) {
      // Überprüfe initial, ob der Inhalt passt
      const isOverflowing = checkContentOverflow(editor);
      setIsSheetFull(isOverflowing);

      // Blockiere Einfügeaktionen, wenn das Blatt voll ist oder wenn das Einfügen
      // dazu führen würde, dass das Blatt überläuft
      const handlePaste = (event: ClipboardEvent) => {
        // Wenn das Blatt bereits voll ist, Einfügen verhindern
        if (isSheetFull) {
          event.preventDefault();
          console.warn(
            "Das Arbeitsblatt ist voll. Es kann kein weiterer Inhalt eingefügt werden."
          );
          return;
        }

        // Speichere aktuellen Zustand vor dem Einfügen
        contentBeforeChange.current = JSON.stringify(editor.getJSON());

        // Nach dem Einfügen überprüfen, verzögert ausführen
        setTimeout(() => {
          if (checkContentOverflow(editor) && !isTruncating.current) {
            isTruncating.current = true;

            // Wenn das Einfügen dazu geführt hat, dass das Blatt überläuft,
            // auf den vorherigen Zustand zurücksetzen
            if (contentBeforeChange.current) {
              editor.commands.setContent(
                JSON.parse(contentBeforeChange.current)
              );
            }

            setIsSheetFull(true);
            console.warn(
              "Der eingefügte Text ist zu groß und würde das A4-Format überschreiten."
            );

            setTimeout(() => {
              isTruncating.current = false;
            }, 50);
          }
        }, 50);
      };

      // Block keyboard input if sheet is full - Verhindert Eingabe wie eine "Wand"
      const handleKeyDown = (event: KeyboardEvent) => {
        if (isSheetFull) {
          // Allow navigation keys, delete, backspace, ctrl+key combinations
          const allowedKeys = [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "Backspace",
            "Delete",
            "Tab",
            "Escape",
            "Enter",
          ];

          // Allow ctrl/cmd key combinations (for copy, cut, etc.)
          if (event.ctrlKey || event.metaKey) {
            return;
          }

          // Block all other keys if not allowed
          if (!allowedKeys.includes(event.key)) {
            // Alle Eingaben blockieren, wenn das Blatt voll ist (strenge Wand)
            event.preventDefault();
            return false;
          }
        }
      };

      // Add event listeners
      editor.view.dom.addEventListener("paste", handlePaste);
      editor.view.dom.addEventListener("keydown", handleKeyDown);

      return () => {
        // Remove event listeners on cleanup
        editor.view.dom.removeEventListener("paste", handlePaste);
        editor.view.dom.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [editor, isSheetFull]);

  return (
    <div id={sheet.id} className="sheet-container mb-12 print:mb-0 relative">
      {/* Delete button - only show for worksheets after the first one */}
      {index > 0 && (
        <ButtonDeleteRounded
          onClick={() => onDelete(sheet.id)}
          className="absolute -top-3 -right-3 z-10"
          title="Arbeitsblatt löschen"
        />
      )}

      {/* A4 sheet container */}
      <div
        className={`bg-white shadow-md print:shadow-none rounded-md w-[210mm] h-[297mm] mx-auto relative overflow-hidden print:overflow-visible print:page-break-inside-avoid ${className}`}
        style={{
          padding: `${PAGE_SETTINGS.marginTop} ${PAGE_SETTINGS.marginRight} ${PAGE_SETTINGS.marginBottom} ${PAGE_SETTINGS.marginLeft}`,
        }}
      >
        {editor ? (
          <div className="editor-container w-full h-full">
            <EditorContent editor={editor} />
            {editor && <TableControls editor={editor} />}
            {/* Overflow warning */}
            {isSheetFull && (
              <div className="absolute bottom-0 left-0 right-0 bg-yellow-100 text-yellow-800 p-2 text-sm text-center print:hidden">
                Das Arbeitsblatt ist voll. Es kann kein weiterer Inhalt
                hinzugefügt werden.
              </div>
            )}
          </div>
        ) : (
          <div
            contentEditable={true}
            className="w-full h-full outline-none"
            style={{
              lineHeight: PAGE_SETTINGS.lineHeight,
              fontSize: PAGE_SETTINGS.fontSize,
              fontFamily: PAGE_SETTINGS.fontFamily,
            }}
          >
            <h1 className="text-2xl font-bold mb-6">{sheet.content.title}</h1>
            <p>{sheet.content.body}</p>
          </div>
        )}
      </div>

      {/* Add button after the last worksheet */}
      {isLast && (
        <div className="flex justify-center mt-6 mb-2">
          <ButtonAddRounded
            onClick={onAdd}
            size="lg"
            title="Neues Arbeitsblatt hinzufügen"
          />
        </div>
      )}
    </div>
  );
};

/**
 * Main Worksheet Layout Component
 * Manages multiple worksheets and provides PDF export functionality
 */
const LayoutWorkSheet: React.FC<LayoutWorkSheetProps> = ({
  className = "",
  onPrint,
  onEditorMount,
}) => {
  // State for multiple worksheets
  const [worksheets, setWorksheets] = useState<WorksheetData[]>([
    createDefaultWorksheet(),
  ]);

  // Reference for the component to be printed
  const workSheetRef = useRef<HTMLDivElement>(null);

  // Function to add a new worksheet
  const addNewWorksheet = useCallback(() => {
    const newId = generateUniqueId();

    const newSheet = {
      id: newId,
      content: {
        title: "Neues Arbeitsblatt",
        body: "Klicken Sie hier, um zu beginnen...",
      },
    };

    setWorksheets((prev) => [...prev, newSheet]);

    // Scroll to the new worksheet
    setTimeout(() => {
      const lastSheet = document.getElementById(newId);
      if (lastSheet) {
        lastSheet.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }, []);

  // Function to delete a worksheet
  const deleteWorksheet = useCallback(
    (idToDelete: string) => {
      // Prevent deleting all worksheets
      if (worksheets.length <= 1) return;

      // Check if it's the first worksheet
      const indexToDelete = worksheets.findIndex(
        (sheet) => sheet.id === idToDelete
      );
      if (indexToDelete === 0) {
        console.warn("The first worksheet cannot be deleted.");
        return;
      }

      // Remove worksheet with the specified ID
      setWorksheets((prev) => prev.filter((sheet) => sheet.id !== idToDelete));
    },
    [worksheets]
  );

  // PDF export function with native print dialog
  const handlePrintPDF = useCallback(() => {
    if (onPrint) {
      onPrint();
      return;
    }

    // Use the exported PDF export function with specific options for worksheets
    if (workSheetRef.current) {
      exportToPDF(workSheetRef, {
        pageSize: "A4",
        margins: {
          top: PAGE_SETTINGS.marginTop,
          right: PAGE_SETTINGS.marginRight,
          bottom: PAGE_SETTINGS.marginBottom,
          left: PAGE_SETTINGS.marginLeft,
        },
        hideClasses: [
          "print:hidden",
          "add-sheet-button",
          "delete-sheet-button",
        ],
        pageBreakSelectors: [".sheet-container"],
        additionalStyles: getPdfStyles(),
      });
    }
  }, [onPrint]);

  // Update active editor when it changes
  const handleEditorMount = useCallback(
    (editor: Editor | null) => {
      if (onEditorMount) {
        onEditorMount(editor);
      }
    },
    [onEditorMount]
  );

  return (
    <div className="flex flex-col">
      {/* PDF Export Button */}
      <div className="flex justify-end mb-4 print:hidden">
        <ButtonPrimary
          title="Als PDF exportieren"
          onClick={handlePrintPDF}
          className="print:hidden"
        />
      </div>

      {/* Worksheets Container */}
      <div
        ref={workSheetRef}
        className="flex flex-col items-center print:block"
      >
        {worksheets.map((sheet, index) => (
          <WorksheetItem
            key={sheet.id}
            sheet={sheet}
            index={index}
            className={className}
            isLast={index === worksheets.length - 1}
            onDelete={deleteWorksheet}
            onAdd={addNewWorksheet}
            onEditorMount={handleEditorMount}
          />
        ))}
      </div>
    </div>
  );
};

export default LayoutWorkSheet;
