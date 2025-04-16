//MAIN DATA

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Tldraw,
  Editor,
  DefaultColorStyle,
  DefaultSizeStyle,
  TLShapeId,
} from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import CustomToolbar from "./CustomToolbar";
import SettingsPopup, { SettingsType } from "./SettingsPopup";
import { customShapeUtils } from "../components/custom-shapes/CustomShapeUtils";
import {
  createGuidelinesManager,
  GuidelinesManager,
} from "../utils/GuidesUtil";
import { createSnappingManager, SnappingManager } from "../utils/SnappingUtil";
import {
  createSheetGuideManager,
  SheetGuideManager,
} from "../utils/GuidesSheetUtil";

interface WorksheetProps {
  width?: number;
  height?: number;
  children?: React.ReactNode;
}

// DIN A4 Dimensionen (in Pixeln, bei 96 DPI)
const DIN_A4_WIDTH = 794; // ~ 210mm
const DIN_A4_HEIGHT = 1123; // ~ 297mm

// ENTFERNE DIE UNBENUTZTE GUIDELINE-KOMPONENTE
// const Guideline: React.FC<{
//   direction: "horizontal" | "vertical";
//   position: number;
// }> = ({ direction, position }) => {
//   const style: React.CSSProperties =
//     direction === "horizontal"
//       ? {
//           position: "absolute",
//           left: 0,
//           top: `${position}px`,
//           width: "100%",
//           height: "1px",
//           backgroundColor: "hsl(212, 95%, 55%)",
//           pointerEvents: "none",
//           zIndex: 999,
//         }
//       : {
//           position: "absolute",
//           left: `${position}px`,
//           top: 0,
//           width: "1px",
//           height: "100%",
//           backgroundColor: "hsl(212, 95%, 55%)",
//           pointerEvents: "none",
//           zIndex: 999,
//         };
//
//   return <div style={style} />;
// };

const Worksheet: React.FC<WorksheetProps> = ({ children }) => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [showSettingsSidebar, setShowSettingsSidebar] = useState<boolean>(true);
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsType>(
    "draw"
  );
  const editorRef = useRef<Editor | null>(null);
  const [snappingEnabled, setSnappingEnabled] = useState<boolean>(true);

  // Refs für die Hilfslinien und Snapping-Manager
  const guidelinesManagerRef = useRef<GuidelinesManager | null>(null);
  const snappingManagerRef = useRef<SnappingManager | null>(null);
  const sheetGuideManagerRef = useRef<SheetGuideManager | null>(null);

  // Ref für den Worksheet-Container
  const worksheetContainerRef = useRef<HTMLDivElement>(null);

  // Kamera-Optionen, um das Scrollen und Panning zu deaktivieren
  const cameraOptions = {
    isLocked: true,
    wheelBehavior: "none" as const,
    panSpeed: 0,
    zoomSpeed: 0,
  };

  // Setzt den Editor nach dem Mounten
  const handleMount = useCallback(
    (newEditor: Editor) => {
      setEditor(newEditor);
      editorRef.current = newEditor;

      // Standard-Werkzeug und Stile setzen
      newEditor.setCurrentTool("select");

      // Einzelne Styles setzen (werden zur History hinzugefügt)
      newEditor.setStyleForNextShapes(DefaultColorStyle, "black");
      newEditor.setStyleForNextShapes(DefaultSizeStyle, "s");

      // Hilfslinien und Snapping initialisieren
      const guidelinesManager = createGuidelinesManager(newEditor);
      const snappingManager = createSnappingManager(newEditor);
      const sheetGuideManager = createSheetGuideManager(
        newEditor,
        DIN_A4_WIDTH,
        DIN_A4_HEIGHT
      );

      guidelinesManagerRef.current = guidelinesManager;
      snappingManagerRef.current = snappingManager;
      sheetGuideManagerRef.current = sheetGuideManager;

      // Aktiviere Snapping standardmäßig
      newEditor.user.updateUserPreferences({ isSnapMode: snappingEnabled });

      // Abonniere das onTranslateShape-Event für Snapping
      newEditor.store.listen(() => {
        // Statt auf spezifische Eigenschaften zuzugreifen, die TypeScript-Fehler verursachen,
        // verwenden wir eine einfachere Bedingung: Wenn Shapes ausgewählt sind und Snapping aktiviert ist
        if (
          snappingEnabled &&
          sheetGuideManagerRef.current &&
          newEditor.getSelectedShapeIds().length > 0
        ) {
          // Aktualisiere die Hilfslinien, wenn Shapes bewegt werden
          const selectedIds = newEditor.getSelectedShapeIds();

          for (const id of selectedIds) {
            const bounds = newEditor.getShapePageBounds(id);
            if (bounds) {
              // Wenn Sheet-Guides aktiviert sind, reguläre Hilfslinien nicht anzeigen
              if (
                sheetGuideManagerRef.current.getSettings().enabled &&
                guidelinesManagerRef.current
              ) {
                // Hilfslinien ausblenden
                guidelinesManagerRef.current.clearGuidelines();
              } else if (guidelinesManagerRef.current) {
                // Ansonsten: Reguläre Hilfslinien aktualisieren
                guidelinesManagerRef.current.updateGuidelines(
                  bounds,
                  id as TLShapeId
                );
              }

              // Sheet-Snapping anwenden
              const {
                offsetX,
                offsetY,
              } = sheetGuideManagerRef.current.calculateSnapOffset(bounds);

              if (offsetX !== 0 || offsetY !== 0) {
                const shape = newEditor.getShape(id);
                if (shape) {
                  try {
                    // Wende den Offset in einer Editor-Transaktion an
                    newEditor.updateShapes([
                      {
                        id,
                        type: shape.type,
                        x: shape.x + offsetX,
                        y: shape.y + offsetY,
                      },
                    ]);
                  } catch (error) {
                    console.error(
                      "Fehler beim Anwenden des Sheet-Snappings:",
                      error
                    );
                  }
                }
              }
            }
          }
        }
      });

      // Wir verwenden einen anderen Ansatz zum Tracking der Bewegungen
      // Statt TLDraw-Events verwenden wir Pointer-Events am Canvas
      const canvas = document.querySelector(".tl-canvas");
      if (canvas) {
        canvas.addEventListener("pointermove", () => {
          if (newEditor.getSelectedShapeIds().length > 0) {
            handlePointerMove({
              target: "shape",
              pointerId: 1,
            });
          }
        });
        canvas.addEventListener("pointerup", handlePointerUp);
      }

      // Bounds für Hilfslinien aktualisieren
      guidelinesManager.updateBoundsCache();
    },
    [snappingEnabled]
  );

  // Behandelt die Mausbewegung während des Drags
  const handlePointerMove = useCallback(
    (info: {
      target: "shape" | "canvas" | "selection" | "handle";
      pointerId: number;
    }) => {
      if (!editor || !guidelinesManagerRef.current) return;

      // Nur fortfahren, wenn Shapes ausgewählt sind und bewegt werden
      if (editor.getSelectedShapeIds().length === 0) return;
      if (info.target !== "shape" && info.target !== "selection") return;

      // Ausgewählte Shapes und deren Bounds
      const selectedIds = editor.getSelectedShapeIds();
      if (selectedIds.length === 0) return;

      // Wenn Sheet-Guides aktiviert sind, keine dynamischen Hilfslinien zeigen
      if (
        sheetGuideManagerRef.current &&
        sheetGuideManagerRef.current.getSettings().enabled
      ) {
        // Wir sind fertig - Sheet-Guides werden über den Store-Listener behandelt
        return;
      }

      // Ansonsten: Für jedes ausgewählte Shape reguläre dynamische Hilfslinien aktualisieren
      for (const id of selectedIds) {
        const bounds = editor.getShapePageBounds(id);
        if (bounds) {
          guidelinesManagerRef.current.updateGuidelines(
            bounds,
            id as TLShapeId
          );
        }
      }
    },
    [editor]
  );

  // Behandelt das Loslassen der Maus nach dem Drag
  const handlePointerUp = useCallback(() => {
    if (!guidelinesManagerRef.current) return;
    // Hilfslinien ausblenden
    guidelinesManagerRef.current.clearGuidelines();
  }, []);

  // Event-Handler für Scroll-Events vom Worksheet
  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Verhindert, dass tldraw das Wheel-Event verarbeitet
    e.stopPropagation();
  }, []);

  // Überwache das aktuelle Werkzeug und zeige die entsprechenden Einstellungen
  useEffect(() => {
    if (editor) {
      // Aktuelle Werkzeug-ID abrufen
      const toolId = editor.getCurrentToolId();

      // Nur aktualisieren, wenn sich das Werkzeug geändert hat
      if (toolId !== currentTool) {
        setCurrentTool(toolId);

        // Automatisch das entsprechende Settings-Panel basierend auf dem Werkzeug anzeigen
        if (toolId === "draw") {
          setActiveSettingsTab("draw");
          setShowSettingsSidebar(true);
        } else if (
          toolId === "geo" ||
          toolId === "line" ||
          toolId === "arrow"
        ) {
          setActiveSettingsTab("shape");
          setShowSettingsSidebar(true);
        } else if (toolId === "text") {
          setActiveSettingsTab("text");
          setShowSettingsSidebar(true);
        } else if (toolId === "select" || toolId === "eraser") {
          // Seitenleiste nicht verstecken, nur den aktiven Tab ändern
          // setShowSettingsSidebar(false);
        }
      }

      // Regelmäßig prüfen, ob sich das aktuelle Werkzeug geändert hat
      const intervalId = setInterval(() => {
        const newToolId = editor.getCurrentToolId();
        if (newToolId !== currentTool) {
          setCurrentTool(newToolId);
        }
      }, 100);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [editor, currentTool]);

  // Überwache die Auswahl und öffne die entsprechenden Einstellungen
  useEffect(() => {
    if (editor) {
      // Speichere die letzte bekannte Auswahl
      let lastSelectedIds: string[] = [];

      // Erstelle eine Funktion, die bei Änderungen der Auswahl aufgerufen wird
      const checkSelectionChange = () => {
        // Wenn das Werkzeug nicht "select" ist, reagiere nicht auf Auswahländerungen
        if (editor.getCurrentToolId() !== "select") return;

        const selectedIds = editor.getSelectedShapeIds();

        // Prüfe, ob sich die Auswahl geändert hat
        if (
          selectedIds.length !== lastSelectedIds.length ||
          selectedIds.some((id, i) => lastSelectedIds[i] !== id)
        ) {
          // Aktualisiere die letzte bekannte Auswahl
          lastSelectedIds = [...selectedIds];

          // Wenn keine Shapes ausgewählt sind, nichts tun
          if (selectedIds.length === 0) return;

          // Hole die ausgewählten Shapes
          const selectedShapes = editor.getSelectedShapes();
          if (selectedShapes.length === 0) return;

          // Prüfe den Typ des ersten ausgewählten Elements
          const firstSelectedShape = selectedShapes[0];

          if (firstSelectedShape.type === "text") {
            // Wenn ein Text ausgewählt ist, öffne die Text-Einstellungen
            setActiveSettingsTab("text");
            setShowSettingsSidebar(true);
          } else if (
            firstSelectedShape.type === "geo" ||
            firstSelectedShape.type === "line" ||
            firstSelectedShape.type === "arrow" ||
            firstSelectedShape.type === "custom-geo"
          ) {
            // Wenn eine Form ausgewählt ist, öffne die Form-Einstellungen
            setActiveSettingsTab("shape");
            setShowSettingsSidebar(true);
          } else if (firstSelectedShape.type === "draw") {
            // Wenn eine Zeichnung ausgewählt ist, öffne die Stift-Einstellungen
            setActiveSettingsTab("draw");
            setShowSettingsSidebar(true);
          }
        }
      };

      // Regelmäßig prüfen, ob sich die Auswahl geändert hat (alle 100ms)
      const intervalId = setInterval(checkSelectionChange, 100);

      // Cleanup beim Unmount
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [editor]);

  // Toggle-Funktionen für die Einstellungen
  const toggleDrawSettings = useCallback(() => {
    setActiveSettingsTab("draw");
    setShowSettingsSidebar(true);
  }, []);

  const toggleShapeSettings = useCallback(() => {
    setActiveSettingsTab("shape");
    setShowSettingsSidebar(true);
  }, []);

  const toggleTextSettings = useCallback(() => {
    setActiveSettingsTab("text");
    setShowSettingsSidebar(true);
  }, []);

  // Toggle-Funktion für Snapping
  const toggleSnapping = useCallback(() => {
    if (editor && snappingManagerRef.current) {
      snappingManagerRef.current.toggleSnapping();
      setSnappingEnabled(!snappingEnabled);
    }
  }, [snappingEnabled, editor]);

  // Event-Handler für die Entfernen-Taste
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && editor) {
        const selectedIds = editor.getSelectedShapeIds();
        if (selectedIds.length > 0) {
          editor.deleteShapes(selectedIds);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor]);

  // Hilfslinien-Komponente innerhalb der Worksheet-Komponente
  const Guidelines: React.FC = () => {
    // Rückgabe eines leeren Elements statt Fehlerbehandlung
    // Es gibt zu viele TypeScript-Fehler durch Zugriff auf interne Strukturen
    return <></>;
  };

  // Toggle für die Settings-Sidebar
  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="w-full flex flex-row items-start gap-4 sticky top-0 z-10 bg-white p-1 border-b border-gray-200">
        {/* Toolbar */}
        <div className="flex justify-center flex-grow">
          {editor && (
            <CustomToolbar
              editor={editor}
              toggleDrawPopUp={toggleDrawSettings}
              toggleShapeSettings={toggleShapeSettings}
              toggleTextSettings={toggleTextSettings}
              toggleSnapping={toggleSnapping}
              snappingEnabled={snappingEnabled}
              sheetGuideManager={sheetGuideManagerRef.current}
            />
          )}
        </div>
      </div>

      {/* Hauptbereich mit Worksheet und Sidebar */}
      <div className="flex w-full flex-1 overflow-auto">
        {/* Container für Worksheet */}
        <div className="flex-grow overflow-auto py-10 flex justify-center">
          {/* DIN A4 Container */}
          <div
            ref={worksheetContainerRef}
            className="worksheet-container bg-white shadow-lg overflow-hidden relative flex-shrink-0 border border-gray-200"
            style={{
              width: DIN_A4_WIDTH,
              height: DIN_A4_HEIGHT,
            }}
            onWheel={handleWheel}
          >
            {/* Tldraw nimmt den gesamten Container ein */}
            <div className="absolute inset-0">
              <Tldraw
                hideUi={true}
                cameraOptions={cameraOptions}
                persistenceKey="worksheet-persistent-storage"
                onMount={handleMount}
                shapeUtils={customShapeUtils}
              >
                {children}
              </Tldraw>
            </div>

            {/* Hilfslinienlayer über TLDraw rendern */}
            {editor && guidelinesManagerRef.current && (
              <div className="absolute inset-0 pointer-events-none z-50">
                <Guidelines />
              </div>
            )}

            {/* Sheet-Hilfslinien über TLDraw rendern */}
            {editor && sheetGuideManagerRef.current && (
              <div className="absolute inset-0 pointer-events-none z-40">
                {(() => {
                  const SheetGuidelines = sheetGuideManagerRef.current!
                    .SheetGuidelines;
                  return <SheetGuidelines />;
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Einstellungen Sidebar */}
        {editor && showSettingsSidebar && (
          <div className="relative flex-shrink-0 bg-white h-full">
            <SettingsPopup
              editor={editor}
              isVisible={true}
              type={activeSettingsTab}
              className="settings-sidebar top-[70px] self-start z-50"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Worksheet;
