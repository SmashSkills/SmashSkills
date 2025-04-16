import React, { useRef } from "react";
// Passe den Importpfad an deine Projektstruktur an
// import { cn } from "@/lib/utils";
// Einfache cn-Implementierung als Fallback
const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

interface ColorOption {
  id: string;
  label: string;
  hex: string;
}

interface ButtonColorPaletteProps {
  options: ColorOption[];
  selectedValue: string; // Kann ID oder Hex-Wert sein
  onValueChange: (value: string) => void; // Gibt ID oder Hex-Wert zurück
  columns?: number;
  showColorPicker?: boolean; // Neue Prop
  className?: string;
  buttonClassName?: string;
  selectedClassName?: string;
  colorPickerIcon?: React.ReactNode; // Optional: Icon für den Picker
}

// Standard-Icon für den Farbwähler
const DefaultColorPickerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors"
    aria-hidden="true"
  >
    <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 1.5a8.25 8.25 0 100 16.5 8.25 8.25 0 000-16.5z" />
    <path
      fillRule="evenodd"
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75c.635 0 1.26-.065 1.86-.189a.75.75 0 01.639.836 9.72 9.72 0 01-1.87 5.676c.246.03.496.049.752.066 5.385 0 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0V6z"
      clipRule="evenodd"
    />
  </svg>
);

const ButtonColorPalette: React.FC<ButtonColorPaletteProps> = ({
  options,
  selectedValue,
  onValueChange,
  columns = 5,
  showColorPicker = false,
  className = "",
  buttonClassName = "",
  selectedClassName = "ring-2 ring-offset-1 ring-[#FF6B00] shadow-md",
  colorPickerIcon = <DefaultColorPickerIcon />,
}) => {
  const colorInputRef = useRef<HTMLInputElement>(null);

  if (options.length === 0 && !showColorPicker) {
    return null;
  }

  // Prüft, ob der aktuelle Wert eine vordefinierte Option ist
  const isPredefinedColor = options.some(
    (option) => option.id === selectedValue
  );
  // Prüft, ob der aktuelle Wert ein Hex-Code ist (vom Picker)
  const isCustomColor =
    !isPredefinedColor && /^#[0-9A-F]{6}$/i.test(selectedValue);

  const handleColorPickerClick = () => {
    colorInputRef.current?.click();
  };

  const handleColorInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onValueChange(event.target.value); // Gibt den Hex-Wert zurück
  };

  return (
    <div
      className={cn("grid w-full gap-2", className)}
      style={
        {
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        } as React.CSSProperties
      }
    >
      {/* Vordefinierte Farben */}
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onValueChange(option.id)} // Gibt die ID zurück
          className={cn(
            "aspect-square w-full rounded-sm border border-gray-200 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-1 hover:cursor-pointer",
            selectedValue === option.id
              ? selectedClassName
              : "shadow-sm hover:border-gray-300",
            buttonClassName
          )}
          style={{ backgroundColor: option.hex }}
          title={option.label}
        />
      ))}

      {/* Optionaler Farbwähler */}
      {showColorPicker && (
        <div className="relative aspect-square w-full group">
          <button
            type="button"
            onClick={handleColorPickerClick}
            className={cn(
              "w-full h-full rounded-sm border border-gray-200 flex items-center justify-center transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-1 hover:cursor-pointer",
              isCustomColor
                ? selectedClassName // Highlight, wenn Custom-Farbe aktiv ist
                : "bg-gray-100 shadow-sm hover:border-gray-300", // Standard-Aussehen
              buttonClassName
            )}
            title="Benutzerdefinierte Farbe wählen"
            // Zeige die benutzerdefinierte Farbe als Hintergrund, wenn sie aktiv ist
            style={isCustomColor ? { backgroundColor: selectedValue } : {}}
          >
            {/* Zeige das Icon nur, wenn *keine* Custom-Farbe aktiv ist */}
            {!isCustomColor && colorPickerIcon}
          </button>
          <input
            ref={colorInputRef}
            type="color"
            // Setze den Wert des Pickers, falls eine Custom-Farbe aktiv ist
            value={isCustomColor ? selectedValue : "#000000"}
            onChange={handleColorInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" // Verstecktes Input
            aria-label="Farbwähler öffnen"
          />
        </div>
      )}
    </div>
  );
};

export default ButtonColorPalette;
