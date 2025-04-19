import React from "react";
import {
  TLBaseShape,
  ShapeUtil,
  SVGContainer,
  toDomPrecision,
  Rectangle2d,
  type TLResizeInfo,
  type TLShapePartial,
} from "@tldraw/tldraw";
import { getShapeColors } from "./CustomShapesColorUtil";

// Füge die Grundformen hinzu
export type CustomGeoShapeType =
  | "rectangle"
  | "ellipse"
  | "triangle"
  | "diamond"
  | "pentagon"
  | "hexagon"
  | "star"
  | "heart"
  | "person"
  | "cloud";

// Props für Custom Shapes
export interface CustomGeoShapeProps {
  geo: CustomGeoShapeType;
  w: number;
  h: number;
  color: string;
  size: string;
  fill: string;
  dash: string;
}

// Definition des Custom Geo Shapes
export type CustomGeoShape = TLBaseShape<"custom-geo", CustomGeoShapeProps>;

// Custom Geo Shape Util
export class CustomGeoShapeUtil extends ShapeUtil<CustomGeoShape> {
  static type = "custom-geo" as const;

  getDefaultProps(): CustomGeoShapeProps {
    return {
      geo: "rectangle",
      w: 100,
      h: 100,
      color: "#000000",
      size: "m",
      fill: "none",
      dash: "solid",
    };
  }

  // Definiert das Tool für diesen Shape
  static getTool() {
    return "custom-geo";
  }

  // Die Geometrie der Form (für Kollisionserkennung usw.)
  getGeometry(shape: CustomGeoShape): Rectangle2d {
    const { w, h } = shape.props;
    return new Rectangle2d({
      width: w,
      height: h,
      isFilled: true,
    });
  }

  // Die React-Komponente, die die Form rendert
  component(shape: CustomGeoShape): React.ReactElement {
    const { w, h, color, fill, dash, size, geo } = shape.props;

    const { stroke: strokeColor, fill: fillColor } = getShapeColors(
      color,
      fill
    );

    const strokeDasharray =
      dash === "dashed" ? "8 4" : dash === "dotted" ? "1.5 3" : undefined;

    const strokeWidth =
      size === "s"
        ? 2
        : size === "m"
        ? 3.5
        : size === "l"
        ? 5
        : size === "xl"
        ? 10
        : 3.5;

    // Berechne Dimensionen und Offsets unter Berücksichtigung der Strichstärke
    const width = toDomPrecision(w);
    const height = toDomPrecision(h);
    const innerWidth = Math.max(1, width - strokeWidth);
    const innerHeight = Math.max(1, height - strokeWidth);
    const offsetX = strokeWidth / 2;
    const offsetY = strokeWidth / 2;
    // Gesamt-Mittelpunkt (für Ellipse, Dreieck, Raute)
    const centerX = width / 2;
    const centerY = height / 2;
    // Mittelpunkt des *Innenbereichs* (für Pfad-Helfer)
    const pathCenterX = offsetX + innerWidth / 2;
    const pathCenterY = offsetY + innerHeight / 2;

    let element: React.ReactElement;

    switch (geo) {
      case "rectangle":
        element = (
          <rect
            x={offsetX}
            y={offsetY}
            width={innerWidth}
            height={innerHeight}
            strokeWidth={strokeWidth}
            stroke={strokeColor}
            strokeDasharray={strokeDasharray}
            fill={fillColor}
            rx={2}
            ry={2}
          />
        );
        break;
      case "ellipse":
        element = (
          <ellipse
            cx={centerX}
            cy={centerY}
            rx={innerWidth / 2}
            ry={innerHeight / 2}
            strokeWidth={strokeWidth}
            stroke={strokeColor}
            strokeDasharray={strokeDasharray}
            fill={fillColor}
          />
        );
        break;
      case "triangle":
        element = (
          <path
            d={`M ${centerX},${offsetY} L ${width - offsetX},${height -
              offsetY} L ${offsetX},${height - offsetY} Z`}
            strokeWidth={strokeWidth}
            stroke={strokeColor}
            strokeDasharray={strokeDasharray}
            fill={fillColor}
            strokeLinejoin="round"
          />
        );
        break;
      case "diamond":
        element = (
          <path
            d={`M ${centerX},${offsetY} L ${width - offsetX},${centerY} L ${centerX},${height -
              offsetY} L ${offsetX},${centerY} Z`}
            strokeWidth={strokeWidth}
            stroke={strokeColor}
            strokeDasharray={strokeDasharray}
            fill={fillColor}
            strokeLinejoin="round"
          />
        );
        break;

      // --- Refactoring für Pfad-basierte Formen mit Transform --- 
      case "pentagon":
      case "hexagon":
      case "star":
      case "heart":   // Jetzt auch mit Transform
      case "person":  // Jetzt auch mit Transform
      case "cloud":   // Jetzt auch mit Transform
      { 
        let path = "";
        let scaleX = 1;
        let scaleY = 1;
        const unitSize = 2; // Einheitspfad passt in 2x2 Box

        switch (geo) {
           case "pentagon":
             path = createRegularPolygonPath(5); 
             scaleX = innerWidth / unitSize;
             scaleY = innerHeight / unitSize;
             break;
           case "hexagon":
             path = createRegularPolygonPath(6);
             scaleX = innerWidth / unitSize;
             scaleY = innerHeight / unitSize;
             break;
           case "star":
             path = createStarPath(5, 0.4);
             scaleX = innerWidth / unitSize;
             scaleY = innerHeight / unitSize;
             break;
           // --- Refaktorisierte Fälle für Herz, Person, Wolke --- 
           case "heart":
             path = createHeartPath(); // Nutzt Einheitspfad
             scaleX = innerWidth / unitSize;
             scaleY = innerHeight / unitSize;
             break;
           case "person":
             path = createPersonPath(); // Nutzt Einheitspfad
             scaleX = innerWidth / unitSize;
             scaleY = innerHeight / unitSize;
             break;
           case "cloud":
             path = createCloudPath(); // Nutzt Einheitspfad
             scaleX = innerWidth / unitSize;
             scaleY = innerHeight / unitSize;
             break;
           // --- Ende refaktorisierte Fälle --- 
        }

        element = (
          <path
            d={path}
            // Wende transform immer an (außer scale ist exakt 1)
            transform={ (scaleX !== 1 || scaleY !== 1) 
                ? `translate(${pathCenterX} ${pathCenterY}) scale(${toDomPrecision(scaleX)} ${toDomPrecision(scaleY)})` 
                : `translate(${pathCenterX} ${pathCenterY})` // Nur Translation wenn scale 1 ist
            }
            strokeWidth={strokeWidth}
            stroke={strokeColor}
            strokeDasharray={strokeDasharray}
            fill={fillColor}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        );
        break;
      }
      default:
        // Fallback auf Rechteck
        element = (
          <rect
            x={offsetX}
            y={offsetY}
            width={innerWidth}
            height={innerHeight}
            strokeWidth={strokeWidth}
            stroke={strokeColor}
            strokeDasharray={strokeDasharray}
            fill={fillColor}
            rx={2}
            ry={2}
          />
        );
    }

    return (
      <SVGContainer
        id={shape.id}
        style={{
          width: toDomPrecision(w),
          height: toDomPrecision(h),
          overflow: "visible", 
        }}
      >
        {element}
      </SVGContainer>
    );
  }

  // Indikator für die Form beim Auswählen
  indicator(shape: CustomGeoShape): React.ReactElement {
    const { w, h } = shape.props;
    return (
      <rect
        width={toDomPrecision(w)}
        height={toDomPrecision(h)}
        fill="none"
        strokeWidth={1}
        stroke="var(--color-selected)"
        rx={2}
        ry={2}
      />
    );
  }

  // Handler für das Ändern der Größe
  onResize = (
    shape: CustomGeoShape,
    info: TLResizeInfo<CustomGeoShape>
  ): TLShapePartial<CustomGeoShape> | void => {
    // Stelle sicher, dass wir nur CustomGeoShapes bearbeiten
    if (shape.type !== CustomGeoShapeUtil.type) return;

    const { scaleX, scaleY } = info;

    // Berechne neue Breite und Höhe
    const newWidth = Math.max(1, shape.props.w * scaleX);
    const newHeight = Math.max(1, shape.props.h * scaleY);

    // Prüfe, ob sich tatsächlich etwas geändert hat (optional, aber gut)
    if (shape.props.w === newWidth && shape.props.h === newHeight) {
      return;
    }

    // Gib TLShapePartial zurück
    return {
      id: shape.id,
      type: shape.type,
      props: {
        ...shape.props,
        w: newWidth,
        h: newHeight,
      },
    };
  };
}

// --- Angepasste Hilfsfunktionen --- 

// Erzeugt Polygon um (0,0) mit Radius 1
function createRegularPolygonPath(
  sides: number
): string {
  let path = `M`;
  const radius = 1; // Einheitradius
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    if (i === 0) {
      path += ` ${toDomPrecision(x)},${toDomPrecision(y)}`;
    } else {
      path += ` L ${toDomPrecision(x)},${toDomPrecision(y)}`;
    }
  }
  path += " Z";
  return path;
}

// Erzeugt Stern um (0,0) mit Außenradius 1 und spez. Innenradius
function createStarPath(
  points: number,
  innerRadiusFactor: number // z.B. 0.4
): string {
  const outerRadius = 1; // Einheitradius außen
  const innerRadius = outerRadius * innerRadiusFactor;
  let path = `M`;
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const currentRadius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = currentRadius * Math.cos(angle);
    const y = currentRadius * Math.sin(angle);
    if (i === 0) {
      path += ` ${toDomPrecision(x)},${toDomPrecision(y)}`;
    } else {
      path += ` L ${toDomPrecision(x)},${toDomPrecision(y)}`;
    }
  }
  path += " Z";
  return path;
}

// --- Unveränderte Hilfsfunktionen --- 
// --- Refaktorierte Hilfsfunktionen für Einheitspfade --- 

// Erzeugt Herzpfad um (0,0) passend in ca. 2x2 Einheit
function createHeartPath(): string {
  const w = 2; // Einheitsbreite
  const h = 2; // Einheitshöhe
  const centerX = 0;
  const centerY = 0;
  const topOffset = h * 0.2;
  const curveFactor = 0.4;

  // Koordinaten relativ zu (0,0) und Einheitsgröße 2x2
  const M = { x: centerX, y: centerY + h * 0.3 }; // (0, 0.6)
  const C1_1 = { x: centerX, y: centerY + h * 0.1 }; // (0, 0.2)
  const C1_2 = { x: centerX - w * curveFactor, y: centerY - h * 0.2 }; // (-0.8, -0.4)
  const C1_E = { x: centerX - w * 0.5, y: centerY - topOffset }; // (-1, -0.4)

  const C2_1 = { x: centerX - w * (0.5 + curveFactor), y: centerY - h * 0.6 }; // (-1.8, -1.2)
  const C2_2 = { x: centerX, y: centerY - h * 0.4 }; // (0, -0.8)
  const C2_E = { x: centerX, y: centerY - topOffset }; // (0, -0.4)

  const C3_1 = { x: centerX, y: centerY - h * 0.4 }; // (0, -0.8)
  const C3_2 = { x: centerX + w * (0.5 + curveFactor), y: centerY - h * 0.6 }; // (1.8, -1.2)
  const C3_E = { x: centerX + w * 0.5, y: centerY - topOffset }; // (1, -0.4)

  const C4_1 = { x: centerX + w * curveFactor, y: centerY - h * 0.2 }; // (0.8, -0.4)
  const C4_2 = { x: centerX, y: centerY + h * 0.1 }; // (0, 0.2)

  const px = (val: number) => toDomPrecision(val);

  return `
    M ${px(M.x)},${px(M.y)}
    C ${px(C1_1.x)},${px(C1_1.y)} ${px(C1_2.x)},${px(C1_2.y)} ${px(C1_E.x)},${px(C1_E.y)}
    C ${px(C2_1.x)},${px(C2_1.y)} ${px(C2_2.x)},${px(C2_2.y)} ${px(C2_E.x)},${px(C2_E.y)}
    C ${px(C3_1.x)},${px(C3_1.y)} ${px(C3_2.x)},${px(C3_2.y)} ${px(C3_E.x)},${px(C3_E.y)}
    C ${px(C4_1.x)},${px(C4_1.y)} ${px(C4_2.x)},${px(C4_2.y)} ${px(M.x)},${px(M.y)}
    Z
  `;
}

// Erzeugt Personenpfad um (0,0) passend in ca. 2x2 Einheit
function createPersonPath(): string {
  const unitRadius = 1; // Basiert auf Einheitsradius 1
  const headRadius = unitRadius * 0.3; // 0.3
  const bodyHeight = unitRadius * 0.7; // 0.7
  const shoulderWidth = unitRadius * 0.6; // 0.6

  // Berechne visuelle Mitte und Offset basierend auf Einheit (cy = 0)
  const visualTop = (0 - unitRadius * 0.3) - headRadius; // -0.6
  const visualBottom = 0 + bodyHeight; // 0.7
  const visualCenterY = (visualTop + visualBottom) / 2; // 0.05
  const offsetY = visualCenterY - 0; // 0.05

  // Berechne Einheits-Koordinaten mit Offset
  const headCenterY = (0 - unitRadius * 0.3) - offsetY; // -0.35
  const bodyTopY = 0 - offsetY; // -0.05
  const bodyBottomY = bodyTopY + bodyHeight; // 0.65
  const bodyLeftX = 0 - shoulderWidth / 2; // -0.3
  const bodyRightX = 0 + shoulderWidth / 2; // 0.3

  const px = (val: number) => toDomPrecision(val);

  const headPath = `M ${px(bodyLeftX + headRadius - (shoulderWidth/2-headRadius))}, ${px(headCenterY)} a ${px(headRadius)},${px(headRadius)} 0 1,0 ${px(headRadius * 2)},0 a ${px(headRadius)},${px(headRadius)} 0 1,0 -${px(headRadius * 2)},0`;

  const bodyPath = `M ${px(bodyLeftX)},${px(bodyTopY)} L ${px(bodyRightX)},${px(bodyTopY)} L ${px(bodyRightX)},${px(bodyBottomY)} L ${px(bodyLeftX)},${px(bodyBottomY)} Z`;

  return `${headPath} ${bodyPath}`;
}

// Erzeugt Wolkenpfad um (0,0) passend in ca. 2x2 Einheit
function createCloudPath(): string {
  const unitRadius = 1; // Basiert auf Einheitsradius 1
  const centerX = 0;
  const centerY = 0;

  // Radien basierend auf Einheitsradius
  const rx1 = unitRadius * 0.4;
  const ry1 = unitRadius * 0.3;
  const rx2 = unitRadius * 0.5;
  const ry2 = unitRadius * 0.35;
  const rx3 = unitRadius * 0.35;
  const ry3 = unitRadius * 0.25;

  const px = (val: number) => toDomPrecision(val);

  // Punkte relativ zu (0,0) und Einheitsradius
  const P1 = { x: centerX - unitRadius * 0.5, y: centerY + unitRadius * 0.1 }; // (-0.5, 0.1)
  const P2 = { x: centerX - unitRadius * 0.7, y: centerY - unitRadius * 0.1 }; // (-0.7, -0.1)
  const P3 = { x: centerX - unitRadius * 0.3, y: centerY - unitRadius * 0.4 }; // (-0.3, -0.4)
  const P4 = { x: centerX + unitRadius * 0.3, y: centerY - unitRadius * 0.5 }; // (0.3, -0.5)
  const P5 = { x: centerX + unitRadius * 0.7, y: centerY - unitRadius * 0.2 }; // (0.7, -0.2)
  const P6 = { x: centerX + unitRadius * 0.4, y: centerY + unitRadius * 0.2 }; // (0.4, 0.2)

  return `
    M ${px(P1.x)},${px(P1.y)}
    A ${px(rx1)} ${px(ry1)} 0 1 1 ${px(P2.x)},${px(P2.y)}
    A ${px(rx2)} ${px(ry2)} 0 1 1 ${px(P3.x)},${px(P3.y)}
    A ${px(rx3)} ${px(ry3)} 0 1 1 ${px(P4.x)},${px(P4.y)}
    A ${px(rx2)} ${px(ry2)} 0 1 1 ${px(P5.x)},${px(P5.y)}
    A ${px(rx1)} ${px(ry1)} 0 1 1 ${px(P6.x)},${px(P6.y)}
    A ${px(rx3)} ${px(ry3)} 0 1 1 ${px(P1.x)},${px(P1.y)}
    Z
  `;
}

// Exportiere die benutzerdefinierten ShapeUtils für Verwendung in der App
// Entferne den Export von customShapeUtils hier
