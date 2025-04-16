import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Tldraw,
  Editor,
  DefaultColorStyle,
  DefaultSizeStyle,
} from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import CustomToolbar from "./CustomToolbar";
import SettingsPopup, { SettingsType } from "./SettingsPopup";
import { customShapeUtils } from "../components/custom-shapes/CustomShapeUtils";
import { SnappingGuidesOverlay } from "../utils/SnappingGuidesOverlay";
import { DEFAULT_SNAP_SETTINGS } from "../utils/SnappingUtils";
import { SnappingSettingsPopup } from "../utils/SnappingSettingsPopup";

interface WorksheetProps {
  width?: number;
  height?: number;
  children?: React.ReactNode;
}

// DIN A4 Dimensionen (in Pixeln, bei 96 DPI)
const DIN_A4_WIDTH = 794; // ~ 210mm
const DIN_A4_HEIGHT = 1123; // ~ 297mm

const Worksheet: React.FC<WorksheetProps> = ({ children }) => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [showSettingsSidebar, setShowSettingsSidebar] = useState<boolean>(true);
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsType>(
    "draw"
  );
  const editorRef = useRef<Editor | null>(null);
  const [snappingEnabled, setSnappingEnabled] = useState<boolean>(true);
  const [snapSettings, setSnapSettings] = useState(DEFAULT_SNAP_SETTINGS);
  const [showSnappingSettings, setShowSnappingSettings] = useState<boolean>(
    false
  );

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
  const handleMount = useCallback((newEditor: Editor) => {
    setEditor(newEditor);
    editorRef.current = newEditor;

    // Standard-Werkzeug und Stile setzen
    newEditor.setCurrentTool("select");

    // Einzelne Styles setzen (werden zur History hinzugefügt)
    newEditor.setStyleForNextShapes(DefaultColorStyle, "black");
    newEditor.setStyleForNextShapes(DefaultSizeStyle, "s");
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
    setSnappingEnabled(!snappingEnabled);
  }, [snappingEnabled]);

  // Funktionen für Snapping-Einstellungen
  const toggleSnappingSettings = useCallback(() => {
    setShowSnappingSettings(!showSnappingSettings);
  }, [showSnappingSettings]);

  const handleSnapSettingsChange = useCallback(
    (newSettings: typeof DEFAULT_SNAP_SETTINGS) => {
      setSnapSettings(newSettings);
    },
    []
  );

  // Toggle für die Settings-Sidebar
  return (
    <div className="flex flex-col items-center w-full max-h-full">
      <div className="w-full flex flex-row items-start gap-4 sticky top-0 z-10 bg-white p-1 border-b border-gray-200">
        {/* Toolbar */}
        <div className="flex justify-center flex-grow">
          {editor && (
            <CustomToolbar
              editor={editor}
              toggleDrawPopUp={toggleDrawSettings}
              toggleShapeSettings={toggleShapeSettings}
              toggleTextSettings={toggleTextSettings}
            />
          )}
        </div>

        {/* Snapping-Toggle und Einstellungen */}
        {editor && (
          <div className="flex items-center ml-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={snappingEnabled}
                onChange={toggleSnapping}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-2 text-sm font-medium text-gray-700">
                Snapping
              </span>
            </label>
            <button
              className="ml-2 px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm text-gray-700 flex items-center"
              onClick={toggleSnappingSettings}
              title="Snapping-Einstellungen"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            {/* Snapping-Einstellungen-Popup */}
            {showSnappingSettings && (
              <SnappingSettingsPopup
                settings={snapSettings}
                onSettingsChange={handleSnapSettingsChange}
                isVisible={showSnappingSettings}
              />
            )}
          </div>
        )}
      </div>

      {/* Hauptbereich mit Worksheet und Sidebar */}
      <div className="flex w-full min-h-[calc(100vh-70px)]">
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
                {/* Snapping-Hilfslinien-Overlay */}
                {editor && snappingEnabled && (
                  <SnappingGuidesOverlay
                    enabled={snappingEnabled}
                    snapSettings={snapSettings}
                    guideColor="#3b82f6"
                    guideWidth={1.5}
                  />
                )}
              </Tldraw>
            </div>
          </div>
        </div>

        {/* Einstellungen Sidebar */}
        {editor && showSettingsSidebar && (
          <div className="relative flex-shrink-0 bg-white h-[calc(100vh-70px)]">
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
