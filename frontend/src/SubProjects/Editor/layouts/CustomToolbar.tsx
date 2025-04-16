import React, { useCallback, useState, useRef, useEffect } from "react";
import { Editor, track } from "@tldraw/tldraw";
import {
  SheetGuideManager,
  SheetGuideFormat,
  SheetGuideSettings,
} from "../utils/GuidesSheetUtil";

interface CustomToolbarProps {
  editor: Editor;
  toggleDrawPopUp: () => void;
  toggleShapeSettings: () => void;
  toggleTextSettings: () => void;
  toggleSnapping: () => void;
  snappingEnabled: boolean;
  sheetGuideManager?: SheetGuideManager | null;
}

// Mit track wrappen, um auf Editor-Zustandsänderungen zu reagieren
const CustomToolbar = track(
  ({
    editor,
    toggleDrawPopUp,
    toggleShapeSettings,
    toggleTextSettings,
    toggleSnapping,
    snappingEnabled,
    sheetGuideManager,
  }: CustomToolbarProps) => {
    // State für aktives Tool - dank track wird das UI automatisch aktualisiert
    const activeTool = editor.getCurrentToolId();

    // State für Sheet-Guide-Dropdown
    const [showGuideDropdown, setShowGuideDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Lokaler State für die Einstellungen
    const [guideSettings, setGuideSettings] = useState<SheetGuideSettings>(() =>
      sheetGuideManager
        ? sheetGuideManager.getSettings()
        : {
            enabled: false,
            showMargins: false,
            showCenterLines: false,
            currentFormat: {
              name: "Standard",
              marginTop: 40,
              marginRight: 40,
              marginBottom: 40,
              marginLeft: 40,
              showCenterLines: true,
            },
            formats: [],
          }
    );

    // Abonniere Änderungen im SheetGuideManager
    useEffect(() => {
      if (!sheetGuideManager) return;

      // Aktualisiere den lokalen State mit den aktuellen Einstellungen
      setGuideSettings({ ...sheetGuideManager.getSettings() });

      // Abonniere Änderungen
      const unsubscribe = sheetGuideManager.subscribe(() => {
        setGuideSettings({ ...sheetGuideManager.getSettings() });
      });

      return unsubscribe;
    }, [sheetGuideManager]);

    // Funktion zum Umschalten des Werkzeugs
    const selectTool = useCallback(
      (toolId: string) => {
        editor.setCurrentTool(toolId);
      },
      [editor]
    );

    // Schließe das Dropdown bei Klick außerhalb
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setShowGuideDropdown(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

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

    // Stil für den Snapping-Button
    const getSnappingButtonStyle = () => {
      const baseClasses =
        "tool-btn w-8 h-8 flex items-center justify-center rounded";

      if (snappingEnabled) {
        return `${baseClasses} bg-orange-100 text-[#ff5722]`;
      }

      return `${baseClasses} hover:bg-blue-100 text-blue-900`;
    };

    // Stil für den Sheet-Guide-Button
    const getSheetGuideButtonStyle = () => {
      const baseClasses =
        "tool-btn w-8 h-8 flex items-center justify-center rounded";

      if (guideSettings.enabled) {
        return `${baseClasses} bg-orange-100 text-[#ff5722]`;
      }

      return `${baseClasses} hover:bg-blue-100 text-blue-900`;
    };

    // Toggle Sheet-Guide
    const toggleSheetGuide = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (sheetGuideManager) {
        sheetGuideManager.toggleEnabled();
        // State wird über das Abonnement aktualisiert
      }
    };

    // Toggle Sheet-Guide-Dropdown
    const toggleGuideDropdown = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowGuideDropdown(!showGuideDropdown);
    };

    // Format ändern
    const changeFormat = (formatName: string) => {
      if (sheetGuideManager) {
        sheetGuideManager.setFormat(formatName);
        // State wird über das Abonnement aktualisiert
      }
    };

    // Toggle Margins
    const toggleMargins = () => {
      if (sheetGuideManager) {
        sheetGuideManager.toggleMargins();
        // State wird über das Abonnement aktualisiert
      }
    };

    // Toggle Center Lines
    const toggleCenterLines = () => {
      if (sheetGuideManager) {
        sheetGuideManager.toggleCenterLines();
        // State wird über das Abonnement aktualisiert
      }
    };

    // Sheet-Guides und Snapping-Funktionalität - ENTFERNT KOPPLUNG
    const handleSnapping = useCallback(() => {
      toggleSnapping();
    }, [toggleSnapping]); // Nur toggleSnapping als Abhängigkeit

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

        <div className="border-l border-gray-300 h-6 mx-1"></div>

        {/* Snapping Button */}
        <button
          className={getSnappingButtonStyle()}
          onClick={handleSnapping}
          title="Hilfslinien & Snapping"
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
            <path d="M3 3h18v18H3z"></path>
            <path d="M11 3v18"></path>
            <path d="M3 11h18"></path>
          </svg>
        </button>

        {/* Sheet-Guides Button mit Dropdown */}
        <div className="relative">
          <button
            className={getSheetGuideButtonStyle()}
            onClick={toggleGuideDropdown}
            title="Sheet-Hilfslinien"
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
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="3" y1="15" x2="21" y2="15"></line>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="15" y1="3" x2="15" y2="21"></line>
            </svg>
          </button>

          {/* Dropdown-Menü */}
          {showGuideDropdown && sheetGuideManager && (
            <div
              ref={dropdownRef}
              className="absolute top-full right-0 mt-1 bg-white shadow-lg rounded-md p-3 z-50 min-w-[200px]"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-gray-900">
                  Sheet-Hilfslinien
                </h3>
                <button
                  className="text-xs text-blue-600 hover:text-blue-800"
                  onClick={toggleSheetGuide}
                >
                  {guideSettings.enabled ? "Ausschalten" : "Einschalten"}
                </button>
              </div>

              {/* Optionen */}
              <div className="mb-3">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="showMargins"
                    checked={guideSettings.showMargins}
                    onChange={toggleMargins}
                    className="mr-2"
                  />
                  <label
                    htmlFor="showMargins"
                    className="text-sm text-gray-700"
                  >
                    Seitenränder anzeigen
                  </label>
                </div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="showCenterLines"
                    checked={guideSettings.showCenterLines}
                    onChange={toggleCenterLines}
                    className="mr-2"
                  />
                  <label
                    htmlFor="showCenterLines"
                    className="text-sm text-gray-700"
                  >
                    Mittelpunktlinien anzeigen
                  </label>
                </div>
              </div>

              {/* Format-Auswahl */}
              <h4 className="text-xs font-bold text-gray-700 mb-1">Format</h4>
              <div className="mb-2">
                <select
                  value={guideSettings.currentFormat.name}
                  onChange={(e) => changeFormat(e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded text-sm"
                >
                  {guideSettings.formats.map((format: SheetGuideFormat) => (
                    <option key={format.name} value={format.name}>
                      {format.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Format-Details */}
              <div className="text-xs text-gray-500">
                {guideSettings.formats.find(
                  (f: SheetGuideFormat) =>
                    f.name === guideSettings.currentFormat.name
                ) && (
                  <div>
                    <div>
                      Ränder: O:
                      {guideSettings.currentFormat.marginTop}
                      px
                    </div>
                    <div>
                      R:
                      {guideSettings.currentFormat.marginRight}
                      px
                    </div>
                    <div>
                      U:
                      {guideSettings.currentFormat.marginBottom}
                      px
                    </div>
                    <div>
                      L:
                      {guideSettings.currentFormat.marginLeft}
                      px
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default CustomToolbar;
