import React from "react";
import Konva from "konva";
import {
  Rect,
  Circle,
  Line,
  RegularPolygon,
  Star as KonvaStar,
  Arrow,
} from "react-konva";

// Aufzählung der verfügbaren Formtypen
export enum ShapeType {
  RECTANGLE = "rectangle",
  CIRCLE = "circle",
  TRIANGLE = "triangle",
  HEXAGON = "hexagon",
  STAR = "star",
  ARROW = "arrow",
  LINE = "line",
  HEART = "heart",
}

// Interface für Formeigenschaften
export interface ShapeProps {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: number[];
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  draggable?: boolean;
  rotation?: number;
  sides?: number;
  numPoints?: number;
  innerRadius?: number;
  outerRadius?: number;
  pointerLength?: number;
  pointerWidth?: number;
}

// Standard-Formeigenschaften
const DEFAULT_SHAPE_PROPS: Partial<ShapeProps> = {
  width: 100,
  height: 100,
  radius: 50,
  fill: "#ffffff",
  stroke: "#000000",
  strokeWidth: 2,
  draggable: true,
  rotation: 0,
};

// Heart-Shape-Punkte generieren
const generateHeartPoints = (scale: number = 1): number[] => {
  const points = [];
  // Herz-Kurve
  for (let i = 0; i < 360; i += 10) {
    const angle = (i * Math.PI) / 180;
    const r = 20 * (1 - Math.sin(angle));
    const x = r * Math.cos(angle) * scale;
    const y = r * Math.sin(angle) * scale - 10 * scale;
    points.push(x, y);
  }
  return points;
};

// ShapeManager-Klasse für die Verwaltung von Formen
export class ShapeManager {
  private static instance: ShapeManager;
  private shapeCounter: number = 0;

  private constructor() {}

  // Singleton-Pattern
  public static getInstance(): ShapeManager {
    if (!ShapeManager.instance) {
      ShapeManager.instance = new ShapeManager();
    }
    return ShapeManager.instance;
  }

  // Erstellt eine neue Form mit Standardwerten
  public createShape(type: ShapeType, x: number, y: number): ShapeProps {
    this.shapeCounter++;

    const baseProps = {
      id: `shape-${this.shapeCounter}`,
      type,
      x,
      y,
      ...DEFAULT_SHAPE_PROPS,
    };

    // Spezielle Eigenschaften je nach Formtyp
    switch (type) {
      case ShapeType.TRIANGLE:
        return {
          ...baseProps,
          points: [0, -50, 50, 50, -50, 50],
        };
      case ShapeType.HEXAGON:
        return {
          ...baseProps,
          radius: 50,
          sides: 6,
        };
      case ShapeType.STAR:
        return {
          ...baseProps,
          numPoints: 5,
          innerRadius: 25,
          outerRadius: 50,
        };
      case ShapeType.ARROW:
        return {
          ...baseProps,
          points: [0, 0, 100, 0],
          pointerLength: 10,
          pointerWidth: 10,
        };
      case ShapeType.LINE:
        return {
          ...baseProps,
          points: [0, 0, 100, 0],
          strokeWidth: 3,
        };
      case ShapeType.HEART:
        return {
          ...baseProps,
          points: generateHeartPoints(3),
        };
      default:
        return baseProps;
    }
  }

  // Aktualisiert eine bestehende Form
  public updateShape(
    shapeProps: ShapeProps,
    updates: Partial<ShapeProps>
  ): ShapeProps {
    return {
      ...shapeProps,
      ...updates,
    };
  }
}

// React-Komponente für eine Form
export const ShapeElement: React.FC<{
  shapeProps: ShapeProps;
  onSelect?: (id: string) => void;
  onUpdate?: (id: string, props: Partial<ShapeProps>) => void;
}> = ({ shapeProps, onSelect, onUpdate }) => {
  const {
    id,
    type,
    x,
    y,
    width,
    height,
    radius,
    points,
    fill,
    stroke,
    strokeWidth,
    draggable,
    rotation,
  } = shapeProps;

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (onUpdate) {
      onUpdate(id, {
        x: e.target.x(),
        y: e.target.y(),
      });
    }
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    if (!onUpdate) return;

    const node = e.target;
    onUpdate(id, {
      x: node.x(),
      y: node.y(),
      width: node.width() * node.scaleX(),
      height: node.height() * node.scaleY(),
      rotation: node.rotation(),
    });
  };

  const commonProps = {
    x,
    y,
    fill,
    stroke,
    strokeWidth,
    draggable,
    rotation,
    onClick: () => onSelect && onSelect(id),
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
  };

  // Render verschiedene Formtypen
  switch (type) {
    case ShapeType.RECTANGLE:
      return (
        <Rect {...commonProps} width={width || 100} height={height || 100} />
      );
    case ShapeType.CIRCLE:
      return <Circle {...commonProps} radius={radius || 50} />;
    case ShapeType.TRIANGLE:
      return (
        <Line
          {...commonProps}
          points={points || [0, -50, 50, 50, -50, 50]}
          closed
          tension={0.3}
        />
      );
    case ShapeType.HEXAGON:
      return (
        <RegularPolygon {...commonProps} sides={6} radius={radius || 50} />
      );
    case ShapeType.STAR:
      return (
        <KonvaStar
          {...commonProps}
          numPoints={5}
          innerRadius={(radius || 50) / 2}
          outerRadius={radius || 50}
        />
      );
    case ShapeType.ARROW:
      return (
        <Arrow
          {...commonProps}
          points={points || [0, 0, 100, 0]}
          pointerLength={10}
          pointerWidth={10}
        />
      );
    case ShapeType.LINE:
      return <Line {...commonProps} points={points || [0, 0, 100, 0]} />;
    case ShapeType.HEART:
      return (
        <Line
          {...commonProps}
          points={points || generateHeartPoints(3)}
          closed
          tension={0.3}
        />
      );
    default:
      return null;
  }
};

// Funktion zum Hinzufügen einer neuen Form zum Worksheet
export const addShapeToWorksheet = (
  type: ShapeType,
  stageRef: React.RefObject<Konva.Stage>,
  callback: (shapeProps: ShapeProps) => void
) => {
  if (!stageRef.current) return;

  const stage = stageRef.current;
  const pointerPosition = stage.getPointerPosition();

  if (!pointerPosition) return;

  const { x, y } = pointerPosition;

  const shapeManager = ShapeManager.getInstance();
  const newShape = shapeManager.createShape(type, x, y);

  callback(newShape);
};

export default {
  ShapeType,
  ShapeManager,
  ShapeElement,
  addShapeToWorksheet,
};
