import React, { useCallback } from "react";
import { Editor, track } from "@tldraw/tldraw";

interface CustomToolbarProps {
  editor: Editor;
  toggleDrawPopUp: () => void;
  toggleShapeSettings: () => void;
  toggleTextSettings: () => void;
}

// Mit track wrappen, um auf Editor-Zustandsänderungen zu reagieren
const CustomToolbar = track(
  ({
    editor,
    toggleDrawPopUp,
    toggleShapeSettings,
    toggleTextSettings,
  }: CustomToolbarProps) => {
    // State für aktives Tool - dank track wird das UI automatisch aktualisiert
    const activeTool = editor.getCurrentToolId();

    // Funktion zum Umschalten des Werkzeugs
    const selectTool = useCallback(
      (toolId: string) => {
        editor.setCurrentTool(toolId);
      },
      [editor]
    );

    // Stil für aktiven Button
    const getButtonStyle = (toolId: string) => {
      const baseClasses =
        "tool-btn w-8 h-8 flex items-center justify-center rounded";

      if (activeTool === toolId) {
        return `${baseClasses} bg-orange-100 text-[#ff5722]`;
      }

      return `${baseClasses} hover:bg-blue-100 text-blue-900`;
    };

    // Stil für aktiven Formen-Button
    const getShapeButtonStyle = () => {
      const baseClasses =
        "tool-btn w-8 h-8 flex items-center justify-center rounded";

      if (
        activeTool === "geo" ||
        activeTool === "line" ||
        activeTool === "arrow"
      ) {
        return `${baseClasses} bg-orange-100 text-[#ff5722]`;
      }

      return `${baseClasses} hover:bg-blue-100 text-blue-900`;
    };

    return (
      <div className="custom-toolbar flex items-center gap-2 bg-white p-1 rounded-md">
        <button
          className={getButtonStyle("select")}
          onClick={() => selectTool("select")}
          title="Auswahl"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
          </svg>
        </button>

        <button
          className={getButtonStyle("draw")}
          onClick={() => {
            // Auswahl aufheben, damit keine Elemente unbeabsichtigt geändert werden
            editor.selectNone();
            selectTool("draw");
            toggleDrawPopUp();
          }}
          title="Zeichnen"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
            <path d="M2 2l7.586 7.586"></path>
            <circle cx="11" cy="11" r="2"></circle>
          </svg>
        </button>

        {/* Formen-Button */}
        <button
          className={getShapeButtonStyle()}
          onClick={() => {
            // Auswahl aufheben, damit keine Elemente unbeabsichtigt geändert werden
            editor.selectNone();
            // Aktiviere das Form-Tool (wenn nicht schon aktiv)
            if (activeTool !== "geo") {
              editor.setCurrentTool("geo", { shapeType: "rectangle" });
            }
            // Öffne die Formeinstellungen
            toggleShapeSettings();
          }}
          title="Formen"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          </svg>
        </button>

        {/* Text-Button */}
        <button
          className={getButtonStyle("text")}
          onClick={() => {
            // Auswahl aufheben, damit keine Elemente unbeabsichtigt geändert werden
            editor.selectNone();
            selectTool("text");
            toggleTextSettings();
          }}
          title="Text hinzufügen"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 6.1H3"></path>
            <path d="M21 12.1H3"></path>
            <path d="M15.1 18H3"></path>
          </svg>
        </button>

        <div className="border-l border-gray-300 h-6 mx-1"></div>

        <button
          className={getButtonStyle("eraser")}
          onClick={() => selectTool("eraser")}
          title="Radiergummi"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 20H7L3 16C2.5 15.5 2.5 14.5 3 14L13 4C13.5 3.5 14.5 3.5 15 4L21 10C21.5 10.5 21.5 11.5 21 12L11 22"></path>
          </svg>
        </button>

        <button
          className="tool-btn w-8 h-8 flex items-center justify-center rounded hover:bg-red-100 text-red-700"
          onClick={() => editor.deleteShapes(editor.getSelectedShapeIds())}
          title="Löschen"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>

        <div className="border-l border-gray-300 h-6 mx-1"></div>

        <button
          className="tool-btn w-8 h-8 flex items-center justify-center rounded hover:bg-blue-100 text-blue-900"
          onClick={() => editor.undo()}
          title="Rückgängig"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 7v6h6"></path>
            <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"></path>
          </svg>
        </button>

        <button
          className="tool-btn w-8 h-8 flex items-center justify-center rounded hover:bg-blue-100 text-blue-900"
          onClick={() => editor.redo()}
          title="Wiederholen"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 7v6h-6"></path>
            <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"></path>
          </svg>
        </button>
      </div>
    );
  }
);

export default CustomToolbar;
