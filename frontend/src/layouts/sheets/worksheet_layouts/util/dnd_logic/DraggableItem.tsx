import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

// Definiere einen Basis-Typ für die Daten
type DraggableData = {
  type: string;
  [key: string]: unknown;
};

interface DraggableItemProps<TData extends DraggableData> {
  // TData für generische Daten, muss DraggableData erweitern
  id: string; // Eindeutige ID für das DnD-Element
  data?: TData; // Daten, die mit dem Element verbunden sind (z.B. Typ, Werte)
  children: React.ReactNode; // Das Element, das angezeigt und gezogen wird
  className?: string; // Optionale zusätzliche Klassen für das Wrapper-Div
}

/**
 * Eine generische Komponente, die jedes Kind-Element ziehbar macht.
 */
export function DraggableItem<TData extends DraggableData>({
  id,
  data,
  children,
  className,
}: DraggableItemProps<TData>) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: id,
      data: data,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1, // Visuelles Feedback beim Ziehen
    touchAction: "none", // Wichtig für PointerSensor auf Touch-Geräten
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={className}
    >
      {children}
    </div>
  );
}

export default DraggableItem;
