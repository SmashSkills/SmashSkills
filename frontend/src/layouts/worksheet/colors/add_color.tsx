import React, { useState } from "react";

// Vordefinierte Farbpalette
export const COLOR_PALETTE = [
  "#000000", // Schwarz
  "#FFFFFF", // Weiß
  "#FF0000", // Rot
  "#00FF00", // Grün
  "#0000FF", // Blau
  "#FFFF00", // Gelb
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFA500", // Orange
  "#800080", // Lila
  "#008000", // Dunkelgrün
  "#800000", // Dunkelrot
  "#008080", // Teal
  "#C0C0C0", // Silber
  "#808080", // Grau
];

// Schnittstelle für Farbwähler-Optionen
export interface ColorPickerOptions {
  showAlpha?: boolean;
  showPresets?: boolean;
  onColorChange: (color: string) => void;
}

// ColorManager-Klasse für die Verwaltung von Farben
export class ColorManager {
  private static instance: ColorManager;
  private activeColor: string = "#000000";
  private activeFill: string = "#FFFFFF";
  private activeStroke: string = "#000000";
  private activeStrokeWidth: number = 2;

  private constructor() {}

  // Singleton-Pattern
  public static getInstance(): ColorManager {
    if (!ColorManager.instance) {
      ColorManager.instance = new ColorManager();
    }
    return ColorManager.instance;
  }

  // Aktive Farbe setzen/erhalten
  public setActiveColor(color: string): void {
    this.activeColor = color;
  }

  public getActiveColor(): string {
    return this.activeColor;
  }

  // Füllfarbe setzen/erhalten
  public setActiveFill(fill: string): void {
    this.activeFill = fill;
  }

  public getActiveFill(): string {
    return this.activeFill;
  }

  // Randfarbe setzen/erhalten
  public setActiveStroke(stroke: string): void {
    this.activeStroke = stroke;
  }

  public getActiveStroke(): string {
    return this.activeStroke;
  }

  // Randstärke setzen/erhalten
  public setActiveStrokeWidth(width: number): void {
    this.activeStrokeWidth = width;
  }

  public getActiveStrokeWidth(): number {
    return this.activeStrokeWidth;
  }
}

// Farbvorschau-Komponente
export const ColorPreview: React.FC<{
  color: string;
  onClick?: () => void;
  size?: string;
  className?: string;
}> = ({ color, onClick, size = "24px", className = "" }) => {
  return (
    <div
      className={`rounded-full cursor-pointer border border-gray-300 ${className}`}
      style={{
        backgroundColor: color,
        width: size,
        height: size,
      }}
      onClick={onClick}
    />
  );
};

// Farbauswahl-Komponente
export const ColorPicker: React.FC<ColorPickerOptions> = ({
  showPresets = true,
  onColorChange,
}) => {
  const [selectedColor, setSelectedColor] = useState("#000000");

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onColorChange(color);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3">
      {showPresets && (
        <div className="grid grid-cols-5 gap-2 mb-3">
          {COLOR_PALETTE.map((color) => (
            <ColorPreview
              key={color}
              color={color}
              onClick={() => handleColorSelect(color)}
              className={selectedColor === color ? "ring-2 ring-blue-500" : ""}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Ausgewählte Farbe:</span>
          <ColorPreview color={selectedColor} size="32px" />
        </div>

        <input
          type="color"
          value={selectedColor}
          onChange={(e) => handleColorSelect(e.target.value)}
          className="w-full h-8 cursor-pointer"
        />
      </div>
    </div>
  );
};

interface ColorUpdateOptions {
  fill?: string;
  stroke?: string;
}

// Funktion zum Anwenden einer Farbe auf ein ausgewähltes Element
export const applyColorToElement = (
  elementType: "fill" | "stroke" | "text",
  elementId: string,
  color: string,
  updateCallback: (id: string, updates: ColorUpdateOptions) => void
) => {
  const updates =
    elementType === "text"
      ? { fill: color }
      : elementType === "fill"
      ? { fill: color }
      : { stroke: color };

  updateCallback(elementId, updates);
};

export default {
  ColorManager,
  ColorPicker,
  ColorPreview,
  applyColorToElement,
  COLOR_PALETTE,
};
