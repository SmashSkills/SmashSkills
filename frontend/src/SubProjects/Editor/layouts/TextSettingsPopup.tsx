import React, { useState, useEffect, useCallback } from "react";
import {
  Editor,
  DefaultColorStyle,
  DefaultFontStyle,
  DefaultSizeStyle,
  DefaultTextAlignStyle,
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

  // Lade aktuelle Einstellungen aus dem Editor
  useEffect(() => {
    if (editor && isVisible) {
      // Farbe abrufen
      const currentColor = editor.getStyleForNextShape(DefaultColorStyle);
      if (currentColor) {
        setSelectedColor(currentColor as string);
      }

      // Schriftart abrufen - Wir verwenden DefaultFontStyle für die Schriftfamilie auch
      const currentFontFamily = editor.getStyleForNextShape(DefaultFontStyle);
      if (currentFontFamily) {
        setSelectedFontFamily(currentFontFamily as string);
      }

      // Schriftgröße abrufen
      const currentFontSize = editor.getStyleForNextShape(DefaultSizeStyle);
      if (currentFontSize) {
        setSelectedFontSize(currentFontSize as string);
      }

      // Textausrichtung abrufen
      const currentTextAlign = editor.getStyleForNextShape(
        DefaultTextAlignStyle
      );
      if (currentTextAlign) {
        setSelectedTextAlign(currentTextAlign as string);
      }

      // Funktion zur Aktualisierung der Werte bei Änderungen
      const intervalId = setInterval(() => {
        const colorStyle = editor.getStyleForNextShape(DefaultColorStyle);
        if (colorStyle) setSelectedColor(colorStyle as string);

        const fontStyle = editor.getStyleForNextShape(DefaultFontStyle);
        if (fontStyle) setSelectedFontFamily(fontStyle as string);

        const sizeStyle = editor.getStyleForNextShape(DefaultSizeStyle);
        if (sizeStyle) setSelectedFontSize(sizeStyle as string);

        const alignStyle = editor.getStyleForNextShape(DefaultTextAlignStyle);
        if (alignStyle) setSelectedTextAlign(alignStyle as string);
      }, 100);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [editor, isVisible]);

  // Änderungshandler für Farbe
  const handleColorChange = useCallback(
    (color: string) => {
      setSelectedColor(color);
      editor.setStyleForNextShapes(DefaultColorStyle, color);

      // Aktualisiere den Stil der ausgewählten Texte
      const selectedShapes = editor.getSelectedShapeIds();
      if (selectedShapes.length > 0) {
        editor.updateShapes(
          selectedShapes.map((id) => {
            return {
              id,
              type: "text",
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

  // Änderungshandler für Schriftart
  const handleFontFamilyChange = useCallback(
    (fontFamily: string) => {
      setSelectedFontFamily(fontFamily);
      editor.setStyleForNextShapes(DefaultFontStyle, fontFamily);

      // Aktualisiere den Stil der ausgewählten Texte
      const selectedShapes = editor.getSelectedShapeIds();
      if (selectedShapes.length > 0) {
        editor.updateShapes(
          selectedShapes.map((id) => {
            return {
              id,
              type: "text",
              props: {
                font: fontFamily,
              },
            };
          })
        );
      }
    },
    [editor]
  );

  // Änderungshandler für Schriftstil
  const handleFontStyleChange = useCallback(
    (fontStyle: string) => {
      setSelectedFontStyle(fontStyle);
      // Es gibt keinen direkten Style für Kursiv, wir setzen es über props

      // Aktualisiere den Stil der ausgewählten Texte
      const selectedShapes = editor.getSelectedShapeIds();
      if (selectedShapes.length > 0) {
        editor.updateShapes(
          selectedShapes.map((id) => {
            return {
              id,
              type: "text",
              props: {
                italic: fontStyle === "italic",
              },
            };
          })
        );
      }
    },
    [editor]
  );

  // Änderungshandler für Schriftgröße
  const handleFontSizeChange = useCallback(
    (fontSize: string) => {
      setSelectedFontSize(fontSize);
      editor.setStyleForNextShapes(DefaultSizeStyle, fontSize);

      // Aktualisiere den Stil der ausgewählten Texte
      const selectedShapes = editor.getSelectedShapeIds();
      if (selectedShapes.length > 0) {
        editor.updateShapes(
          selectedShapes.map((id) => {
            return {
              id,
              type: "text",
              props: {
                size: fontSize,
              },
            };
          })
        );
      }
    },
    [editor]
  );

  // Änderungshandler für Textausrichtung
  const handleTextAlignChange = useCallback(
    (textAlign: string) => {
      setSelectedTextAlign(textAlign);
      editor.setStyleForNextShapes(DefaultTextAlignStyle, textAlign);

      // Aktualisiere den Stil der ausgewählten Texte
      const selectedShapes = editor.getSelectedShapeIds();
      if (selectedShapes.length > 0) {
        editor.updateShapes(
          selectedShapes.map((id) => {
            return {
              id,
              type: "text",
              props: {
                align: textAlign,
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
