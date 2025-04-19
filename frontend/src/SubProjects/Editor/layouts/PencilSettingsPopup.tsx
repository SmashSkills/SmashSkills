import React, { useState, useEffect } from "react";
import {
  Editor,
  DefaultColorStyle,
  DefaultSizeStyle,
  DefaultDashStyle,
  type TLDrawShape,
} from "@tldraw/tldraw";
import ButtonSliderHorizontal from "../../../components/ui_elements/buttons/button_slider_horizontal";
import ButtonSliderVertical from "../../../components/ui_elements/buttons/button_slider_vertical";
import ButtonColorPalette from "../../../components/ui_elements/buttons/button_color_palette";

interface PencilSettingsPopupProps {
  editor: Editor;
  isVisible: boolean;
}

// Nur von tldraw unterstützte Farben, gruppiert nach Farbfamilien
// Die ID muss exakt übereinstimmen, um mit tldraw zu funktionieren
const COLOR_PALETTE: { id: string; label: string; hex: string }[] = [
  // Grau und Schwarz
  { id: "black", label: "Schwarz", hex: "#000000" },
  { id: "grey", label: "Grau", hex: "#808080" },
  { id: "white", label: "Weiß", hex: "#ffffff" },

  // Rot-Töne
  { id: "red", label: "Rot", hex: "#dc2626" },
  { id: "light-red", label: "Hellrot", hex: "#ff8787" },
  { id: "orange", label: "Orange", hex: "#ff5722" },

  // Gelb
  { id: "yellow", label: "Gelb", hex: "#f59e0b" },

  // Grün-Töne
  { id: "green", label: "Grün", hex: "#16a34a" },
  { id: "light-green", label: "Hellgrün", hex: "#4ade80" },

  // Blau und Violett-Töne
  { id: "blue", label: "Blau", hex: "#2563eb" },
  { id: "light-blue", label: "Hellblau", hex: "#38bdf8" },
  { id: "violet", label: "Violett", hex: "#8b5cf6" },
  { id: "light-violet", label: "Hellviolett", hex: "#a28add" },
];

// Stiftgrößen - Bereit für den Slider
const SIZES = [
  { id: "s", label: "Dünn", value: 2 },
  { id: "m", label: "Mittel", value: 4 },
  { id: "l", label: "Stark", value: 6 },
  { id: "xl", label: "Dick", value: 8 },
];

// Strichstile - Bereit für den vertikalen Slider
const DASH_STYLES = [
  { id: "draw", label: "Füller", icon: null },
  { id: "solid", label: "Durchgezogen", icon: null },
  { id: "dashed", label: "Gestrichelt", icon: null },
  { id: "dotted", label: "Gepunktet", icon: null },
];

const PencilSettingsPopup: React.FC<PencilSettingsPopupProps> = ({
  editor,
  isVisible,
}) => {
  // State für aktuelle Stile - Hooks müssen vor bedingten Renderern aufgerufen werden
  const [currentColor, setCurrentColor] = useState<string>("black");
  const [currentSize, setCurrentSize] = useState<string>("m");
  const [currentDash, setCurrentDash] = useState<string>("draw");

  // Helper-Funktion, um Hex-Farbe aus der Farbpalette zu bekommen oder den Wert selbst zurückzugeben
  const getHexFromColorValue = (colorValue: string): string => {
    const predefined = COLOR_PALETTE.find((c) => c.id === colorValue);
    if (predefined) {
      return predefined.hex;
    }
    // Prüfe, ob es ein valider Hex-Code ist, sonst Fallback
    return /^#[0-9A-F]{6}$/i.test(colorValue) ? colorValue : "#000000";
  };

  // Helper-Funktion, um Farbnamen aus der Farbpalette zu bekommen oder "Benutzerdefiniert"
  const getNameFromColorValue = (colorValue: string): string => {
    const predefined = COLOR_PALETTE.find((c) => c.id === colorValue);
    if (predefined) {
      return predefined.label;
    }
    if (/^#[0-9A-F]{6}$/i.test(colorValue)) {
      return "Benutzerdef."; // Oder den Hex-Code anzeigen: colorValue
    }
    return "Unbekannt";
  };

  // Aktualisiert die Einstellungen beim Öffnen und nach Änderungen
  useEffect(() => {
    if (editor && isVisible) {
      // Lese globale Defaults für den Fall, dass nichts/falsches ausgewählt ist
      const styles = editor.getInstanceState().stylesForNextShape;
      const defaultColorId =
        (styles[DefaultColorStyle.id] as string) || "black";
      const defaultSizeId = (styles[DefaultSizeStyle.id] as string) || "m";
      const defaultDashId = (styles[DefaultDashStyle.id] as string) || "draw";

      // Prüfe die aktuelle Auswahl
      const selectedShapes = editor.getSelectedShapes();

      if (selectedShapes.length === 1 && selectedShapes[0].type === "draw") {
        // Wenn genau eine Draw-Form ausgewählt ist, deren Styles nehmen
        const drawShape = selectedShapes[0] as TLDrawShape;
        const props = drawShape.props;

        // Farbe: Setze die ID, wenn es eine vordefinierte ist, sonst den Hex-Wert
        const selectedColorValue = props.color || defaultColorId;
        const isPredefined = COLOR_PALETTE.some(
          (c) => c.id === selectedColorValue
        );
        setCurrentColor(
          isPredefined
            ? selectedColorValue
            : getHexFromColorValue(selectedColorValue)
        );

        // Größe
        setCurrentSize(props.size || defaultSizeId);

        // Strichart: Bleibt an die globalen Defaults gekoppelt, da Draw-Shapes keine 'dash'-Prop haben
        setCurrentDash(defaultDashId);
      } else {
        // Wenn nichts oder mehrere/falsche Shapes ausgewählt sind, globale Defaults verwenden
        setCurrentColor(defaultColorId);
        setCurrentSize(defaultSizeId);
        setCurrentDash(defaultDashId);
      }
    }
    // Abhängigkeit von ausgewählten IDs hinzufügen, damit der Hook bei Auswahländerung läuft
  }, [editor, isVisible, editor?.getSelectedShapeIds().join(",")]); // Entferne 'currentColor' hier

  // Funktionen zum Ändern der Styles
  const handleColorChange = (colorValue: string) => {
    // Setze den State *immer*, egal ob ID oder Hex
    setCurrentColor(colorValue);

    const isPredefined = COLOR_PALETTE.some((c) => c.id === colorValue);
    const finalColorHex = getHexFromColorValue(colorValue);

    // 1. Aktualisiere ausgewählte Shapes IMMER mit dem finalen Hex-Wert
    const selectedShapes = editor.getSelectedShapes();
    if (selectedShapes.length > 0) {
      const updates = selectedShapes
        .filter((shape) => shape.type === "draw") // Nur Draw-Shapes aktualisieren
        .map((shape) => ({
          id: shape.id,
          type: "draw",
          props: { color: finalColorHex }, // Hier muss der Prop-Name korrekt sein für Draw
        }));
      if (updates.length > 0) {
        editor.updateShapes(updates);
      }
    }

    // 2. Setze den Stil für nächste Shapes NUR, wenn es eine vordefinierte ID ist
    if (isPredefined) {
      editor.setStyleForNextShapes(DefaultColorStyle, colorValue);
    } else {
      // Optional: Was soll passieren, wenn eine Custom Hex Farbe gewählt wird?
      // Man könnte den Default auf Schwarz zurücksetzen oder den letzten Default behalten.
      // Aktuell wird der letzte Default behalten.
    }
  };

  const handleSizeChange = (sizeId: string) => {
    setCurrentSize(sizeId);
    editor.setStyleForNextShapes(DefaultSizeStyle, sizeId);

    const selectedShapes = editor.getSelectedShapes();
    if (selectedShapes.length > 0) {
      const updates = selectedShapes
        .filter((shape) => shape.type === "draw") // Nur Draw-Shapes aktualisieren
        .map((shape) => ({
          id: shape.id,
          type: "draw",
          props: { size: sizeId }, // Hier muss der Prop-Name korrekt sein für Draw
        }));
      if (updates.length > 0) {
        editor.updateShapes(updates);
      }
    }
  };

  const handleDashChange = (dashId: string) => {
    setCurrentDash(dashId);
    editor.setStyleForNextShapes(DefaultDashStyle, dashId);
    // Keine Aktualisierung ausgewählter Shapes, da 'dash' keine Draw-Prop ist
  };

  if (!isVisible) return null;

  return (
    <div
      className="bg-white p-4 flex flex-col gap-5 w-full max-w-xs pb-28"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Titel */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base font-medium text-gray-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF6B00]"></span>
          Stift Einstellungen
        </h3>
        {/* Auswahl Button (optional, falls benötigt) */}
        {/* <button className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">Auswahl</button> */}
      </div>

      {/* Container für die Einstellungen */}
      <div className="space-y-5 bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-inner">
        {/* Aktuelle Farbauswahl */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Aktuelle Farbe
            </span>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-sm border border-gray-300 shadow-inner"
                style={{ backgroundColor: getHexFromColorValue(currentColor) }}
              ></div>
              <span className="text-xs text-gray-500">
                {getNameFromColorValue(currentColor)}
              </span>
            </div>
          </div>

          {/* Farbpalette mit neuer Komponente und Picker */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Farbe</div>
            <ButtonColorPalette
              options={COLOR_PALETTE}
              selectedValue={currentColor}
              onValueChange={handleColorChange}
              columns={5}
              showColorPicker={true}
              buttonClassName="w-auto h-auto"
            />
          </div>
        </div>

        {/* Größenauswahl mit Slider Komponente */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Dicke</div>
          <ButtonSliderHorizontal
            options={SIZES}
            selectedValue={currentSize}
            onValueChange={handleSizeChange}
          />
        </div>

        {/* Strichstil mit vertikalem Slider */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">
            Strichart
          </div>
          <ButtonSliderVertical
            options={DASH_STYLES}
            selectedValue={currentDash}
            onValueChange={handleDashChange}
            columns={2}
            className="bg-gray-100 border border-gray-200"
            buttonClassName="py-2 text-left"
            highlightClassName="bg-orange-100 border-orange-300"
            iconPosition="left"
          />
        </div>
      </div>

      {/* Vorschau */}
      <div>
        <h3 className="text-base font-medium text-gray-800 flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#FF6B00]"></span>
          Vorschau
        </h3>
        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-inner min-h-[60px] flex flex-col justify-center items-center">
          <div className="w-full h-1 bg-gray-100 relative my-2">
            <div
              className={`absolute top-1/2 left-0 right-0 transform -translate-y-1/2 h-0.5 ${
                currentDash === "dashed"
                  ? "border-dashed"
                  : currentDash === "dotted"
                  ? "border-dotted"
                  : ""
              }`}
              style={{
                // Verwende border für gestrichelt/gepunktet, sonst Hintergrundfarbe
                borderTopWidth:
                  currentDash === "draw"
                    ? 0
                    : `${SIZES.find((s) => s.id === currentSize)?.value ||
                        2}px`,
                borderTopStyle:
                  currentDash === "dashed"
                    ? "dashed"
                    : currentDash === "dotted"
                    ? "dotted"
                    : "solid",
                borderTopColor:
                  currentDash === "draw"
                    ? "transparent"
                    : getHexFromColorValue(currentColor),
                // Hintergrund für durchgezogen und Füller
                backgroundColor:
                  currentDash === "solid" || currentDash === "draw"
                    ? getHexFromColorValue(currentColor)
                    : "transparent",
                height:
                  currentDash === "solid" || currentDash === "draw"
                    ? `${SIZES.find((s) => s.id === currentSize)?.value || 2}px`
                    : 0,
              }}
            ></div>
          </div>
          {currentDash === "draw" && (
            <div className="mt-1 text-xs text-center text-gray-500">
              Freihand-Linien beim Zeichnen
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PencilSettingsPopup;
