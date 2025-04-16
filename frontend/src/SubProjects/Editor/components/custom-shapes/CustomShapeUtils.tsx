import {
  TLBaseShape,
  ShapeUtil,
  SVGContainer,
  getDefaultColorTheme,
  toDomPrecision,
  TLAnyShapeUtilConstructor,
  Rectangle2d,
} from "@tldraw/tldraw";

// Eigene Shape-Typen definieren
export type CustomGeoShapeType =
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
// Als Typ-Alias statt Interface definieren, um den Linter-Fehler zu vermeiden
export type CustomGeoShape = TLBaseShape<"custom-geo", CustomGeoShapeProps>;

// Custom Geo Shape Util
export class CustomGeoShapeUtil extends ShapeUtil<CustomGeoShape> {
  static type = "custom-geo" as const;

  getDefaultProps(): CustomGeoShapeProps {
    return {
      geo: "pentagon",
      w: 100,
      h: 100,
      color: "black",
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
  component(shape: CustomGeoShape) {
    const { w, h, color, fill, dash, size, geo } = shape.props;

    // Für Dashstyle
    const strokeDasharray =
      dash === "dashed" ? "8 4" : dash === "dotted" ? "1.5 3" : undefined;

    // Größe der Linie basierend auf der Size-Prop
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

    // Theme-Farben
    const theme = getDefaultColorTheme({ isDarkMode: false });
    let fillColor = "none";
    let strokeColor = "#000000";

    // Basis-Farben für bekannte Farbwerte
    if (
      color === "black" ||
      color === "blue" ||
      color === "green" ||
      color === "grey" ||
      color === "light-blue" ||
      color === "light-green" ||
      color === "light-red" ||
      color === "light-violet" ||
      color === "orange" ||
      color === "red" ||
      color === "violet" ||
      color === "yellow"
    ) {
      strokeColor = theme[color]?.solid || strokeColor;
      fillColor =
        fill === "none"
          ? "none"
          : fill === "solid"
          ? theme[color]?.solid || strokeColor
          : theme[color]?.semi || "rgba(0,0,0,0.2)";
    } else {
      // Fallback für direkte HEX-Werte
      strokeColor = color || "#000000";
      fillColor =
        fill === "none"
          ? "none"
          : fill === "solid"
          ? color || "#000000"
          : `${color}40`;
    }

    // Pfad für die jeweilige Form generieren
    let path = "";
    const width = toDomPrecision(w);
    const height = toDomPrecision(h);
    const centerX = width / 2;
    const centerY = height / 2;
    const minDimension = Math.min(width, height);
    const radius = (minDimension / 2) * 0.9; // 90% der kleineren Dimension

    switch (geo) {
      case "pentagon":
        path = createRegularPolygonPath(centerX, centerY, radius, 5);
        break;
      case "hexagon":
        path = createRegularPolygonPath(centerX, centerY, radius, 6);
        break;
      case "star":
        path = createStarPath(centerX, centerY, radius, 5);
        break;
      case "heart":
        path = createHeartPath(centerX, centerY, radius);
        break;
      case "person":
        path = createPersonPath(centerX, centerY, radius);
        break;
      case "cloud":
        path = createCloudPath(centerX, centerY, radius);
        break;
      default:
        path = `M 0,0 L ${width},0 L ${width},${height} L 0,${height} Z`; // Rechteck als Fallback
    }

    return (
      <SVGContainer
        id={shape.id}
        style={{
          width: toDomPrecision(w),
          height: toDomPrecision(h),
        }}
      >
        <path
          d={path}
          strokeWidth={strokeWidth}
          stroke={strokeColor}
          strokeDasharray={strokeDasharray}
          fill={fillColor}
          pointerEvents="all"
        />
      </SVGContainer>
    );
  }

  // Indikator für die Form beim Auswählen
  indicator(shape: CustomGeoShape) {
    const { w, h } = shape.props;
    return (
      <rect
        width={toDomPrecision(w)}
        height={toDomPrecision(h)}
        fill="none"
        strokeWidth={1}
        rx={2}
        ry={2}
      />
    );
  }
}

// Hilfsfunktionen zum Erstellen der Pfade
function createRegularPolygonPath(
  centerX: number,
  centerY: number,
  radius: number,
  sides: number
): string {
  let path = `M`;
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    if (i === 0) {
      path += ` ${x},${y}`;
    } else {
      path += ` L ${x},${y}`;
    }
  }
  path += " Z"; // Schließe den Pfad
  return path;
}

function createStarPath(
  centerX: number,
  centerY: number,
  radius: number,
  points: number
): string {
  const innerRadius = radius * 0.4;
  let path = `M`;
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const currentRadius = i % 2 === 0 ? radius : innerRadius;
    const x = centerX + currentRadius * Math.cos(angle);
    const y = centerY + currentRadius * Math.sin(angle);
    if (i === 0) {
      path += ` ${x},${y}`;
    } else {
      path += ` L ${x},${y}`;
    }
  }
  path += " Z"; // Schließe den Pfad
  return path;
}

function createHeartPath(
  centerX: number,
  centerY: number,
  radius: number
): string {
  // Herz-Form
  const width = radius * 2;
  const height = radius * 2;
  const topOffset = height * 0.15;

  return `
    M ${centerX},${centerY - topOffset + height * 0.45}
    C ${centerX},${centerY - topOffset + height * 0.25}
      ${centerX + width * 0.4},${centerY - topOffset - height * 0.2}
      ${centerX},${centerY - topOffset - height * 0.35}
    C ${centerX - width * 0.4},${centerY - topOffset - height * 0.2}
      ${centerX},${centerY - topOffset + height * 0.25}
      ${centerX},${centerY - topOffset + height * 0.45}
    Z
  `;
}

function createPersonPath(
  centerX: number,
  centerY: number,
  radius: number
): string {
  // Vereinfachte Person
  const headRadius = radius * 0.3;
  const bodyHeight = radius * 0.8;
  const shoulderWidth = radius * 0.6;

  return `
    M ${centerX - headRadius * 0.8},${centerY - radius * 0.3 + headRadius}
    A ${headRadius} ${headRadius} 0 1 1 ${centerX +
    headRadius * 0.8},${centerY - radius * 0.3 + headRadius}
    M ${centerX - shoulderWidth / 2},${centerY - radius * 0.1}
    L ${centerX + shoulderWidth / 2},${centerY - radius * 0.1}
    L ${centerX + shoulderWidth / 2},${centerY + bodyHeight - radius * 0.1}
    L ${centerX - shoulderWidth / 2},${centerY + bodyHeight - radius * 0.1}
    Z
  `;
}

function createCloudPath(
  centerX: number,
  centerY: number,
  radius: number
): string {
  // Wolken-Form
  const rx = radius * 0.35;
  const ry = radius * 0.3;

  return `
    M ${centerX - radius * 0.4},${centerY + radius * 0.2}
    A ${rx} ${ry} 0 1 1 ${centerX - radius * 0.6},${centerY}
    A ${rx} ${ry} 0 1 1 ${centerX},${centerY - radius * 0.3}
    A ${rx} ${ry} 0 1 1 ${centerX + radius * 0.6},${centerY}
    A ${rx} ${ry} 0 1 1 ${centerX + radius * 0.4},${centerY + radius * 0.2}
    Z
  `;
}

// Exportiere die benutzerdefinierten ShapeUtils für Verwendung in der App
export const customShapeUtils = ([
  CustomGeoShapeUtil,
] as unknown) as TLAnyShapeUtilConstructor[];
