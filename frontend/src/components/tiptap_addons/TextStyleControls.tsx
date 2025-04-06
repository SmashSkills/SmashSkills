import React, { useState, useRef, useEffect } from "react";
import { Editor } from "@tiptap/react";
import { Palette, Type } from "lucide-react";
import ToolbarButton from "./ToolbarButton";

interface TextStyleControlsProps {
  editor: Editor;
}

/**
 * Komponente für Textfarben und -größen
 *
 * Enthält Buttons für:
 * - Textfarben mit Farbpalette
 * - Textgrößen
 */
const TextStyleControls: React.FC<TextStyleControlsProps> = ({ editor }) => {
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showSizePalette, setShowSizePalette] = useState(false);

  const colorPaletteRef = useRef<HTMLDivElement>(null);
  const sizePaletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Funktion zum Schließen der Dropdowns bei Klick außerhalb
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showColorPalette &&
        colorPaletteRef.current &&
        !colorPaletteRef.current.contains(event.target as Node)
      ) {
        setShowColorPalette(false);
      }

      if (
        showSizePalette &&
        sizePaletteRef.current &&
        !sizePaletteRef.current.contains(event.target as Node)
      ) {
        setShowSizePalette(false);
      }
    };

    // Event-Listener hinzufügen
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup beim Unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColorPalette, showSizePalette]);

  if (!editor) return null;

  // Farboptionen (ca. 50 Farben)
  const colorOptions = [
    // Graustufen
    { name: "Schwarz", value: "#000000" },
    { name: "Grau 1", value: "#111111" },
    { name: "Grau 2", value: "#222222" },
    { name: "Grau 3", value: "#333333" },
    { name: "Grau 4", value: "#444444" },
    { name: "Grau 5", value: "#666666" },
    { name: "Grau 6", value: "#888888" },
    { name: "Grau 7", value: "#aaaaaa" },
    { name: "Grau 8", value: "#cccccc" },
    { name: "Grau 9", value: "#dddddd" },
    { name: "Grau 10", value: "#eeeeee" },
    { name: "Weiß", value: "#ffffff" },
    // Rottöne
    { name: "Dunkelrot", value: "#990000" },
    { name: "Rot", value: "#ff0000" },
    { name: "Hellrot", value: "#ff5555" },
    { name: "Pink", value: "#ff88cc" },
    { name: "Magenta", value: "#ff00ff" },
    // Orangetöne
    { name: "Dunkelorange", value: "#cc5500" },
    { name: "Orange", value: "#ff8800" },
    { name: "Helles Orange", value: "#ffaa33" },
    { name: "Gold", value: "#ffcc00" },
    // Gelbtöne
    { name: "Dunkelgelb", value: "#ccaa00" },
    { name: "Gelb", value: "#ffff00" },
    { name: "Hellgelb", value: "#ffff88" },
    // Grüntöne
    { name: "Dunkelgrün", value: "#006600" },
    { name: "Grün", value: "#00cc00" },
    { name: "Hellgrün", value: "#88ff88" },
    { name: "Limette", value: "#aaff00" },
    { name: "Oliv", value: "#808000" },
    // Türkis/Cyan-Töne
    { name: "Dunkeltürkis", value: "#008888" },
    { name: "Türkis", value: "#00cccc" },
    { name: "Cyan", value: "#00ffff" },
    { name: "Helltürkis", value: "#aaffff" },
    // Blautöne
    { name: "Marine", value: "#000080" },
    { name: "Dunkelblau", value: "#0000cc" },
    { name: "Blau", value: "#0000ff" },
    { name: "Mittelblau", value: "#4444ff" },
    { name: "Himmelblau", value: "#88ccff" },
    { name: "Hellblau", value: "#aaaaff" },
    // Violett/Lila-Töne
    { name: "Dunkellila", value: "#550088" },
    { name: "Lila", value: "#8800ff" },
    { name: "Helles Lila", value: "#cc88ff" },
    { name: "Flieder", value: "#aa55cc" },
    // Brauntöne
    { name: "Dunkelbraun", value: "#663300" },
    { name: "Braun", value: "#996633" },
    { name: "Hellbraun", value: "#cc9966" },
    { name: "Beige", value: "#f5f5dc" },
    { name: "Khaki", value: "#c3b091" },
    { name: "Tan", value: "#d2b48c" },
  ];

  // Größenoptionen (erweitert)
  const sizeOptions = [
    { name: "6px", value: "6px" },
    { name: "7px", value: "7px" },
    { name: "8px", value: "8px" },
    { name: "9px", value: "9px" },
    { name: "10px", value: "10px" },
    { name: "11px", value: "11px" },
    { name: "12px", value: "12px" },
    { name: "13px", value: "13px" },
    { name: "14px (Standard-Absatz)", value: "14px" }, // Annahme
    { name: "15px", value: "15px" },
    { name: "16px", value: "16px" },
    { name: "18px", value: "18px" },
    { name: "20px", value: "20px" },
    { name: "22px", value: "22px" },
    { name: "24px", value: "24px" },
    { name: "26px", value: "26px" },
    { name: "28px", value: "28px" },
    { name: "30px", value: "30px" },
    { name: "36px", value: "36px" },
    { name: "48px", value: "48px" },
    { name: "60px", value: "60px" },
    { name: "72px", value: "72px" },
    // Relative Größen
    { name: "Sehr sehr klein (0.5em)", value: "0.5em" },
    { name: "Sehr klein (0.75em)", value: "0.75em" },
    { name: "Klein (0.875em)", value: "0.875em" },
    { name: "Normal (1em)", value: "1em" },
    { name: "Groß (1.25em)", value: "1.25em" },
    { name: "Sehr groß (1.5em)", value: "1.5em" },
    { name: "Riesig (2em)", value: "2em" },
    { name: "Sehr riesig (2.5em)", value: "2.5em" },
  ];

  // Textfarbe setzen
  const setTextColor = (color: string) => {
    if (!editor) return;
    editor.chain().focus().setColor(color).run();
    setShowColorPalette(false);
  };

  // Textgröße setzen - Verwendung unserer benutzerdefinierten FontSize Extension
  const setTextSize = (size: string) => {
    if (!editor) return;

    // Verwende den setFontSize-Befehl aus unserer Extension
    editor.chain().focus().setFontSize(size).run();

    setShowSizePalette(false);
  };

  return (
    <div className="flex gap-1 mr-2 border-r pr-2 relative">
      {/* Textfarbe Button und Palette */}
      <div className="relative" ref={colorPaletteRef}>
        <ToolbarButton
          onClick={() => setShowColorPalette(!showColorPalette)}
          title="Textfarbe"
          isActive={showColorPalette}
        >
          <Palette size={18} />
        </ToolbarButton>

        {showColorPalette && (
          <div className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md p-2 z-10 w-64 flex flex-wrap gap-1 max-h-80 overflow-y-auto">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => setTextColor(color.value)}
                className="w-6 h-6 rounded-full border border-gray-300"
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Textgröße Button und Palette */}
      <div className="relative" ref={sizePaletteRef}>
        <ToolbarButton
          onClick={() => setShowSizePalette(!showSizePalette)}
          title="Textgröße"
          isActive={showSizePalette}
        >
          <Type size={18} />
        </ToolbarButton>

        {showSizePalette && (
          <div className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md p-2 z-10 w-64 max-h-80 overflow-y-auto">
            {sizeOptions.map((size) => (
              <button
                key={size.value}
                onClick={() => setTextSize(size.value)}
                className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded-md"
                style={{
                  fontSize:
                    size.value.includes("px") || size.value.includes("em")
                      ? size.value
                      : "inherit",
                }}
              >
                {size.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextStyleControls;
