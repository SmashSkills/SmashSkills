import React, { useState, useRef, useEffect, useCallback } from "react";
// Passe den Importpfad an deine Projektstruktur an
// import { cn } from "@/lib/utils";
// Einfache cn-Implementierung als Fallback
const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

interface SliderOption {
  id: string;
  label: string;
  value?: string; // Optional für Kompatibilität mit anderen Komponenten
  icon?: React.ReactNode; // Optionales Icon (kann JSX/SVG sein)
  svgContent?: React.ReactNode; // Speziell für SVG-Inhalte
}

interface ButtonSliderVerticalProps {
  options: SliderOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  columns?: number; // Anzahl der Spalten
  rows?: number; // Optional: Anzahl der Zeilen (für spezielle Layouts)
  className?: string;
  buttonClassName?: string;
  highlightClassName?: string;
  iconSize?: number; // Größe für Icons
  showLabels?: boolean; // Option zum Ein-/Ausblenden von Labels
  iconPosition?: "top" | "left" | "center"; // Position des Icons im Button
}

const ButtonSliderVertical: React.FC<ButtonSliderVerticalProps> = ({
  options,
  selectedValue,
  onValueChange,
  columns = 1, // Standardmäßig eine Spalte
  rows,
  className = "",
  buttonClassName = "",
  highlightClassName = "",
  iconSize = 20,
  showLabels = true,
}) => {
  const [highlightStyle, setHighlightStyle] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  }>({ top: 0, left: 0, width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Stelle sicher, dass das Ref-Array die richtige Länge hat
  useEffect(() => {
    buttonRefs.current = buttonRefs.current.slice(0, options.length);
  }, [options]);

  // Berechne die Position und Größe des Highlights neu
  const updateHighlight = useCallback(() => {
    if (!containerRef.current || options.length === 0) return;

    const selectedIndex = options.findIndex(
      (option) => option.id === selectedValue
    );
    if (selectedIndex === -1) {
      setHighlightStyle({ top: 0, left: 0, width: 0, height: 0 }); // Verstecke Highlight
      return;
    }

    const selectedButton = buttonRefs.current[selectedIndex];
    if (!selectedButton) {
      // Ref noch nicht bereit, kurz warten und erneut versuchen
      setTimeout(updateHighlight, 50);
      return;
    }

    // getBoundingClientRect wird hier nicht benötigt, da offsetTop/Left relativ zum offsetParent (Grid-Container) sind.
    // const containerRect = containerRef.current.getBoundingClientRect();
    const buttonRect = selectedButton.getBoundingClientRect(); // Nur für width/height

    setHighlightStyle({
      top: selectedButton.offsetTop, // Verwende offsetTop/Left für Grid
      left: selectedButton.offsetLeft,
      width: buttonRect.width, // Breite und Höhe bleiben gleich
      height: buttonRect.height,
    });
  }, [options, selectedValue]); // Abhängigkeit von `columns` ist nicht direkt nötig, da `offsetTop/Left` dies berücksichtigt

  // Initiales Update und Update bei Wertänderung
  useEffect(() => {
    updateHighlight();
  }, [updateHighlight]);

  // Update bei Größenänderung
  useEffect(() => {
    window.addEventListener("resize", updateHighlight);
    return () => window.removeEventListener("resize", updateHighlight);
  }, [updateHighlight]);

  if (options.length === 0) {
    return null;
  }

  // Bestimme das Grid-Layout basierend auf den Eingaben
  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
  };

  // Wenn Zeilen angegeben wurden, setze auch die Zeilen im Grid
  if (rows) {
    gridStyle.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
  }



  return (
    <div
      ref={containerRef}
      className={cn(
        "relative grid w-full bg-gray-100 rounded-md p-1 shadow-inner gap-1",
        className
      )}
      style={gridStyle}
    >
      {/* Highlight-Element */}
      {highlightStyle.width > 0 && highlightStyle.height > 0 && (
        <div
          className={cn(
            "absolute bg-primary rounded shadow-sm transition-all duration-300 ease-in-out border border-gray-200",
            highlightClassName
          )}
          style={{
            top: `${highlightStyle.top}px`,
            left: `${highlightStyle.left}px`,
            width: `${highlightStyle.width}px`,
            height: `${highlightStyle.height}px`,
            zIndex: 1,
          }}
        />
      )}

      {/* Buttons */}
      {options.map((option, index) => (
        <button
          key={option.id}
          ref={(el) => {
            buttonRefs.current[index] = el;
          }}
          onClick={() => onValueChange(option.id)}
          className={cn(
            "relative z-10 w-full py-1.5 text-center text-sm transition-colors duration-300 ease-in-out rounded flex flex-col items-center justify-center cursor-pointer", // Flex-Col + Zentrierung
            selectedValue === option.id
              ? "text-white font-medium"
              : "text-gray-600 hover:text-gray-900 hover:font-bold transition-all duration-300",
            buttonClassName
          )}
          title={option.label}
        >
          {/* Icon oder SVG anzeigen */}
          {option.icon && (
            <div className="flex-shrink-0 flex items-center justify-center">
              {option.icon}
            </div>
          )}

          {/* SVG-Inhalt, falls vorhanden */}
          {option.svgContent && (
            <div className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={iconSize}
                height={iconSize}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {option.svgContent}
              </svg>
            </div>
          )}

          {/* Label anzeigen, wenn showLabels true ist */}
          {showLabels && (
            <span className="mt-1 text-center w-full">
              {" "}
              {/* Zentrierter Text */}
              {option.label}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default ButtonSliderVertical;
