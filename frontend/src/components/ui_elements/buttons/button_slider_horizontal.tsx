import React, { useState, useRef, useEffect, useCallback } from "react";
// Passe den Importpfad an deine Projektstruktur an
// import { cn } from "@/lib/utils";
// Einfache cn-Implementierung als Fallback
const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

interface SliderOption {
  id: string;
  label: string;
}

interface ButtonSliderHorizontalProps {
  options: SliderOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  className?: string;
  buttonClassName?: string;
  highlightClassName?: string;
}

const ButtonSliderHorizontal: React.FC<ButtonSliderHorizontalProps> = ({
  options,
  selectedValue,
  onValueChange,
  className = "",
  buttonClassName = "",
  highlightClassName = "",
}) => {
  const [highlightStyle, setHighlightStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  // Korrekte Initialisierung des Ref-Arrays
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Stelle sicher, dass das Array die richtige Länge hat, wenn sich Optionen ändern
  useEffect(() => {
    buttonRefs.current = buttonRefs.current.slice(0, options.length);
  }, [options]);

  // Berechne die Position und Breite des Highlights neu, wenn sich der Wert oder die Optionen ändern
  const updateHighlight = useCallback(() => {
    if (!containerRef.current) return;

    const selectedIndex = options.findIndex(
      (option) => option.id === selectedValue
    );
    // Wenn kein Element ausgewählt ist oder die Optionen leer sind, Highlight nicht anzeigen/aktualisieren
    if (selectedIndex === -1 || options.length === 0) {
      setHighlightStyle({ left: 0, width: 0 }); // Oder einen anderen Standard/Versteck-Zustand
      return;
    }

    const selectedButton = buttonRefs.current[selectedIndex];
    // Wenn der Button-Ref noch nicht bereit ist, warte kurz
    if (!selectedButton) {
      setTimeout(updateHighlight, 50); // Erneut versuchen nach kurzer Verzögerung
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const buttonRect = selectedButton.getBoundingClientRect();

    setHighlightStyle({
      left: buttonRect.left - containerRect.left, // Position relativ zum Container
      width: buttonRect.width,
    });
  }, [options, selectedValue]);

  useEffect(() => {
    // Führe updateHighlight initial aus und immer wenn sich Abhängigkeiten ändern
    updateHighlight();
  }, [updateHighlight]);

  // Update auch bei Größenänderungen des Fensters
  useEffect(() => {
    window.addEventListener("resize", updateHighlight);
    return () => window.removeEventListener("resize", updateHighlight);
  }, [updateHighlight]);

  // Rendere nichts, wenn keine Optionen vorhanden sind
  if (options.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex w-full  bg-gray-100 rounded-md p-1 shadow-inner gap-1", // Ähnlich wie Toolbar-Gruppen
        className
      )}
    >
      {/* Highlight-Element - nur rendern, wenn eine valide Position berechnet wurde */}
      {highlightStyle.width > 0 && (
        <div
          className={cn(
            "absolute top-1 bottom-1 h-auto bg-primary rounded shadow-sm transition-all duration-300 ease-in-out border border-gray-200", // Styling für das Highlight
            highlightClassName
          )}
          style={{
            left: `${highlightStyle.left}px`,
            width: `${highlightStyle.width}px`,
          }}
        />
      )}

      {/* Buttons */}
      {options.map((option, index) => (
        <button
          key={option.id}
          ref={(el) => {
            buttonRefs.current[index] = el;
          }} // Korrekte Zuweisung im Ref-Callback
          onClick={() => onValueChange(option.id)}
          className={cn(
            "relative z-10 flex-1 py-1.5 px-2 text-center text-sm transition-colors duration-300 ease-in-out rounded cursor-pointer", // Basis-Button-Styling
            selectedValue === option.id
              ? "text-white font-medium" // Ausgewählter Text (über dem Highlight)
              : "text-gray-600 hover:text-gray-900 hover:font-bold transition-all duration-300", // Nicht ausgewählter Text
            buttonClassName
          )}
          title={option.label} // Tooltip
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ButtonSliderHorizontal;
