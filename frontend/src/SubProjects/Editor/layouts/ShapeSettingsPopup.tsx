import React, { useState, useEffect, useCallback } from "react";
import { Editor, TLShapePartial } from "@tldraw/tldraw";
import {
  CustomGeoShapeType,
  CustomGeoShape,
} from "../components/custom-shapes/CustomGeoShapeUtil";
import ButtonSliderHorizontal from "../../../components/ui_elements/buttons/button_slider_horizontal";
import ButtonSliderVertical from "../../../components/ui_elements/buttons/button_slider_vertical";
import ButtonColorPalette from "../../../components/ui_elements/buttons/button_color_palette";

interface ShapeSettingsPopupProps {
  editor: Editor;
  isVisible: boolean;
}

// Füge die neuen Grundformen hinzu und passe Icons an
const SHAPE_TYPES = [
  {
    id: "rectangle",
    label: "Rechteck",
    value: "rectangle",
    tool: "custom-geo",
    icon: <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>,
  },
  {
    id: "ellipse",
    label: "Ellipse",
    value: "ellipse",
    tool: "custom-geo",
    icon: <ellipse cx="12" cy="12" rx="9" ry="9"></ellipse>, // <ellipse> statt <circle>
  },
  {
    id: "triangle",
    label: "Dreieck",
    value: "triangle",
    tool: "custom-geo",
    icon: <path d="M12 2L22 20H2z"></path>, // Angepasstes Dreieck
  },
  {
    id: "diamond",
    label: "Raute",
    value: "diamond",
    tool: "custom-geo",
    icon: <path d="M12 2L22 12L12 22L2 12Z"></path>, // Angepasste Raute
  },
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
  { id: "xlarge", label: "Riesig", width: 200, height: 200 },
];

// Konturstärke - entspricht size in tldraw
const STROKE_WIDTHS = [
  { id: "s", label: "Dünn", value: "s" },
  { id: "m", label: "Mittel", value: "m" },
  { id: "l", label: "Stark", value: "l" },
  { id: "xl", label: "Dick", value: "xl" },
];

// Füllstile
const FILL_STYLES = [
  { id: "none", label: "Keine", value: "none" },
  { id: "solid", label: "Halbtransparent", value: "solid" },
  { id: "semi", label: "Gefüllt", value: "semi" },
];

// Linienstile
const LINE_STYLES = [
  { id: "solid", label: "Durchgezogen", value: "solid" },
  { id: "dashed", label: "Gestrichelt", value: "dashed" },
  { id: "dotted", label: "Gepunktet", value: "dotted" },
];

// Helfer-Funktion, um tldraw-Farbnamen in CSS-Farben umzuwandeln
const getTldrawColorValue = (colorName: string): string => {
  // Prüfe zuerst auf Hex
  if (/^#[0-9A-F]{6}$/i.test(colorName)) {
    return colorName;
  }
  // Fallback auf tldraw Namen
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
      return "#1d1d1d";
  }
};

const ShapeSettingsPopup: React.FC<ShapeSettingsPopupProps> = ({
  editor,
  isVisible,
}) => {
  // Standard auf 'rectangle' setzen
  const [selectedShapeType, setSelectedShapeType] = useState(SHAPE_TYPES[0].id);
  const [selectedColor, setSelectedColor] = useState("#000000"); // Standard auf Hex Schwarz
  const [selectedSize, setSelectedSize] = useState("m");
  const [selectedFormSize, setSelectedFormSize] = useState("medium");
  const [selectedStrokeWidth, setSelectedStrokeWidth] = useState("m");
  const [selectedFillStyle, setSelectedFillStyle] = useState("none");
  const [selectedLineStyle, setSelectedLineStyle] = useState("solid");

  // Lade aktuelle Einstellungen aus dem Editor oder ausgewählten Shapes
  useEffect(() => {
    if (editor && isVisible) {
      const selectedShapes = editor.getSelectedShapes();
      if (
        selectedShapes.length === 1 &&
        selectedShapes[0].type === "custom-geo"
      ) {
        const props = selectedShapes[0].props as CustomGeoShape["props"];
        setSelectedShapeType(props.geo);
        setSelectedColor(props.color);
        setSelectedSize(props.size);
        setSelectedStrokeWidth(props.size);
        setSelectedFillStyle(props.fill);
        setSelectedLineStyle(props.dash);
        const matchedSize = FORM_SIZE_CATEGORIES.find(
          (cat) => cat.width === props.w && cat.height === props.h
        );
        setSelectedFormSize(matchedSize ? matchedSize.id : "medium");
      }
    }
  }, [editor, isVisible, editor?.getSelectedShapeIds().join(",")]);

  // Änderungshandler für Form-Typ
  const handleShapeTypeChange = useCallback(
    (shapeType: string) => {
      setSelectedShapeType(shapeType);

      const selectedShape = SHAPE_TYPES.find((shape) => shape.id === shapeType);
      if (!selectedShape) return;

      const formSize =
        FORM_SIZE_CATEGORIES.find((size) => size.id === selectedFormSize) ||
        FORM_SIZE_CATEGORIES[1];

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

      editor.setCurrentTool("select");
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

      const selectedShapes = editor.getSelectedShapeIds();
      if (selectedShapes.length > 0) {
        const updates = selectedShapes
          .map((id): TLShapePartial<CustomGeoShape> | null => {
            const shape = editor.getShape(id);
            if (shape?.type === "custom-geo") {
              return {
                id,
                type: "custom-geo",
                props: { color },
              };
            }
            return null;
          })
          .filter(
            (update): update is TLShapePartial<CustomGeoShape> =>
              update !== null
          );

        if (updates.length > 0) {
          editor.updateShapes(updates);
        }
      }
    },
    [editor]
  );

  // Änderungshandler für Formgröße (tatsächliche Größe w x h)
  const handleFormSizeChange = useCallback(
    (sizeId: string) => {
      setSelectedFormSize(sizeId);

      const selectedShapes = editor.getSelectedShapeIds();
      if (selectedShapes.length > 0) {
        const formSize =
          FORM_SIZE_CATEGORIES.find((size) => size.id === sizeId) ||
          FORM_SIZE_CATEGORIES[1];

        const updates = selectedShapes
          .map((id): TLShapePartial<CustomGeoShape> | null => {
            const shape = editor.getShape(id);
            if (shape?.type === "custom-geo") {
              return {
                id,
                type: "custom-geo",
                props: {
                  w: formSize.width,
                  h: formSize.height,
                },
              };
            }
            return null;
          })
          .filter(
            (update): update is TLShapePartial<CustomGeoShape> =>
              update !== null
          );

        if (updates.length > 0) {
          editor.updateShapes(updates);
        }
      }
    },
    [editor]
  );

  // Änderungshandler für Konturstärke
  const handleStrokeWidthChange = useCallback(
    (width: string) => {
      setSelectedStrokeWidth(width);
      setSelectedSize(width);

      const selectedShapes = editor.getSelectedShapeIds();
      if (selectedShapes.length > 0) {
        const updates = selectedShapes
          .map((id): TLShapePartial<CustomGeoShape> | null => {
            const shape = editor.getShape(id);
            if (shape?.type === "custom-geo") {
              return {
                id,
                type: "custom-geo",
                props: { size: width },
              };
            }
            return null;
          })
          .filter(
            (update): update is TLShapePartial<CustomGeoShape> =>
              update !== null
          );
        if (updates.length > 0) {
          editor.updateShapes(updates);
        }
      }
    },
    [editor]
  );

  // Änderungshandler für Füllstil
  const handleFillStyleChange = useCallback(
    (style: string) => {
      setSelectedFillStyle(style);

      const selectedShapes = editor.getSelectedShapeIds();
      if (selectedShapes.length > 0) {
        const updates = selectedShapes
          .map((id): TLShapePartial<CustomGeoShape> | null => {
            const shape = editor.getShape(id);
            if (shape?.type === "custom-geo") {
              return {
                id,
                type: "custom-geo",
                props: { fill: style },
              };
            }
            return null;
          })
          .filter(
            (update): update is TLShapePartial<CustomGeoShape> =>
              update !== null
          );

        if (updates.length > 0) {
          editor.updateShapes(updates);
        }
      }
    },
    [editor]
  );

  // Änderungshandler für Linienstil
  const handleLineStyleChange = useCallback(
    (style: string) => {
      setSelectedLineStyle(style);

      const selectedShapes = editor.getSelectedShapeIds();
      if (selectedShapes.length > 0) {
        const updates = selectedShapes
          .map((id): TLShapePartial<CustomGeoShape> | null => {
            const shape = editor.getShape(id);
            if (shape?.type === "custom-geo") {
              return {
                id,
                type: "custom-geo",
                props: { dash: style },
              };
            }
            return null;
          })
          .filter(
            (update): update is TLShapePartial<CustomGeoShape> =>
              update !== null
          );

        if (updates.length > 0) {
          editor.updateShapes(updates);
        }
      }
    },
    [editor]
  );

  if (!isVisible) return null;

  const colorPaletteOptions = COLOR_PALETTE.map((color) => ({
    id: color.id,
    label: color.label,
    value: color.value,
    hex: getTldrawColorValue(color.value),
  }));

  const strokeWidthOptions = STROKE_WIDTHS.map((width) => ({
    id: width.id,
    label: width.label,
    value: width.value,
  }));

  const fillStyleOptions = FILL_STYLES.map((style) => ({
    id: style.id,
    label: style.label,
    value: style.value,
    icon: null,
  }));

  const lineStyleOptions = LINE_STYLES.map((style) => ({
    id: style.id,
    label: style.label,
    value: style.value,
    icon: null,
  }));

  const formSizeOptions = FORM_SIZE_CATEGORIES.map((size) => ({
    id: size.id,
    label: size.label,
    value: size.id,
  }));

  return (
    <div
      className="bg-white p-4 flex flex-col gap-5 w-full pb-28"
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
            rows={Math.ceil(SHAPE_TYPES.length / 3)}
            iconSize={20}
            showLabels={true}
            iconPosition="top"
            className="bg-gray-100 border border-gray-200"
            buttonClassName="flex flex-col"
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
              {
                SHAPE_TYPES.find((shape) => shape.id === selectedShapeType)
                  ?.icon
              }
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-700">
              Aktuelle Form
            </span>
            <span className="text-xs text-gray-500">
              {
                SHAPE_TYPES.find((shape) => shape.id === selectedShapeType)
                  ?.label
              }
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

        {/* Füllstil mit ButtonSliderHorizontal */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Füllung</label>
          <ButtonSliderHorizontal
            options={fillStyleOptions}
            selectedValue={selectedFillStyle}
            onValueChange={handleFillStyleChange}
            className="bg-gray-100 border border-gray-200"
            buttonClassName="flex flex-col"
            highlightClassName="bg-orange-100 border-orange-300"
          />
        </div>

        {/* Linienstil mit ButtonSliderHorizontal */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">
            Linienstil
          </label>
          <ButtonSliderHorizontal
            options={lineStyleOptions}
            selectedValue={selectedLineStyle}
            onValueChange={handleLineStyleChange}
            className="bg-gray-100 border border-gray-200"
            buttonClassName="flex flex-col"
            highlightClassName="bg-orange-100 border-orange-300"
          />
        </div>
      </div>
    </div>
  );
};

export default ShapeSettingsPopup;
