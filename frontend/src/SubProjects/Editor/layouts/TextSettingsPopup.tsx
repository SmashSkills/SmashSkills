import React, { useState, useEffect, useCallback } from "react";
import {
  Editor,
  DefaultColorStyle,
  DefaultFontStyle,
  DefaultSizeStyle,
  DefaultTextAlignStyle,
  type TLTextShape,
} from "@tldraw/tldraw";
import ButtonSliderHorizontal from "../../../components/ui_elements/buttons/button_slider_horizontal";
import ButtonSliderVertical from "../../../components/ui_elements/buttons/button_slider_vertical";
import ButtonColorPalette from "../../../components/ui_elements/buttons/button_color_palette";

interface TextSettingsPopupProps {
  editor: Editor;
  isVisible: boolean;
}

// Farbpalette
const COLOR_PALETTE = [
  { id: "black", label: "Schwarz", value: "black" },
  { id: "gray", label: "Grau", value: "grey" },
  { id: "light-blue", label: "Hellblau", value: "light-blue" },
  { id: "blue", label: "Blau", value: "blue" },
  { id: "purple", label: "Lila", value: "violet" },
  { id: "red", label: "Rot", value: "red" },
  { id: "orange", label: "Orange", value: "orange" },
  { id: "yellow", label: "Gelb", value: "yellow" },
  { id: "green", label: "Grün", value: "green" },
];

// Schriftarten
const FONT_FAMILIES = [
  { id: "draw", label: "Handschrift", value: "draw" },
  { id: "sans", label: "Sans-Serif", value: "sans" },
  { id: "serif", label: "Serif", value: "serif" },
  { id: "mono", label: "Monospace", value: "mono" },
];

// Schriftstile
const FONT_STYLES = [
  { id: "normal", label: "Normal", value: "normal" },
  { id: "italic", label: "Kursiv", value: "italic" },
];

// Schriftgrößen
const FONT_SIZES = [
  { id: "s", label: "Klein", value: "s" },
  { id: "m", label: "Mittel", value: "m" },
  { id: "l", label: "Groß", value: "l" },
  { id: "xl", label: "Sehr groß", value: "xl" },
];

// Textausrichtungen
const TEXT_ALIGNMENTS = [
  { id: "start", label: "Links", value: "start" },
  { id: "middle", label: "Mitte", value: "middle" },
  { id: "end", label: "Rechts", value: "end" },
];

const TextSettingsPopup: React.FC<TextSettingsPopupProps> = ({
  editor,
  isVisible,
}) => {
  // Zustand für Text-Einstellungen
  const [selectedColor, setSelectedColor] = useState("black");
  const [selectedFontFamily, setSelectedFontFamily] = useState("sans");
  const [selectedFontStyle, setSelectedFontStyle] = useState("normal");
  const [selectedFontSize, setSelectedFontSize] = useState("m");
  const [selectedTextAlign, setSelectedTextAlign] = useState("middle");

  // Lade aktuelle Einstellungen aus dem Editor oder ausgewähltem Text-Shape
  useEffect(() => {
    if (editor && isVisible) {
      // Lese globale Defaults für den Fallback
      const styles = editor.getInstanceState().stylesForNextShape;
      const defaultColor = (styles[DefaultColorStyle.id] as string) || "black";
      const defaultFont = (styles[DefaultFontStyle.id] as string) || "sans";
      const defaultSize = (styles[DefaultSizeStyle.id] as string) || "m";
      const defaultAlign = (styles[DefaultTextAlignStyle.id] as string) || "middle";

      // Prüfe die aktuelle Auswahl
      const selectedShapes = editor.getSelectedShapes();

      if (selectedShapes.length === 1 && selectedShapes[0].type === 'text') {
        // Wenn genau ein Text-Shape ausgewählt ist, dessen Styles nehmen
        const textShape = selectedShapes[0] as TLTextShape;
        const props = textShape.props;

        setSelectedColor(props.color || defaultColor);
        setSelectedFontFamily(props.font || defaultFont);
        setSelectedFontSize(props.size || defaultSize);
        // Versuche erneut, align direkt aus props zu lesen


        // FontStyle (italic) bleibt vorerst unberücksichtigt
        setSelectedFontStyle("normal");

      } else {
        // Wenn nichts oder mehrere/falsche Shapes ausgewählt sind, globale Defaults verwenden
        setSelectedColor(defaultColor);
        setSelectedFontFamily(defaultFont);
        setSelectedFontSize(defaultSize);
        setSelectedTextAlign(defaultAlign);
        setSelectedFontStyle("normal");
      }
    }
    // Abhängigkeit von ausgewählten IDs hinzufügen
  }, [editor, isVisible, editor?.getSelectedShapeIds().join(',')]);

  // Änderungshandler für Farbe
  const handleColorChange = useCallback(
    (color: string) => {
      setSelectedColor(color);
      editor.setStyleForNextShapes(DefaultColorStyle, color);

      // Aktualisiere ausgewählte Text-Shapes
      const selectedShapes = editor.getSelectedShapeIds();
      if (selectedShapes.length > 0) {
        const updates = selectedShapes
          .map((id) => editor.getShape(id))
          .filter(shape => shape?.type === 'text') // Nur Text-Shapes
          .map(shape => ({
            id: shape!.id,
            type: 'text' as const,
            props: { color },
          }));
        if (updates.length > 0) {
          editor.updateShapes(updates);
        }
      }
    },
    [editor]
  );

  // Änderungshandler für Schriftart
  const handleFontFamilyChange = useCallback(
    (fontFamily: string) => {
      setSelectedFontFamily(fontFamily);
      editor.setStyleForNextShapes(DefaultFontStyle, fontFamily);

      // Aktualisiere ausgewählte Text-Shapes
      const selectedShapes = editor.getSelectedShapeIds();
      if (selectedShapes.length > 0) {
        const updates = selectedShapes
          .map((id) => editor.getShape(id))
          .filter(shape => shape?.type === 'text')
          .map(shape => ({
            id: shape!.id,
            type: 'text' as const,
            props: { font: fontFamily },
          }));
         if (updates.length > 0) {
           editor.updateShapes(updates);
         }
      }
    },
    [editor]
  );

  // Änderungshandler für Schriftgröße
  const handleFontSizeChange = useCallback(
    (fontSize: string) => {
      setSelectedFontSize(fontSize);
      editor.setStyleForNextShapes(DefaultSizeStyle, fontSize);

      // Aktualisiere ausgewählte Text-Shapes
      const selectedShapes = editor.getSelectedShapeIds();
      if (selectedShapes.length > 0) {
        const updates = selectedShapes
          .map((id) => editor.getShape(id))
          .filter(shape => shape?.type === 'text')
          .map(shape => ({
            id: shape!.id,
            type: 'text' as const,
            props: { size: fontSize },
          }));
         if (updates.length > 0) {
           editor.updateShapes(updates);
         }
      }
    },
    [editor]
  );

  // Änderungshandler für Textausrichtung
  const handleTextAlignChange = useCallback(
    (textAlign: string) => {
      setSelectedTextAlign(textAlign);
      editor.setStyleForNextShapes(DefaultTextAlignStyle, textAlign);

      // Aktualisiere ausgewählte Text-Shapes
      const selectedShapes = editor.getSelectedShapeIds();
      if (selectedShapes.length > 0) {
        const updates = selectedShapes
          .map((id) => editor.getShape(id))
          .filter(shape => shape?.type === 'text')
          .map(shape => ({
            id: shape!.id,
            type: 'text' as const,
            // Setze die 'align' Prop direkt
            props: { align: textAlign },
          }));
         if (updates.length > 0) {
           editor.updateShapes(updates);
         }
      }
    },
    [editor]
  );

  // Änderungshandler für Schriftstil (Kursiv) - auskommentiert
  const handleFontStyleChange = useCallback(
    (fontStyle: string) => {
      setSelectedFontStyle(fontStyle);
      // Logik zum Aktualisieren von 'italic' fehlt noch
    },
    [] // Keine Abhängigkeiten mehr, da Editor nicht verwendet wird
  );

  // Wenn nicht sichtbar, nichts rendern
  if (!isVisible) return null;

  // Für ButtonColorPalette
  const colorPaletteOptions = COLOR_PALETTE.map((color) => ({
    id: color.id,
    label: color.label,
    value: color.value,
    hex: color.value === "black" ? "#000000" : color.value,
  }));

  // Für ButtonSliderHorizontal (Schriftgrößen)
  const fontSizeOptions = FONT_SIZES.map((size) => ({
    id: size.id,
    label: size.label,
    value: size.value,
  }));

  // Für ButtonSliderVertical (Schriftarten)
  const fontFamilyOptions = FONT_FAMILIES.map((font) => ({
    id: font.id,
    label: font.label,
    value: font.value,
    icon: null,
  }));

  // Für ButtonSliderVertical (Schriftstile)
  const fontStyleOptions = FONT_STYLES.map((style) => ({
    id: style.id,
    label: style.label,
    value: style.value,
    icon: null,
  }));

  // Für ButtonSliderVertical (Textausrichtungen)
  const textAlignOptions = TEXT_ALIGNMENTS.map((align) => ({
    id: align.id,
    label: align.label,
    value: align.value,
    icon: null,
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
          Text Einstellungen
        </h3>
      </div>
      {/* Container für die Einstellungen */}
      <div className="space-y-5 bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-inner">
        {/* Farbpalette mit ButtonColorPalette */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Textfarbe</label>
          <ButtonColorPalette
            options={colorPaletteOptions}
            selectedValue={selectedColor}
            onValueChange={handleColorChange}
            columns={5}
            showColorPicker={true}
          />
        </div>

        {/* Schriftarten mit ButtonSliderVertical */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">
            Schriftart
          </label>
          <ButtonSliderVertical
            options={fontFamilyOptions}
            selectedValue={selectedFontFamily}
            onValueChange={handleFontFamilyChange}
            columns={2}
            iconPosition="left"
            className="bg-gray-100 border border-gray-200"
            buttonClassName="py-2 text-left"
            highlightClassName="bg-orange-100 border-orange-300"
          />
        </div>

        {/* Schriftstile mit ButtonSliderVertical */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">
            Schriftstil
          </label>
          <ButtonSliderVertical
            options={fontStyleOptions}
            selectedValue={selectedFontStyle}
            onValueChange={handleFontStyleChange}
            columns={2}
            iconPosition="left"
            className="bg-gray-100 border border-gray-200"
            buttonClassName="py-2 text-left"
            highlightClassName="bg-orange-100 border-orange-300"
          />
        </div>

        {/* Schriftgrößen mit ButtonSliderHorizontal */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">
            Schriftgröße
          </label>
          <ButtonSliderHorizontal
            options={fontSizeOptions}
            selectedValue={selectedFontSize}
            onValueChange={handleFontSizeChange}
          />
        </div>

        {/* Textausrichtung mit ButtonSliderVertical */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">
            Ausrichtung
          </label>
          <ButtonSliderVertical
            options={textAlignOptions.map((align) => ({
              ...align,
              svgContent:
                align.id === "start" ? (
                  <path d="M3 6h18M3 12h10M3 18h15" />
                ) : align.id === "middle" ? (
                  <path d="M3 6h18M7 12h10M5 18h14" />
                ) : (
                  <path d="M3 6h18M11 12h10M9 18h12" />
                ),
            }))}
            selectedValue={selectedTextAlign}
            onValueChange={handleTextAlignChange}
            columns={3}
            showLabels={true}
            iconPosition="top"
            className="bg-gray-100 border border-gray-200"
            buttonClassName="py-2"
            highlightClassName="bg-orange-100 border-orange-300"
          />
        </div>
      </div>
      {/* Textbeispiel-Vorschau */}
      <div className="flex flex-col gap-1 mt-2">
        <label className="text-xs text-gray-500 font-medium">Vorschau</label>
        <div
          className="rounded-md border border-gray-200 p-3 bg-gray-50 min-h-[50px] flex items-center justify-center"
          style={{
            color: selectedColor === "black" ? "#000000" : selectedColor,
            fontFamily:
              selectedFontFamily === "sans"
                ? "ui-sans-serif, system-ui, sans-serif"
                : selectedFontFamily === "serif"
                ? "ui-serif, Georgia, serif"
                : selectedFontFamily === "mono"
                ? "ui-monospace, monospace"
                : "Comic Sans MS, cursive", // "draw" Schriftart
            fontStyle: selectedFontStyle === "italic" ? "italic" : "normal",
            fontSize:
              selectedFontSize === "s"
                ? "14px"
                : selectedFontSize === "m"
                ? "16px"
                : selectedFontSize === "l"
                ? "20px"
                : "24px", // "xl"
            textAlign:
              selectedTextAlign === "start"
                ? "left"
                : selectedTextAlign === "middle"
                ? "center"
                : "right", // "end"
          }}
        >
          Beispieltext
        </div>
      </div>
    </div>
  );
};

export default TextSettingsPopup;
