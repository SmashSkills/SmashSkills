import React from "react";
import { Text as KonvaText } from "react-konva";
import Konva from "konva";

// Interface für Text-Eigenschaften
export interface TextProps {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  draggable?: boolean;
}

// Standard-Texteigenschaften
const DEFAULT_TEXT_PROPS: Partial<TextProps> = {
  fontSize: 16,
  fontFamily: "Arial",
  fill: "black",
  draggable: true,
};

// TextManager-Klasse für die Verwaltung von Text-Elementen
export class TextManager {
  private static instance: TextManager;
  private textCounter: number = 0;

  private constructor() {}

  // Singleton-Pattern
  public static getInstance(): TextManager {
    if (!TextManager.instance) {
      TextManager.instance = new TextManager();
    }
    return TextManager.instance;
  }

  // Erstellt ein neues Text-Element mit Standardwerten
  public createText(
    x: number,
    y: number,
    text: string = "Neuer Text"
  ): TextProps {
    this.textCounter++;
    return {
      id: `text-${this.textCounter}`,
      x,
      y,
      text,
      ...DEFAULT_TEXT_PROPS,
    };
  }

  // Aktualisiert ein bestehendes Text-Element
  public updateText(
    textProps: TextProps,
    updates: Partial<TextProps>
  ): TextProps {
    return {
      ...textProps,
      ...updates,
    };
  }
}

// React-Komponente für ein Text-Element
export const TextElement: React.FC<{
  textProps: TextProps;
  onSelect?: (id: string) => void;
  onUpdate?: (id: string, props: Partial<TextProps>) => void;
}> = ({ textProps, onSelect, onUpdate }) => {
  const { id, x, y, text, fontSize, fontFamily, fill, draggable } = textProps;

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (onUpdate) {
      onUpdate(id, {
        x: e.target.x(),
        y: e.target.y(),
      });
    }
  };

  return (
    <KonvaText
      x={x}
      y={y}
      text={text}
      fontSize={fontSize}
      fontFamily={fontFamily}
      fill={fill}
      draggable={draggable}
      onClick={() => onSelect && onSelect(id)}
      onDragEnd={handleDragEnd}
    />
  );
};

// Funktion zum Hinzufügen eines neuen Textes zum Worksheet
export const addTextToWorksheet = (
  stageRef: React.RefObject<Konva.Stage>,
  callback: (textProps: TextProps) => void
) => {
  if (!stageRef.current) return;

  const stage = stageRef.current;
  const pointerPosition = stage.getPointerPosition();

  if (!pointerPosition) return;

  const { x, y } = pointerPosition;

  const textManager = TextManager.getInstance();
  const newText = textManager.createText(x, y);

  callback(newText);
};

export default {
  TextManager,
  TextElement,
  addTextToWorksheet,
};
