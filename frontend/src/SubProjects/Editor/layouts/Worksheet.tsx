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
import { UserImportedImageUtil } from "../components/custom-shapes/UserImportedShapeutil";
import { LayerDividerShapeUtil } from "../components/custom-shapes/LayerDividerShapeUtil";
import {
  createGuidelinesManager,
  GuidelinesManager,
} from "../utils/GuidesUtil";
import { createSnappingManager, SnappingManager } from "../utils/SnappingUtil";
import {
  createSheetGuideManager,
  SheetGuideManager,
} from "../utils/GuidesSheetUtil";
// Framer Motion importieren
import { motion, AnimatePresence } from "framer-motion";

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
  const [activeSidebar, setActiveSidebar] = useState<SettingsType | null>(null);
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
        if (
          snappingEnabled &&
          sheetGuideManagerRef.current &&
          newEditor.getSelectedShapeIds().length > 0
        ) {
          const selectedIds = newEditor.getSelectedShapeIds();

          for (const id of selectedIds) {
            const bounds = newEditor.getShapePageBounds(id);
            if (bounds) {
              // Wenn Sheet-Guides aktiviert sind, reguläre Hilfslinien nicht anzeigen
              if (
                sheetGuideManagerRef.current.getSettings().enabled &&
                guidelinesManagerRef.current
              ) {
                guidelinesManagerRef.current.clearGuidelines();
              } else if (guidelinesManagerRef.current) {
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
      const updateSidebarBasedOnTool = () => {
        const toolId = editor.getCurrentToolId();

        // Nur aktualisieren, wenn sich das Werkzeug geändert hat UND die Layer-Sidebar nicht aktiv ist
        if (toolId !== currentTool && activeSidebar !== "layer") {
          setCurrentTool(toolId);
          if (toolId === "draw") {
            setActiveSidebar("draw");
          } else if (toolId === "custom-geo") {
            // Nur noch custom-geo
            setActiveSidebar("shape");
          } else if (toolId === "text") {
            setActiveSidebar("text");
          } else if (toolId === "select" || toolId === "eraser") {
            // Verstecke die Sidebar nicht mehr automatisch bei Select/Eraser
            // setActiveSidebar(null);
          }
        }
      };

      // Sofort ausführen und dann intervallbasiert
      updateSidebarBasedOnTool();
      const intervalId = setInterval(updateSidebarBasedOnTool, 100);

      return () => clearInterval(intervalId);
    }
  }, [editor, currentTool, activeSidebar]);

  // Überwache die Auswahl und öffne die entsprechenden Einstellungen
  useEffect(() => {
    if (editor) {
      let lastSelectedIds: string[] = [];
      const checkSelectionChange = () => {
        // Nur reagieren, wenn Select-Tool aktiv ist und Layer-Sidebar nicht offen ist
        if (editor.getCurrentToolId() !== "select" || activeSidebar === "layer")
          return;

        const selectedIds = editor.getSelectedShapeIds();
        if (
          selectedIds.length !== lastSelectedIds.length ||
          selectedIds.some((id, i) => lastSelectedIds[i] !== id)
        ) {
          lastSelectedIds = [...selectedIds];
          if (selectedIds.length === 0) return;

          const firstSelectedShape = editor.getShape(selectedIds[0]);
          if (!firstSelectedShape) return;

          if (editor.isShapeOfType(firstSelectedShape, "text")) {
            setActiveSidebar("text");
          } else if (editor.isShapeOfType(firstSelectedShape, "custom-geo")) {
            setActiveSidebar("shape");
          } else if (editor.isShapeOfType(firstSelectedShape, "draw")) {
            setActiveSidebar("draw");
          } else {
            // Bei anderen Typen (z.B. user-image) keine Sidebar automatisch öffnen
            // setActiveSidebar(null);
          }
        }
      };

      const intervalId = setInterval(checkSelectionChange, 100);
      return () => clearInterval(intervalId);
    }
  }, [editor, activeSidebar]);

  // Toggle-Funktionen für die Einstellungen
  const toggleDrawSettings = useCallback(() => {
    setActiveSidebar((prev) => (prev === "draw" ? null : "draw"));
  }, []);

  const toggleShapeSettings = useCallback(() => {
    setActiveSidebar((prev) => {
      const isOpening = prev !== "shape";
      if (isOpening && editor) {
        // Wenn geöffnet wird, zum Auswahlwerkzeug wechseln
        editor.setCurrentTool("select");
      }
      // Den Sidebar-Status umschalten
      return isOpening ? "shape" : null;
    });
  }, [editor]);

  const toggleTextSettings = useCallback(() => {
    setActiveSidebar((prev) => (prev === "text" ? null : "text"));
  }, []);

  // Toggle-Funktion für Layer-Sidebar
  const toggleLayerSettings = useCallback(() => {
    setActiveSidebar((prev) => {
      const isOpening = prev !== "layer";
      if (isOpening && editor) {
        editor.setCurrentTool("select");
      }
      return isOpening ? "layer" : null;
    });
  }, [editor]);

  // Toggle-Funktion für Snapping
  const toggleSnapping = useCallback(() => {
    if (editor && snappingManagerRef.current) {
      snappingManagerRef.current.toggleSnapping();
      setSnappingEnabled(!snappingEnabled);
      // Aktualisiere die tldraw-interne Einstellung
      editor.user.updateUserPreferences({ isSnapMode: !snappingEnabled });
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

  // --- Animationsvarianten für die Sidebar selbst (nur noch Opacity) ---
  const sidebarVisualVariants = {
    hidden: {
      opacity: 0,
      transition: { duration: 0.2 }, // Kürzere Opacity-Transition
    },
    visible: {
      opacity: 1,
      transition: { duration: 0.2, delay: 0.1 }, // Kleine Verzögerung für Opacity
    },
  };
  // --- Ende Animationsvarianten Sidebar ---

  // --- Animationsvarianten für den Worksheet-Container (Padding) ---
  const worksheetAreaVariants = {
    noSidebar: {
      paddingRight: "0rem",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    withSidebar: {
      paddingRight: "20rem", // Breite der Sidebar (w-xs = 20rem)
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };
  // --- Ende Animationsvarianten Worksheet ---

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
              toggleLayerSettings={toggleLayerSettings}
              activeSidebar={activeSidebar}
            />
          )}
        </div>
      </div>

      {/* Hauptbereich mit Worksheet und Sidebar */}
      {/* Position relative benötigt, damit absolute Sidebar sich daran orientiert */}
      <div className="flex w-full flex-1 overflow-auto relative">
        {/* Container für Worksheet - jetzt animiert */}
        <motion.div
          className="flex-grow overflow-auto py-10 flex justify-center"
          variants={worksheetAreaVariants}
          animate={activeSidebar !== null ? "withSidebar" : "noSidebar"}
          initial={false} // Verhindert initiale Animation des Paddings
        >
          {/* DIN A4 Container */}
          <div
            ref={worksheetContainerRef}
            className="worksheet-container bg-white shadow-lg overflow-hidden relative flex-shrink-0 border border-gray-200"
            style={{ width: DIN_A4_WIDTH, height: DIN_A4_HEIGHT }}
            onWheel={handleWheel}
          >
            {/* Tldraw nimmt den gesamten Container ein */}
            <div className="absolute inset-0">
              <Tldraw
                hideUi={true}
                cameraOptions={cameraOptions}
                persistenceKey="worksheet-persistent-storage"
                onMount={handleMount}
                shapeUtils={[
                  ...customShapeUtils,
                  UserImportedImageUtil,
                  LayerDividerShapeUtil,
                ]}
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
                {((): React.ReactElement | null => {
                  const SheetGuidelines = sheetGuideManagerRef.current!
                    .SheetGuidelines;
                  return SheetGuidelines ? <SheetGuidelines /> : null;
                })()}
              </div>
            )}
          </div>
        </motion.div>

        {/* Einstellungen Sidebar mit Animation (Position angepasst) */}
        <AnimatePresence>
          {editor && activeSidebar !== null && (
            <motion.div
              // Absolute Positionierung rechts, Höhe 100%
              className="absolute top-0 right-0 h-full bg-white shadow-lg z-20"
              // Feste Breite hier setzen!
              style={{ width: "20rem" }} // Entspricht w-xs
              variants={sidebarVisualVariants} // Nur Opacity-Animation
              initial="hidden"
              animate="visible"
              exit="hidden"
              key="settings-sidebar-wrapper"
            >
              <SettingsPopup
                editor={editor}
                isVisible={true} // Immer true, da AnimatePresence steuert
                type={activeSidebar}
                // Nimmt jetzt volle Breite des motion.div ein
                className="settings-sidebar w-full h-full self-start"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Worksheet;
