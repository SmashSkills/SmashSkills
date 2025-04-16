import React, { useState, useEffect, useCallback } from "react";
import {
  Editor,
  DefaultColorStyle,
  DefaultSizeStyle,
  DefaultFillStyle,
  DefaultDashStyle,
} from "@tldraw/tldraw";
import { CustomGeoShapeType } from "../components/custom-shapes/CustomShapeUtils";
import ButtonSliderHorizontal from "../../../components/ui_elements/buttons/button_slider_horizontal";
import ButtonSliderVertical from "../../../components/ui_elements/buttons/button_slider_vertical";
import ButtonColorPalette from "../../../components/ui_elements/buttons/button_color_palette";

interface ShapeSettingsPopupProps {
  editor: Editor;
  isVisible: boolean;
}

// Standard-Geo-Formen (von tldraw unterstützt)
const SHAPE_TYPES = [
  {
    id: "rectangle",
    label: "Rechteck",
    value: "rectangle",
    tool: "geo",
    icon: <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>,
  },
  {
    id: "ellipse",
    label: "Ellipse",
    value: "ellipse",
    tool: "geo",
    icon: <circle cx="12" cy="12" r="10"></circle>,
  },
  {
    id: "triangle",
    label: "Dreieck",
    value: "triangle",
    tool: "geo",
    icon: <path d="M3 20h18L12 4z"></path>,
  },
  {
    id: "diamond",
    label: "Raute",
    value: "diamond",
    tool: "geo",
    icon: <path d="M12 2L2 12l10 10 10-10z"></path>,
  },
  {
    id: "line",
    label: "Linie",
    value: "line",
    tool: "line",
    icon: <path d="M5 19l14-14"></path>,
  },
  {
    id: "arrow",
    label: "Pfeil",
    value: "arrow",
    tool: "arrow",
    icon: <path d="M5 12h14M12 5l7 7-7 7"></path>,
  },
  // Benutzerdefinierte Shapes
  {
    id: "pentagon",
    label: "Fünfeck",
    value: "pentagon",
    tool: "custom-geo",
    icon: <path d="M12 2L3 10l3.5 9h11L21 10z"></path>,
  },
  {
    id: "hexagon",
    label: "Sechseck",
    value: "hexagon",
    tool: "custom-geo",
    icon: <path d="M12 2L4 8v8l8 6l8-6V8z"></path>,
  },
  {
    id: "star",
    label: "Stern",
    value: "star",
    tool: "custom-geo",
    icon: (
      <path d="M12 2l2.5 6.5H21l-5 4.5 2 7L12 16l-6 4 2-7-5-4.5h6.5z"></path>
    ),
  },
  {
    id: "heart",
    label: "Herz",
    value: "heart",
    tool: "custom-geo",
    icon: (
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
    ),
  },
  {
    id: "person",
    label: "Person",
    value: "person",
    tool: "custom-geo",
    icon: (
      <path d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
    ),
  },
  {
    id: "cloud",
    label: "Wolke",
    value: "cloud",
    tool: "custom-geo",
    icon: (
      <path d="M6.5 19A5.5 5.5 0 0 1 1 13.5a5.5 5.5 0 0 1 5.5-5.5c.31 0 .62.03.92.08A7.5 7.5 0 0 1 22 11.5c0 4.14-3.36 7.5-7.5 7.5h-8z"></path>
    ),
  },
];

// Farbpalette
const COLOR_PALETTE = [
  { id: "black", label: "Schwarz", value: "black" },
  { id: "grey", label: "Grau", value: "grey" },
  { id: "light-blue", label: "Hellblau", value: "light-blue" },
  { id: "blue", label: "Blau", value: "blue" },
  { id: "violet", label: "Lila", value: "violet" },
  { id: "light-violet", label: "Helles Lila", value: "light-violet" },
  { id: "red", label: "Rot", value: "red" },
  { id: "light-red", label: "Helles Rot", value: "light-red" },
  { id: "orange", label: "Orange", value: "orange" },
  { id: "yellow", label: "Gelb", value: "yellow" },
  { id: "green", label: "Grün", value: "green" },
  { id: "light-green", label: "Helles Grün", value: "light-green" },
  { id: "white", label: "Weiß", value: "white" },
];

// Größenkategorien für die gesamte Form
const FORM_SIZE_CATEGORIES = [
  { id: "small", label: "Klein", width: 80, height: 80 },
  { id: "medium", label: "Mittel", width: 120, height: 120 },
  { id: "large", label: "Groß", width: 160, height: 160 },
  { id: "xlarge", label: "Sehr groß", width: 200, height: 200 },
];

// Konturstärke - entspricht size in tldraw
const STROKE_WIDTHS = [
  { id: "s", label: "Dünn", value: "s" },
  { id: "m", label: "Mittel", value: "m" },
  { id: "l", label: "Dick", value: "l" },
  { id: "xl", label: "Sehr dick", value: "xl" },
];

// Füllstile
const FILL_STYLES = [
  { id: "none", label: "Keine Füllung", value: "none" },
  { id: "solid", label: "Halbtransparent", value: "solid" },
  { id: "semi", label: "Gefüllt", value: "semi" },
];

// Linienstile
const LINE_STYLES = [
  { id: "solid", label: "Durchgezogen", value: "solid" },
  { id: "dashed", label: "Gestrichelt", value: "dashed" },
  { id: "dotted", label: "Gepunktet", value: "dotted" },
];

// Ausrichtungsoptionen
const ALIGNMENT_OPTIONS = [
  { id: "start", label: "Links", value: "start" },
  { id: "middle", label: "Mitte", value: "middle" },
  { id: "end", label: "Rechts", value: "end" },
];

// Helfer-Funktion, um tldraw-Farbnamen in CSS-Farben umzuwandeln
const getTldrawColorValue = (colorName: string): string => {
  switch (colorName) {
    case "black":
      return "#1d1d1d";
    case "grey":
      return "#8f8f8f";
    case "light-violet":
      return "#c5a2ff";
    case "violet":
      return "#8b5cf6";
    case "blue":
      return "#3b82f6";
    case "light-blue":
      return "#a5d8ff";
    case "yellow":
      return "#f59e0b";
    case "orange":
      return "#f97316";
    case "green":
      return "#10b981";
    case "light-green":
      return "#6ee7b7";
    case "light-red":
      return "#fca5a5";
    case "red":
      return "#f43f5e";
    case "white":
      return "#ffffff";
    default:
      return "#1d1d1d"; // Standardfarbe als Fallback
  }
};

const ShapeSettingsPopup: React.FC<ShapeSettingsPopupProps> = ({
  editor,
  isVisible,
}) => {
  // Zustand für Form-Einstellungen
  const [selectedShapeType, setSelectedShapeType] = useState("rectangle");
  const [selectedColor, setSelectedColor] = useState("black");
  const [selectedSize, setSelectedSize] = useState("m"); // Linienstärke
  const [selectedFormSize, setSelectedFormSize] = useState("medium"); // Formgröße
  const [selectedStrokeWidth, setSelectedStrokeWidth] = useState("m");
  const [selectedFillStyle, setSelectedFillStyle] = useState("none");
  const [selectedLineStyle, setSelectedLineStyle] = useState("solid");
  const [selectedAlignment, setSelectedAlignment] = useState("middle");

  // Lade aktuelle Einstellungen aus dem Editor
  useEffect(() => {
    if (editor && isVisible) {
      // Aktuelle Formeinstellungen abrufen
      const styles = editor.getInstanceState().stylesForNextShape;
      const currentShapeType = styles["tldraw:geo"] || "rectangle";
      setSelectedShapeType(currentShapeType as string);

      // Farbe abrufen
      const currentColor = styles[DefaultColorStyle.id];
      if (currentColor) {
        setSelectedColor(currentColor as string);
      }

      // Größe abrufen
      const currentSize = styles[DefaultSizeStyle.id];
      if (currentSize) {
        setSelectedSize(currentSize as string);
      }

      // Füllstil abrufen
      const currentFill = styles[DefaultFillStyle.id];
      if (currentFill) {
        setSelectedFillStyle(currentFill as string);
      }

      // Linienstil abrufen
      const currentDash = styles[DefaultDashStyle.id];
      if (currentDash) {
        setSelectedLineStyle(currentDash as string);
      }
    }
  }, [editor, isVisible]);

  // Änderungshandler für Form-Typ
  const handleShapeTypeChange = useCallback(
    (shapeType: string) => {
      setSelectedShapeType(shapeType);

      // Finde den entsprechenden Shape-Typ im Array
      const selectedShape = SHAPE_TYPES.find((shape) => shape.id === shapeType);

      if (!selectedShape) return;

      // Finde die ausgewählte Formgröße
      const formSize =
        FORM_SIZE_CATEGORIES.find((size) => size.id === selectedFormSize) ||
        FORM_SIZE_CATEGORIES[1]; // Default auf medium

      // Setze Tool basierend auf dem Shape-Typ
      if (selectedShape.tool === "line" || selectedShape.tool === "arrow") {
        // Linien und Pfeile werden mit der Maus platziert
        editor.setCurrentTool(selectedShape.tool);
      } else if (selectedShape.tool === "geo") {
        // Standard-Geo-Formen werden direkt in der Mitte platziert
        const center = editor.getViewportScreenCenter();

        editor.createShapes([
          {
            type: "geo",
            x: center.x - formSize.width / 2,
            y: center.y - formSize.height / 2,
            props: {
              geo: selectedShape.value,
              w: formSize.width,
              h: formSize.height,
              color: selectedColor,
              size: selectedSize,
              dash: selectedLineStyle,
              fill: selectedFillStyle,
            },
          },
        ]);

        // Nach der direkten Erstellung wechseln wir zum Auswahlwerkzeug zurück
        editor.setCurrentTool("select");
      } else if (selectedShape.tool === "custom-geo") {
        // Benutzerdefinierte Geo-Formen werden direkt in der Mitte platziert
        const center = editor.getViewportScreenCenter();

        editor.createShapes([
          {
            type: "custom-geo",
            x: center.x - formSize.width / 2,
            y: center.y - formSize.height / 2,
            props: {
              geo: selectedShape.value as CustomGeoShapeType,
              w: formSize.width,
              h: formSize.height,
              color: selectedColor,
              size: selectedSize,
              fill: selectedFillStyle,
              dash: selectedLineStyle,
            },
          },
        ]);

        // Nach der direkten Erstellung wechseln wir zum Auswahlwerkzeug zurück
        editor.setCurrentTool("select");
      }

      // Pre-setze Stile für die nächste Form
      editor.setStyleForNextShapes(DefaultColorStyle, selectedColor);
      editor.setStyleForNextShapes(DefaultSizeStyle, selectedSize);
      editor.setStyleForNextShapes(DefaultFillStyle, selectedFillStyle);
      editor.setStyleForNextShapes(DefaultDashStyle, selectedLineStyle);
    },
    [
      editor,
      selectedColor,
      selectedSize,
      selectedFillStyle,
      selectedLineStyle,
      selectedFormSize,
    ]
  );

  // Änderungshandler für Farbe
  const handleColorChange = useCallback(
    (color: string) => {
      setSelectedColor(color);
      editor.setStyleForNextShapes(DefaultColorStyle, color);

      // Aktualisiere den Stil der ausgewählten Formen
      const selectedShapes = editor.getSelectedShapeIds();
      if (selectedShapes.length > 0) {
        editor.updateShapes(
          selectedShapes.map((id) => {
            return {
              id,
              type: "geo", // Type ist erforderlich
              props: {
                color,
              },
            };
          })
        );
      }
    },
    [editor]
  );

  // Änderungshandler für Formgröße (tatsächliche Größe w x h)
  const handleFormSizeChange = useCallback(
    (sizeId: string) => {
      setSelectedFormSize(sizeId);

      // Aktualisiere die Größe der ausgewählten Formen
      const selectedShapes = editor.getSelectedShapeIds();
      if (selectedShapes.length > 0) {
        const formSize =
          FORM_SIZE_CATEGORIES.find((size) => size.id === sizeId) ||
          FORM_SIZE_CATEGORIES[1]; // Default auf medium

        editor.updateShapes(
          selectedShapes.map((id) => {
            const shape = editor.getShape(id);
            if (!shape) return { id, type: "geo" }; // Stelle sicher, dass type eine Zeichenfolge ist

            // Nur für Formen, die w und h haben
            if (shape.type === "geo" || shape.type === "custom-geo") {
              return {
                id,
                type: shape.type,
                props: {
                  w: formSize.width,
                  h: formSize.height,
                },
              };
            }
            return { id, type: shape.type }; // Stelle sicher, dass type eine Zeichenfolge ist
          })
        );
      }
    },
    [editor]
  );

  // Änderungshandler für Konturstärke
  const handleStrokeWidthChange = useCallback(
    (width: string) => {
      setSelectedStrokeWidth(width);
      // Lege die Konturstärke für die nächste Form fest
      editor.setStyleForNextShapes(DefaultSizeStyle, width);

      // Aktualisiere den Stil der ausgewählten Formen
      const selectedShapes = editor.getSelectedShapeIds();
      if (selectedShapes.length > 0) {
        editor.updateShapes(
          selectedShapes.map((id) => {
            const shape = editor.getShape(id);
            if (!shape) return { id, type: "geo" }; // Stelle sicher, dass type eine Zeichenfolge ist

            return {
              id,
              type: shape.type,
              props: {
                size: width,
              },
            };
          })
        );
      }
    },
    [editor]
  );

  // Änderungshandler für Füllstil
  const handleFillStyleChange = useCallback(
    (style: string) => {
      setSelectedFillStyle(style);
      editor.setStyleForNextShapes(DefaultFillStyle, style);

      // Aktualisiere den Stil der ausgewählten Formen
      const selectedShapes = editor.getSelectedShapeIds();
      if (selectedShapes.length > 0) {
        editor.updateShapes(
          selectedShapes.map((id) => {
            return {
              id,
              type: "geo", // Type ist erforderlich
              props: {
                fill: style,
              },
            };
          })
        );
      }
    },
    [editor]
  );

  // Änderungshandler für Linienstil
  const handleLineStyleChange = useCallback(
    (style: string) => {
      setSelectedLineStyle(style);
      // Lege den Linienstil für die nächste Form fest
      editor.setStyleForNextShapes(DefaultDashStyle, style);

      // Aktualisiere den Stil der ausgewählten Formen
      const selectedShapes = editor.getSelectedShapeIds();
      if (selectedShapes.length > 0) {
        editor.updateShapes(
          selectedShapes.map((id) => {
            return {
              id,
              type: "geo", // Type ist erforderlich
              props: {
                dash: style,
              },
            };
          })
        );
      }
    },
    [editor]
  );

  // Änderungshandler für Ausrichtung
  const handleAlignmentChange = useCallback(
    (alignment: string) => {
      setSelectedAlignment(alignment);

      // Aktualisiere den Stil der ausgewählten Formen
      const selectedShapes = editor.getSelectedShapeIds();
      if (selectedShapes.length > 0) {
        editor.updateShapes(
          selectedShapes.map((id) => {
            return {
              id,
              type: "geo", // Type ist erforderlich
              props: {
                align: alignment,
              },
            };
          })
        );
      }
    },
    [editor]
  );

  // Wenn nicht sichtbar, nichts rendern
  if (!isVisible) return null;

  // Konvertiere COLOR_PALETTE für ButtonColorPalette-Komponente
  const colorPaletteOptions = COLOR_PALETTE.map((color) => ({
    id: color.id,
    label: color.label,
    value: color.value,
    hex: getTldrawColorValue(color.value),
  }));

  // Konvertiere STROKE_WIDTHS für ButtonSliderHorizontal-Komponente
  const strokeWidthOptions = STROKE_WIDTHS.map((width) => ({
    id: width.id,
    label: width.label,
    value: width.value,
  }));

  // Konvertiere FILL_STYLES für ButtonSliderVertical-Komponente
  const fillStyleOptions = FILL_STYLES.map((style) => ({
    id: style.id,
    label: style.label,
    value: style.value,
    icon: null,
  }));

  // Konvertiere LINE_STYLES für ButtonSliderVertical-Komponente
  const lineStyleOptions = LINE_STYLES.map((style) => ({
    id: style.id,
    label: style.label,
    value: style.value,
    icon: null,
  }));

  // Konvertiere FORM_SIZE_CATEGORIES für ButtonSliderHorizontal-Komponente
  const formSizeOptions = FORM_SIZE_CATEGORIES.map((size) => ({
    id: size.id,
    label: size.label,
    value: size.id,
  }));

  return (
    <div
      className="bg-white p-4 flex flex-col gap-5 w-full max-w-xs pb-28"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Titel */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base font-medium text-gray-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF6B00]"></span>
          Form Einstellungen
        </h3>
      </div>
      {/* Container für die Einstellungen */}
      <div className="space-y-5 bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-inner">
        {/* Form-Typen mit ButtonSliderVertical */}
        <div className="mb-3">
          <div className="text-xs text-gray-500 font-medium mb-2">
            Formtyp auswählen
          </div>

          {/* ButtonSliderVertical anstelle von Grid mit Buttons */}
          <ButtonSliderVertical
            options={SHAPE_TYPES.map((shape) => ({
              id: shape.id,
              label: shape.label,
              value: shape.value,
              svgContent: shape.icon,
            }))}
            selectedValue={selectedShapeType}
            onValueChange={handleShapeTypeChange}
            columns={3}
            rows={4}
            iconSize={20}
            showLabels={true}
            iconPosition="top"
            className="bg-gray-100 border border-gray-200"
            buttonClassName="p-2 flex flex-col hover:bg-gray-50"
            highlightClassName="bg-orange-100 border-orange-300"
          />
        </div>

        {/* Trennlinie */}
        <div className="border-t border-gray-200 pt-2"></div>

        {/* Aktuell ausgewählter Form-Typ mit Preview */}
        <div className="flex items-center gap-2 p-2 rounded bg-gray-50 border border-gray-200">
          <div className="w-8 h-8 flex items-center justify-center text-[#ff5722]">
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
              {SHAPE_TYPES.find((shape) => shape.id === selectedShapeType)
                ?.icon || SHAPE_TYPES[0].icon}
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-700">
              Aktuelle Form
            </span>
            <span className="text-xs text-gray-500">
              {SHAPE_TYPES.find((shape) => shape.id === selectedShapeType)
                ?.label || "Rechteck"}
            </span>
          </div>
        </div>

        {/* Farbpalette mit ButtonColorPalette */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Farbe</label>
          <ButtonColorPalette
            options={colorPaletteOptions}
            selectedValue={selectedColor}
            onValueChange={handleColorChange}
            columns={5}
            showColorPicker={true}
          />
        </div>

        {/* Formgröße mit ButtonSliderHorizontal */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Formgröße</label>
          <ButtonSliderHorizontal
            options={formSizeOptions}
            selectedValue={selectedFormSize}
            onValueChange={handleFormSizeChange}
          />
        </div>

        {/* Konturstärke mit ButtonSliderHorizontal */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">
            Konturstärke
          </label>
          <ButtonSliderHorizontal
            options={strokeWidthOptions}
            selectedValue={selectedStrokeWidth}
            onValueChange={handleStrokeWidthChange}
          />
        </div>

        {/* Füllstil mit ButtonSliderVertical */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Füllung</label>
          <ButtonSliderVertical
            options={fillStyleOptions}
            selectedValue={selectedFillStyle}
            onValueChange={handleFillStyleChange}
            columns={3}
          />
        </div>

        {/* Linienstil mit ButtonSliderVertical */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">
            Linienstil
          </label>
          <ButtonSliderVertical
            options={lineStyleOptions}
            selectedValue={selectedLineStyle}
            onValueChange={handleLineStyleChange}
            columns={3}
          />
        </div>
      </div>

      {/* Ausrichtung - nur anzeigen wenn Text ausgewählt ist */}
      {selectedShapeType === "text" && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">
            Ausrichtung
          </label>
          <div className="grid grid-cols-3 gap-1">
            {ALIGNMENT_OPTIONS.map((alignment) => (
              <button
                key={alignment.id}
                className={`py-1 px-2 text-center text-xs rounded border ${
                  selectedAlignment === alignment.value
                    ? "bg-orange-100 text-[#ff5722] border-orange-300"
                    : "bg-gray-50 border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() => handleAlignmentChange(alignment.value)}
              >
                {alignment.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShapeSettingsPopup;
