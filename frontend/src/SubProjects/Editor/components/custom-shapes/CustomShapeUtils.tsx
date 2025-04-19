import { TLAnyShapeUtilConstructor } from "@tldraw/tldraw";
import { CustomGeoShapeUtil } from "./CustomGeoShapeUtil";

// Eigene Shape-Typen definieren
// Diese Typen werden nun in CustomGeoShapeUtil.tsx definiert
// export type CustomGeoShapeType =
//   | "pentagon"
//   | "hexagon"
//   | "star";

// Props für Custom Shapes
// Diese Interface wird nun in CustomGeoShapeUtil.tsx definiert
// export interface CustomGeoShapeProps {
//   geo: CustomGeoShapeType;
//   w: number;
//   h: number;
//   color: string;
//   size: string;
//   fill: string;
//   dash: string;
// }

// Definition des Custom Geo Shapes
// Dieser Typ-Alias wird nun in CustomGeoShapeUtil.tsx definiert
// export type CustomGeoShape = TLBaseShape<"custom-geo", CustomGeoShapeProps>;

// Custom Geo Shape Util
// Die Klasse CustomGeoShapeUtil wurde nach CustomGeoShapeUtil.tsx verschoben
// export class CustomGeoShapeUtil extends ShapeUtil<CustomGeoShape> { ... }

// Hilfsfunktionen zum Erstellen der Pfade
// Diese Funktionen wurden nach CustomGeoShapeUtil.tsx verschoben
// function createRegularPolygonPath(...) { ... }
// function createStarPath(...) { ... }

// Exportiere die benutzerdefinierten ShapeUtils für Verwendung in der App
export const customShapeUtils = ([
  CustomGeoShapeUtil,
  // Hier könnten weitere benutzerdefinierte ShapeUtils hinzugefügt werden
  // z.B. CustomDrawShapeUtil, CustomTextShapeUtil
] as unknown) as TLAnyShapeUtilConstructor[];
