import { Editor, TLShape, TLShapeId } from "@tldraw/tldraw";

export type SnappingManager = ReturnType<typeof createSnappingManager>;

export interface SnapPoint {
  x: number;
  y: number;
  type: "corner" | "edge" | "center";
}

/**
 * Erstellt einen Snapping Manager für TLDraw
 * @param editor Editor-Instanz
 * @returns Snapping Manager Objekt
 */
export function createSnappingManager(editor: Editor) {
  // Speichert die Snap-Punkte für die aktuell bewegten Shapes
  let currentSnapPoints: SnapPoint[] = [];

  // Schwellenwert für Snapping
  const snapThreshold = 5; // Pixel

  // Berechnet die Snap-Punkte für ein Shape basierend auf seinen Bounds
  const getSnapPointsForShape = (shape: TLShape | TLShapeId): SnapPoint[] => {
    try {
      const id = typeof shape === "string" ? shape : shape.id;
      const bounds = editor.getShapePageBounds(id);

      if (!bounds) return [];

      const { minX, minY, maxX, maxY } = bounds;
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      return [
        // Ecken
        { x: minX, y: minY, type: "corner" }, // Oben links
        { x: maxX, y: minY, type: "corner" }, // Oben rechts
        { x: minX, y: maxY, type: "corner" }, // Unten links
        { x: maxX, y: maxY, type: "corner" }, // Unten rechts

        // Mittelpunkte der Kanten
        { x: centerX, y: minY, type: "edge" }, // Mitte oben
        { x: centerX, y: maxY, type: "edge" }, // Mitte unten
        { x: minX, y: centerY, type: "edge" }, // Mitte links
        { x: maxX, y: centerY, type: "edge" }, // Mitte rechts

        // Zentrum
        { x: centerX, y: centerY, type: "center" },
      ];
    } catch (error) {
      console.warn("Fehler beim Berechnen der Snap-Punkte:", error);
      return [];
    }
  };

  // Berechnet für einen Punkt die nächsten Snap-Punkte aller anderen Shapes
  const findClosestSnapPoints = (
    point: { x: number; y: number },
    movingShapeIds: TLShapeId[]
  ): { x: number | null; y: number | null } => {
    // Alle anderen Shapes (nicht die bewegten)
    const otherShapes = editor.store
      .allRecords()
      .filter(
        (record) =>
          "type" in record && !movingShapeIds.includes(record.id as TLShapeId)
      );

    // Sammle alle Snap-Punkte von anderen Shapes
    const allSnapPoints: SnapPoint[] = [];
    for (const shape of otherShapes) {
      if ("id" in shape) {
        const shapeSnapPoints = getSnapPointsForShape(shape.id as TLShapeId);
        allSnapPoints.push(...shapeSnapPoints);
      }
    }

    // Finde die nächsten Snap-Punkte in X- und Y-Richtung
    let closestX: number | null = null;
    let closestY: number | null = null;
    let minDeltaX = snapThreshold;
    let minDeltaY = snapThreshold;

    for (const snapPoint of allSnapPoints) {
      const deltaX = Math.abs(snapPoint.x - point.x);
      const deltaY = Math.abs(snapPoint.y - point.y);

      if (deltaX < minDeltaX) {
        minDeltaX = deltaX;
        closestX = snapPoint.x;
      }

      if (deltaY < minDeltaY) {
        minDeltaY = deltaY;
        closestY = snapPoint.y;
      }
    }

    return { x: closestX, y: closestY };
  };

  // Berechnet den Snap-Offset für ein bewegtes Shape
  const getSnappedDelta = (
    movingShapeIds: TLShapeId[],
    dx: number,
    dy: number
  ): { dx: number; dy: number } => {
    if (editor.user.getIsSnapMode()) {
      // Für jedes bewegte Shape die Snap-Punkte berechnen
      currentSnapPoints = [];
      for (const id of movingShapeIds) {
        const shape = editor.getShape(id);
        if (shape) {
          // Snap-Punkte basierend auf der aktuellen Position
          const bounds = editor.getShapePageBounds(id);
          if (bounds) {
            // Snap-Punkte für das bewegte Shape berechnen
            const snapPoints = getSnapPointsForShape(id).map((point) => ({
              ...point,
              x: point.x + dx,
              y: point.y + dy,
            }));

            currentSnapPoints.push(...snapPoints);

            // Für jeden Snap-Punkt die nächsten Snap-Punkte finden
            for (const point of snapPoints) {
              const { x: snappedX, y: snappedY } = findClosestSnapPoints(
                point,
                movingShapeIds
              );

              // Wenn wir einen Snap in X-Richtung gefunden haben, aktualisiere den Delta-X-Wert
              if (snappedX !== null) {
                dx = snappedX - (point.x - dx);
              }

              // Wenn wir einen Snap in Y-Richtung gefunden haben, aktualisiere den Delta-Y-Wert
              if (snappedY !== null) {
                dy = snappedY - (point.y - dy);
              }
            }
          }
        }
      }
    }

    return { dx, dy };
  };

  // Aktiviert oder deaktiviert den Snapping-Modus
  const toggleSnapping = () => {
    const isSnapMode = editor.user.getIsSnapMode();
    editor.user.updateUserPreferences({ isSnapMode: !isSnapMode });
  };

  // Gibt zurück, ob Snapping aktiviert ist
  const isSnappingEnabled = (): boolean => {
    return editor.user.getIsSnapMode();
  };

  return {
    getSnappedDelta,
    toggleSnapping,
    isSnappingEnabled,
  };
}
