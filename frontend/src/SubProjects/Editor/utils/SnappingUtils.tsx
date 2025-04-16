import { Editor, TLShape, TLShapeId } from "@tldraw/tldraw";

// Rechteck-Typ für Snapping-Berechnungen
export type SnapRect = {
  id: TLShapeId;
  left: number;
  top: number;
  right: number;
  bottom: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
};

// Snapping-Ergebnis-Typ
export type SnapResult = {
  snapX: number;
  snapY: number;
  guides: {
    vertical: { position: number; start: number; end: number }[];
    horizontal: { position: number; start: number; end: number }[];
  };
};

// Standard-Snapping-Einstellungen
export const DEFAULT_SNAP_SETTINGS = {
  threshold: 10, // Pixel-Schwellenwert für Snapping
  enableCenter: true, // Snapping an den Mittelpunkten aktivieren
  enableEdges: true, // Snapping an den Kanten aktivieren
  enableGrid: false, // Snapping am Raster aktivieren
  gridSize: 20, // Rastergröße in Pixeln
};

/**
 * Erstellt ein SnapRect-Objekt aus einem TLShape
 */
export function shapeToSnapRect(shape: TLShape): SnapRect {
  // Hole die Bounds des Shapes
  const bounds = shape.bounds;

  return {
    id: shape.id,
    left: bounds.minX,
    top: bounds.minY,
    right: bounds.maxX,
    bottom: bounds.maxY,
    centerX: bounds.minX + bounds.width / 2,
    centerY: bounds.minY + bounds.height / 2,
    width: bounds.width,
    height: bounds.height,
  };
}

/**
 * Berechnet die Snapping-Offsets und Hilfslinien basierend auf dem bewegten Shape und den anderen Shapes
 */
export function calcSnappingOffsets(
  movingRect: SnapRect,
  otherRects: SnapRect[],
  settings = DEFAULT_SNAP_SETTINGS
): SnapResult {
  let snapX = 0;
  let snapY = 0;
  const guides = {
    vertical: [] as { position: number; start: number; end: number }[],
    horizontal: [] as { position: number; start: number; end: number }[],
  };

  // Ignoriere Snapping, wenn keine Kandidaten vorhanden sind
  if (otherRects.length === 0) {
    return { snapX, snapY, guides };
  }

  // Variablen für Snapping-Berechnungen
  let minXDiff = Infinity;
  let minYDiff = Infinity;

  // Hilfslinien-Erweiterung: Strecke der Linie über den aktuellen Shape hinaus
  const extendBy = 20;

  // 1. Mittelpunkt-Snapping
  if (settings.enableCenter) {
    otherRects.forEach((rect) => {
      // Mittelpunkt-Snapping horizontal
      const centerXDiff = rect.centerX - movingRect.centerX;
      if (
        Math.abs(centerXDiff) < settings.threshold &&
        Math.abs(centerXDiff) < Math.abs(minXDiff)
      ) {
        minXDiff = centerXDiff;
        snapX = centerXDiff;

        // Vertikale Hilfslinie für Mittelpunkt
        guides.vertical.push({
          position: rect.centerX,
          start: Math.min(movingRect.top, rect.top) - extendBy,
          end: Math.max(movingRect.bottom, rect.bottom) + extendBy,
        });
      }

      // Mittelpunkt-Snapping vertikal
      const centerYDiff = rect.centerY - movingRect.centerY;
      if (
        Math.abs(centerYDiff) < settings.threshold &&
        Math.abs(centerYDiff) < Math.abs(minYDiff)
      ) {
        minYDiff = centerYDiff;
        snapY = centerYDiff;

        // Horizontale Hilfslinie für Mittelpunkt
        guides.horizontal.push({
          position: rect.centerY,
          start: Math.min(movingRect.left, rect.left) - extendBy,
          end: Math.max(movingRect.right, rect.right) + extendBy,
        });
      }
    });
  }

  // 2. Kanten-Snapping
  if (settings.enableEdges) {
    otherRects.forEach((rect) => {
      // Links - Links
      const leftDiff = rect.left - movingRect.left;
      if (
        Math.abs(leftDiff) < settings.threshold &&
        Math.abs(leftDiff) < Math.abs(minXDiff)
      ) {
        minXDiff = leftDiff;
        snapX = leftDiff;

        guides.vertical.push({
          position: rect.left,
          start: Math.min(movingRect.top, rect.top) - extendBy,
          end: Math.max(movingRect.bottom, rect.bottom) + extendBy,
        });
      }

      // Rechts - Rechts
      const rightDiff = rect.right - movingRect.right;
      if (
        Math.abs(rightDiff) < settings.threshold &&
        Math.abs(rightDiff) < Math.abs(minXDiff)
      ) {
        minXDiff = rightDiff;
        snapX = rightDiff;

        guides.vertical.push({
          position: rect.right,
          start: Math.min(movingRect.top, rect.top) - extendBy,
          end: Math.max(movingRect.bottom, rect.bottom) + extendBy,
        });
      }

      // Links - Rechts
      const leftRightDiff = rect.left - movingRect.right;
      if (
        Math.abs(leftRightDiff) < settings.threshold &&
        Math.abs(leftRightDiff) < Math.abs(minXDiff)
      ) {
        minXDiff = leftRightDiff;
        snapX = leftRightDiff;

        guides.vertical.push({
          position: rect.left,
          start: Math.min(movingRect.top, rect.top) - extendBy,
          end: Math.max(movingRect.bottom, rect.bottom) + extendBy,
        });
      }

      // Rechts - Links
      const rightLeftDiff = rect.right - movingRect.left;
      if (
        Math.abs(rightLeftDiff) < settings.threshold &&
        Math.abs(rightLeftDiff) < Math.abs(minXDiff)
      ) {
        minXDiff = rightLeftDiff;
        snapX = rightLeftDiff;

        guides.vertical.push({
          position: rect.right,
          start: Math.min(movingRect.top, rect.top) - extendBy,
          end: Math.max(movingRect.bottom, rect.bottom) + extendBy,
        });
      }

      // Oben - Oben
      const topDiff = rect.top - movingRect.top;
      if (
        Math.abs(topDiff) < settings.threshold &&
        Math.abs(topDiff) < Math.abs(minYDiff)
      ) {
        minYDiff = topDiff;
        snapY = topDiff;

        guides.horizontal.push({
          position: rect.top,
          start: Math.min(movingRect.left, rect.left) - extendBy,
          end: Math.max(movingRect.right, rect.right) + extendBy,
        });
      }

      // Unten - Unten
      const bottomDiff = rect.bottom - movingRect.bottom;
      if (
        Math.abs(bottomDiff) < settings.threshold &&
        Math.abs(bottomDiff) < Math.abs(minYDiff)
      ) {
        minYDiff = bottomDiff;
        snapY = bottomDiff;

        guides.horizontal.push({
          position: rect.bottom,
          start: Math.min(movingRect.left, rect.left) - extendBy,
          end: Math.max(movingRect.right, rect.right) + extendBy,
        });
      }

      // Oben - Unten
      const topBottomDiff = rect.top - movingRect.bottom;
      if (
        Math.abs(topBottomDiff) < settings.threshold &&
        Math.abs(topBottomDiff) < Math.abs(minYDiff)
      ) {
        minYDiff = topBottomDiff;
        snapY = topBottomDiff;

        guides.horizontal.push({
          position: rect.top,
          start: Math.min(movingRect.left, rect.left) - extendBy,
          end: Math.max(movingRect.right, rect.right) + extendBy,
        });
      }

      // Unten - Oben
      const bottomTopDiff = rect.bottom - movingRect.top;
      if (
        Math.abs(bottomTopDiff) < settings.threshold &&
        Math.abs(bottomTopDiff) < Math.abs(minYDiff)
      ) {
        minYDiff = bottomTopDiff;
        snapY = bottomTopDiff;

        guides.horizontal.push({
          position: rect.bottom,
          start: Math.min(movingRect.left, rect.left) - extendBy,
          end: Math.max(movingRect.right, rect.right) + extendBy,
        });
      }
    });
  }

  // 3. Grid-Snapping
  if (settings.enableGrid && settings.gridSize > 0) {
    // Überprüfen, ob kein anderes Snapping bereits stattgefunden hat
    if (snapX === 0) {
      // Berechne nächste Grid-Position für die X-Achse
      const leftGridPos =
        Math.round(movingRect.left / settings.gridSize) * settings.gridSize;
      const leftDiff = leftGridPos - movingRect.left;

      if (
        Math.abs(leftDiff) < settings.threshold &&
        Math.abs(leftDiff) < Math.abs(minXDiff)
      ) {
        minXDiff = leftDiff;
        snapX = leftDiff;
      }
    }

    if (snapY === 0) {
      // Berechne nächste Grid-Position für die Y-Achse
      const topGridPos =
        Math.round(movingRect.top / settings.gridSize) * settings.gridSize;
      const topDiff = topGridPos - movingRect.top;

      if (
        Math.abs(topDiff) < settings.threshold &&
        Math.abs(topDiff) < Math.abs(minYDiff)
      ) {
        minYDiff = topDiff;
        snapY = topDiff;
      }
    }
  }

  return { snapX, snapY, guides };
}

/**
 * Holt alle Shapes aus dem Editor und konvertiert sie zu SnapRects
 */
export function getAllSnapRects(
  editor: Editor,
  excludeIds: TLShapeId[] = []
): SnapRect[] {
  return editor
    .getShapes()
    .filter((shape) => !excludeIds.includes(shape.id))
    .map(shapeToSnapRect);
}

/**
 * Aktualisiert die Position eines Shapes mit Snapping
 */
export function moveShapeWithSnapping(
  editor: Editor,
  shapeId: TLShapeId,
  deltaX: number,
  deltaY: number,
  settings = DEFAULT_SNAP_SETTINGS
): SnapResult {
  // Aktuelles Shape holen
  const shape = editor.getShape(shapeId);
  if (!shape) {
    return { snapX: 0, snapY: 0, guides: { vertical: [], horizontal: [] } };
  }

  // Andere Shapes für Snapping holen
  const otherShapes = getAllSnapRects(editor, [shapeId]);

  // Voraussichtliche neue Position nach Verschiebung
  const currentRect = shapeToSnapRect(shape);
  const previewRect: SnapRect = {
    ...currentRect,
    left: currentRect.left + deltaX,
    right: currentRect.right + deltaX,
    top: currentRect.top + deltaY,
    bottom: currentRect.bottom + deltaY,
    centerX: currentRect.centerX + deltaX,
    centerY: currentRect.centerY + deltaY,
  };

  // Snapping-Offsets berechnen
  const snapResult = calcSnappingOffsets(previewRect, otherShapes, settings);

  // Shape mit Snapping verschieben
  editor.updateShape({
    id: shapeId,
    type: shape.type,
    x: shape.x + deltaX + snapResult.snapX,
    y: shape.y + deltaY + snapResult.snapY,
  });

  return snapResult;
}

/**
 * Aktualisiert mehrere Shapes mit Snapping
 */
export function moveShapesWithSnapping(
  editor: Editor,
  shapeIds: TLShapeId[],
  deltaX: number,
  deltaY: number,
  settings = DEFAULT_SNAP_SETTINGS
): SnapResult {
  if (shapeIds.length === 0) {
    return { snapX: 0, snapY: 0, guides: { vertical: [], horizontal: [] } };
  }

  // Bei einem einzigen Shape direkt moveShapeWithSnapping verwenden
  if (shapeIds.length === 1) {
    return moveShapeWithSnapping(editor, shapeIds[0], deltaX, deltaY, settings);
  }

  // Bei mehreren Shapes: gemeinsame Bounding-Box berechnen
  const shapes = shapeIds.map((id) => editor.getShape(id)).filter(Boolean);

  if (shapes.length === 0) {
    return { snapX: 0, snapY: 0, guides: { vertical: [], horizontal: [] } };
  }

  // Andere Shapes für Snapping holen
  const otherShapes = getAllSnapRects(editor, shapeIds);

  // Gemeinsame Bounding-Box der ausgewählten Shapes berechnen
  let left = Infinity,
    top = Infinity,
    right = -Infinity,
    bottom = -Infinity;

  shapes.forEach((shape) => {
    if (!shape) return;
    const bounds = shape.bounds;

    left = Math.min(left, bounds.minX);
    top = Math.min(top, bounds.minY);
    right = Math.max(right, bounds.maxX);
    bottom = Math.max(bottom, bounds.maxY);
  });

  // Gemeinsame Bounding-Box als SnapRect erstellen
  const groupRect: SnapRect = {
    id: shapeIds[0], // Verwende die ID des ersten Shapes als Referenz
    left,
    top,
    right,
    bottom,
    centerX: (left + right) / 2,
    centerY: (top + bottom) / 2,
    width: right - left,
    height: bottom - top,
  };

  // Voraussichtliche neue Position nach Verschiebung
  const previewRect: SnapRect = {
    ...groupRect,
    left: groupRect.left + deltaX,
    right: groupRect.right + deltaX,
    top: groupRect.top + deltaY,
    bottom: groupRect.bottom + deltaY,
    centerX: groupRect.centerX + deltaX,
    centerY: groupRect.centerY + deltaY,
  };

  // Snapping-Offsets berechnen
  const snapResult = calcSnappingOffsets(previewRect, otherShapes, settings);

  // Alle Shapes mit Snapping verschieben
  editor.updateShapes(
    shapes.map((shape) => ({
      id: shape!.id,
      type: shape!.type,
      x: shape!.x + deltaX + snapResult.snapX,
      y: shape!.y + deltaY + snapResult.snapY,
    }))
  );

  return snapResult;
}
