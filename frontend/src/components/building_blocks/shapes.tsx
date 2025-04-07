import React from "react";
import DraggableItem from "../../layouts/sheets/worksheet_layouts/util/dnd_logic/DraggableItem";

// Hier definieren wir später die verschiedenen Formen und ihre Logik
// z.B. Rechteck, Kreis, Linie etc.

/* // Props-Interface (vorerst nicht benötigt)
interface ShapesProps {
  // Props, die diese Komponente evtl. benötigt
  // z.B. eine Funktion, um eine Form zum Editor hinzuzufügen
}
*/

const Shapes: React.FC = () => {
  // Beispiel-Daten für die Formen
  const shapesData = [
    { id: "shape-rect", type: "shape", shapeType: "rectangle" },
    { id: "shape-circle", type: "shape", shapeType: "circle" },
    { id: "shape-line", type: "shape", shapeType: "line" },
    // Fügen Sie hier weitere Formen hinzu
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {shapesData.map((shape) => (
        <DraggableItem
          key={shape.id}
          id={shape.id}
          data={{ type: shape.type, shapeType: shape.shapeType }} // Daten übergeben
          className="border border-gray-300 bg-white hover:bg-gray-100 cursor-grab rounded p-1"
        >
          <div className="h-14 flex items-center justify-center text-gray-600 text-xs pointer-events-none select-none">
            {/* Visuelle Darstellung der Form (könnte SVG sein) */}
            {shape.shapeType === "rectangle" && "Rechteck"}
            {shape.shapeType === "circle" && "Kreis"}
            {shape.shapeType === "line" && "Linie"}
          </div>
        </DraggableItem>
      ))}
    </div>
  );
};

export default Shapes;
