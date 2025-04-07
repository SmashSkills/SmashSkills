import React from "react";
// Importiere den Typ aus worksheet.tsx (oder einem gemeinsamen Ort)
// Annahme: Der Typ wird in eine eigene Datei ausgelagert oder hier neu definiert
// Fürs Erste definieren wir ihn hier neu, um Abhängigkeiten zu vermeiden:
interface ShapeDragData {
  type: "shape";
  shapeType: string;
}

interface ShapeOverlayProps {
  data: ShapeDragData | null; // Typ verwenden
}

const ShapeOverlay: React.FC<ShapeOverlayProps> = ({ data }) => {
  if (!data || data.type !== "shape") {
    return null; // Nichts rendern, wenn keine oder falsche Daten
  }

  // Style für das Overlay - sollte dem Original ähneln, aber mit festen Dimensionen
  // und ohne Interaktionen
  const style: React.CSSProperties = {
    border: "1px solid #ccc",
    backgroundColor: "white",
    padding: "4px",
    borderRadius: "4px",
    height: "56px", // Feste Höhe (etwas anpassen?)
    width: "auto", // Breite automatisch
    minWidth: "60px", // Mindestbreite
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    color: "#4b5563", // text-gray-600
    boxShadow:
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)", // Kleiner Schatten
    pointerEvents: "none", // Keine Maus-Events für das Overlay selbst
  };

  let content = "Unbekannte Form";
  if (data.shapeType === "rectangle") content = "Rechteck";
  if (data.shapeType === "circle") content = "Kreis";
  if (data.shapeType === "line") content = "Linie";
  // Hier ggf. SVGs oder andere Darstellungen basierend auf data.shapeType einfügen

  return <div style={style}>{content}</div>;
};

export default ShapeOverlay;
