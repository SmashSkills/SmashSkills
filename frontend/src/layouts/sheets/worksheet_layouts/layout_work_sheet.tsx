import React, { useState, useRef, useCallback, useEffect } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import { useDroppable } from "@dnd-kit/core";
import ButtonAddRounded from "../../../components/ui_elements/buttons/button_add_rounded";
import ButtonDeleteRounded from "../../../components/ui_elements/buttons/button_delete_rounded";
import ButtonPrimary from "../../../components/ui_elements/buttons/button_primary";
import { exportToPDF } from "../../../util/pdf_logic/pdf_export";
import { PAGE_SETTINGS } from "./util/page_settings";
import { getEditorExtensions } from "./editor/editor_extensions";
import { applyEditorStyles, getPdfStyles } from "./editor/editor_styles";
import TableControls from "../../../components/tiptap_addons/TableControls";
import * as fabric from "fabric";
import type {
  // WorksheetContent, // Wird indirekt über WorksheetData verwendet
  WorksheetData,
  LayoutWorkSheetProps,
  WorksheetItemProps,
  // DropTargetInfo // Wird indirekt über Props verwendet
} from "./worksheet.types";
import {
  generateUniqueId,
  createDefaultWorksheet,
} from "./util/worksheetUtils";

// Anwenden der Editor-Styles beim Import dieser Komponente
applyEditorStyles();

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
  dropTargetInfo,
  onShapeDropped,
}) => {
  const [isSheetFull, setIsSheetFull] = useState(false);
  const contentBeforeChange = useRef<string | null>(null);
  const isTruncating = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  // Droppable-Logik für dieses spezifische Arbeitsblatt
  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: `droppable-sheet-${sheet.id}`,
    data: {
      accepts: "shape",
      sheetId: sheet.id,
    },
  });

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
      if (!transaction.docChanged || isTruncating.current) return;

      const isOverflowing = checkContentOverflow(editor);
      if (isOverflowing) {
        isTruncating.current = true;
        console.warn("[WorksheetItem] Limit reached, reverting content...");
        if (contentBeforeChange.current) {
          editor.commands.setContent(
            JSON.parse(contentBeforeChange.current),
            false
          );
        }
        setIsSheetFull(true);
        setTimeout(() => {
          isTruncating.current = false;
        }, 50);
      } else {
        if (isSheetFull) {
          setIsSheetFull(false);
        }
        contentBeforeChange.current = JSON.stringify(editor.getJSON());
      }
    },
    onBeforeCreate: () => {
      // Bei onBeforeCreate ist editor.state noch nicht initialisiert
      // Also setzen wir hier nichts
    },
    onCreate: ({ editor }) => {
      contentBeforeChange.current = JSON.stringify(editor.getJSON());
      onEditorMount(editor);
    },
    onUpdate: () => {
      // '{ editor }' Parameter entfernt
      // NICHTS MEHR HIER TUN - Die Aktualisierung von contentBeforeChange
      // passiert jetzt nur noch am Ende einer erfolgreichen onTransaction.
    },
    onDestroy: () => {
      onEditorMount(null);
    },
  });

  // Initialisiere Fabric.js Canvas, wenn die Komponente gemountet wird
  useEffect(() => {
    if (canvasRef.current) {
      const calculateDimension = (dimensionMm: number, marginMm: string) => {
        const margin = parseFloat(marginMm) || 0;
        return (dimensionMm - margin * 2) * 3.78; // mm * 2 Ränder * px/mm
      };
      const canvasWidth = calculateDimension(210, PAGE_SETTINGS.marginLeft); // A4 Breite
      const canvasHeight = calculateDimension(297, PAGE_SETTINGS.marginTop); // A4 Höhe

      console.log(
        `[Canvas Init ${sheet.id}] Initializing canvas with dimensions:`,
        {
          width: canvasWidth,
          height: canvasHeight,
          marginLeft: PAGE_SETTINGS.marginLeft,
          marginTop: PAGE_SETTINGS.marginTop,
        }
      );

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
      });
      fabricCanvasRef.current = canvas;

      // DEBUG: Zeichne ein Testobjekt, um zu prüfen, ob der Canvas grundsätzlich funktioniert
      const testRect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: "blue",
        width: 50,
        height: 50,
      });
      canvas.add(testRect);
      canvas.requestRenderAll();
      console.log(
        `[Canvas Init ${sheet.id}] Added test rectangle, objects count:`,
        canvas.getObjects().length
      );

      // TODO: Hier gespeicherte Formen laden (später)

      // Cleanup-Funktion
      return () => {
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.dispose();
          fabricCanvasRef.current = null;
        }
      };
    }
  }, []);

  // Check if the content exceeds the A4 page height
  const checkContentOverflow = (editorInstance: Editor) => {
    if (!editorInstance) return false;
    const editorElement = editorInstance.view.dom;
    const contentHeight = editorElement.scrollHeight;
    const pageHeight =
      297 -
      (parseFloat(PAGE_SETTINGS.marginTop) || 0) -
      (parseFloat(PAGE_SETTINGS.marginBottom) || 0);
    const pageHeightPx = pageHeight * 3.78;
    return contentHeight > pageHeightPx;
  };

  // Effect für overflow/paste/keydown
  React.useEffect(() => {
    if (!editor) return;
    const handlePaste = (event: ClipboardEvent) => {
      if (isSheetFull || isTruncating.current) {
        event.preventDefault();
        console.warn(
          "[WorksheetItem] Paste prevented: Sheet full or truncating."
        );
        return;
      }
      const contentBeforePaste = JSON.stringify(editor.getJSON());
      setTimeout(() => {
        if (checkContentOverflow(editor) && !isTruncating.current) {
          isTruncating.current = true;
          console.warn("[WorksheetItem] Paste caused overflow, reverting...");
          editor.commands.setContent(JSON.parse(contentBeforePaste), false);
          setIsSheetFull(true);
          setTimeout(() => {
            isTruncating.current = false;
          }, 50);
        }
      }, 50);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isSheetFull || isTruncating.current) {
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
        if (
          !event.ctrlKey &&
          !event.metaKey &&
          !allowedKeys.includes(event.key)
        ) {
          event.preventDefault();
          return false;
        }
      }
    };

    editor.view.dom.addEventListener("paste", handlePaste);
    editor.view.dom.addEventListener("keydown", handleKeyDown);

    return () => {
      editor.view.dom.removeEventListener("paste", handlePaste);
      editor.view.dom.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, isSheetFull]);

  // Style für die Dropzone (visuelles Feedback für den Editor-Bereich)
  const dropzoneStyle: React.CSSProperties = {
    border: isOver ? "2px dashed #4ade80" : "none",
    borderRadius: isOver ? "8px" : "0px",
    transition: "border 0.2s ease-in-out, border-radius 0.2s ease-in-out",
    height: "100%",
    width: "100%",
    position: "relative",
    zIndex: 0,
  };

  // Neuer useEffect, um auf Drops zu reagieren
  useEffect(() => {
    if (
      dropTargetInfo &&
      dropTargetInfo.sheetId === sheet.id &&
      fabricCanvasRef.current &&
      canvasRef.current
    ) {
      const canvas = fabricCanvasRef.current;
      const { shapeType, clientX, clientY } = dropTargetInfo;

      // Wir benötigen ein Element, das die tatsächliche Position des Worksheets im Viewport angibt
      const sheetContainer = document.getElementById(sheet.id);

      if (!sheetContainer) {
        console.error(`Sheet container with ID ${sheet.id} not found`);
        return;
      }

      const sheetRect = sheetContainer.getBoundingClientRect();
      // Jetzt nutzen wir die Position des Sheet-Containers als Basis
      const localX = clientX - sheetRect.left;
      const localY = clientY - sheetRect.top;

      console.log(`[WorksheetItem ${sheet.id}] Sheet rect:`, {
        sheetRect,
        clientX,
        clientY,
        localX,
        localY,
      });

      let fabricObject: fabric.Object | null = null;
      const originXValue: fabric.TOriginX = "center";
      const originYValue: fabric.TOriginY = "center";
      const options = {
        left: localX,
        top: localY,
        fill: "rgba(255,0,0,0.5)", // Rot und deutlich sichtbar
        stroke: "#ff0000",
        strokeWidth: 3,
        originX: originXValue,
        originY: originYValue,
      };

      if (shapeType === "rectangle") {
        fabricObject = new fabric.Rect({ ...options, width: 50, height: 50 });
      } else if (shapeType === "circle") {
        fabricObject = new fabric.Circle({ ...options, radius: 25 });
      } else if (shapeType === "line") {
        console.warn("Line shape placeholder.");
        fabricObject = new fabric.Rect({
          ...options,
          width: 50,
          height: 4,
          originY: "top",
        });
      }

      if (fabricObject) {
        console.log(
          `[WorksheetItem ${sheet.id}] Fabric Object Created:`,
          fabricObject
        );
        canvas.add(fabricObject);
        canvas.requestRenderAll();
        console.log(
          `[WorksheetItem ${sheet.id}] Objects count:`,
          canvas.getObjects().length
        );
      } else {
        console.warn(
          `[WorksheetItem ${sheet.id}] Could not create fabric object for shapeType: ${shapeType}`
        );
      }

      onShapeDropped();
    }
  }, [dropTargetInfo, sheet.id, onShapeDropped]);

  return (
    <div id={sheet.id} className="sheet-container mb-12 print:mb-0 relative">
      {/* Delete button */}
      {index > 0 && (
        <ButtonDeleteRounded
          onClick={() => onDelete(sheet.id)}
          className="absolute -top-3 -right-3 z-20 print:hidden"
          title="Arbeitsblatt löschen"
        />
      )}

      {/* A4 sheet container - Ist jetzt die Dropzone */}
      <div
        ref={setDroppableNodeRef}
        className={`bg-white shadow-md print:shadow-none rounded-md w-[210mm] h-[297mm] mx-auto relative overflow-hidden print:overflow-visible print:page-break-inside-avoid ${className}`}
      >
        {/* Fabric.js Canvas (liegt ÜBER dem Editor) */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 pointer-events-auto"
          style={{
            zIndex: 10,
            border: "1px dashed blue", // Debug-Rahmen zum Sehen der Canvas-Grenzen
          }}
        />

        {/* Tiptap Editor Bereich (nimmt volle Größe ein, liegt unter Canvas) */}
        {editor ? (
          <div style={dropzoneStyle} className="editor-container w-full h-full">
            <EditorContent
              editor={editor}
              style={{
                paddingTop: PAGE_SETTINGS.marginTop,
                paddingRight: PAGE_SETTINGS.marginRight,
                paddingBottom: PAGE_SETTINGS.marginBottom,
                paddingLeft: PAGE_SETTINGS.marginLeft,
                height: "100%",
              }}
            />
            {editor && <TableControls editor={editor} />}
            {/* Overflow warning */}
            {isSheetFull && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-100 text-yellow-800 p-2 text-sm text-center print:hidden z-20 rounded-md shadow">
                Arbeitsblatt ist voll.
              </div>
            )}
          </div>
        ) : (
          <div style={dropzoneStyle} className="w-full h-full outline-none">
            <div
              className="p-4"
              style={{
                paddingTop: PAGE_SETTINGS.marginTop,
                paddingRight: PAGE_SETTINGS.marginRight,
                paddingBottom: PAGE_SETTINGS.marginBottom,
                paddingLeft: PAGE_SETTINGS.marginLeft,
              }}
            >
              <h1 className="text-2xl font-bold mb-6">{sheet.content.title}</h1>
              <p>{sheet.content.body}</p>
            </div>
          </div>
        )}
      </div>

      {/* Add button */}
      {isLast && (
        <div className="flex justify-center mt-6 mb-2 print:hidden">
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
  dropTargetInfo,
  onShapeDropped,
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
            dropTargetInfo={dropTargetInfo}
            onShapeDropped={onShapeDropped}
          />
        ))}
      </div>
    </div>
  );
};

export default LayoutWorkSheet;
