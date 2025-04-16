import React from "react";
import { Editor, TLShapeId } from "@tldraw/tldraw";

// Definiere TLBounds Typ, der in tldraw vorhanden sein sollte
export interface TLBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export type GuidelinesManager = ReturnType<typeof createGuidelinesManager>;

/**
 * Erstellt einen Guidelines Manager für TLDraw
 * @param editor Editor-Instanz
 * @returns Guidelines Manager Objekt
 */
export function createGuidelinesManager(editor: Editor) {
  // Speichert die aktuellen Hilfslinien
  const guidelines = {
    horizontal: new Map<number, { ids: TLShapeId[] }>(),
    vertical: new Map<number, { ids: TLShapeId[] }>(),
  };

  // Cache für die Bounds der Shapes
  const boundsCache = new Map<TLShapeId, TLBounds>();

  // Hilfslinie-Komponente
  const Guideline: React.FC<{
    direction: "horizontal" | "vertical";
    position: number;
  }> = ({ direction, position }) => {
    const style: React.CSSProperties =
      direction === "horizontal"
        ? {
            position: "absolute",
            left: 0,
            top: `${position}px`,
            width: "100%",
            height: "1px",
            backgroundColor: "hsl(212, 95%, 55%)",
            pointerEvents: "none",
            zIndex: 999,
          }
        : {
            position: "absolute",
            left: `${position}px`,
            top: 0,
            width: "1px",
            height: "100%",
            backgroundColor: "hsl(212, 95%, 55%)",
            pointerEvents: "none",
            zIndex: 999,
          };

    return <div style={style} />;
  };

  const updateBoundsCache = () => {
    boundsCache.clear();
    // Alle Shapes laden (außer das aktuell ausgewählte)
    const shapesToConsider = editor.store.allRecords().filter((record) => {
      // Nur Shapes berücksichtigen
      if (!("type" in record)) return false;

      // Ausgewählte Shapes ausschließen
      return !editor.getSelectedShapeIds().includes(record.id as TLShapeId);
    });

    // Bounds für jedes Shape cachen
    for (const shape of shapesToConsider) {
      if ("id" in shape) {
        try {
          // Versuche die Bounds zu bekommen und casten
          const bounds = editor.getShapePageBounds(shape.id as TLShapeId);
          if (bounds) {
            boundsCache.set(
              shape.id as TLShapeId,
              (bounds as unknown) as TLBounds
            );
          }
        } catch {
          // Ignoriere Fehler, wenn es kein gültiges Shape ist
          console.warn("Konnte Bounds für Shape nicht berechnen", shape.id);
        }
      }
    }
  };

  // Aktuelle Hilfslinien abrufen basierend auf den sich bewegenden Shapes
  const getGuidelines = (
    movingShapeBounds: TLBounds
  ): { horizontal: number[]; vertical: number[] } => {
    const result = {
      horizontal: new Set<number>(),
      vertical: new Set<number>(),
    };

    const threshold = 5; // Threshold in Pixeln für Snap

    // Wichtige Punkte des bewegten Shapes
    const movingTop = movingShapeBounds.minY;
    const movingBottom = movingShapeBounds.maxY;
    const movingLeft = movingShapeBounds.minX;
    const movingRight = movingShapeBounds.maxX;
    const movingCenterX = (movingLeft + movingRight) / 2;
    const movingCenterY = (movingTop + movingBottom) / 2;

    // Prüfe gegen alle anderen Shapes
    boundsCache.forEach((targetBounds) => {
      // Horizontale Hilfslinien prüfen
      const targetTop = targetBounds.minY;
      const targetBottom = targetBounds.maxY;
      const targetCenterY = (targetTop + targetBottom) / 2;

      // Prüfe Ausrichtung (top, center, bottom)
      if (Math.abs(movingTop - targetTop) < threshold) {
        result.horizontal.add(targetTop);
      }
      if (Math.abs(movingBottom - targetBottom) < threshold) {
        result.horizontal.add(targetBottom);
      }
      if (Math.abs(movingCenterY - targetCenterY) < threshold) {
        result.horizontal.add(targetCenterY);
      }
      if (Math.abs(movingTop - targetBottom) < threshold) {
        result.horizontal.add(targetBottom);
      }
      if (Math.abs(movingBottom - targetTop) < threshold) {
        result.horizontal.add(targetTop);
      }

      // Vertikale Hilfslinien prüfen
      const targetLeft = targetBounds.minX;
      const targetRight = targetBounds.maxX;
      const targetCenterX = (targetLeft + targetRight) / 2;

      // Prüfe Ausrichtung (left, center, right)
      if (Math.abs(movingLeft - targetLeft) < threshold) {
        result.vertical.add(targetLeft);
      }
      if (Math.abs(movingRight - targetRight) < threshold) {
        result.vertical.add(targetRight);
      }
      if (Math.abs(movingCenterX - targetCenterX) < threshold) {
        result.vertical.add(targetCenterX);
      }
      if (Math.abs(movingLeft - targetRight) < threshold) {
        result.vertical.add(targetRight);
      }
      if (Math.abs(movingRight - targetLeft) < threshold) {
        result.vertical.add(targetLeft);
      }
    });

    return {
      horizontal: [...result.horizontal],
      vertical: [...result.vertical],
    };
  };

  // Zeichnet die Hilfslinien auf dem Canvas
  const Guidelines: React.FC = () => {
    const allGuidelines = [
      ...[...guidelines.horizontal.entries()].map(([position]) => (
        <Guideline
          key={`h-${position}`}
          direction="horizontal"
          position={position}
        />
      )),
      ...[...guidelines.vertical.entries()].map(([position]) => (
        <Guideline
          key={`v-${position}`}
          direction="vertical"
          position={position}
        />
      )),
    ];

    return <>{allGuidelines}</>;
  };

  return {
    Guidelines,
    updateBoundsCache,
    getGuidelines,

    // Aktualisiere die Hilfslinien-Daten
    updateGuidelines: (bounds: TLBounds, shapeId: TLShapeId) => {
      // Bestehende Hilfslinien löschen
      guidelines.horizontal.clear();
      guidelines.vertical.clear();

      if (!editor.isShapeOrAncestorLocked(shapeId)) {
        // Neue Hilfslinien berechnen
        const { horizontal, vertical } = getGuidelines(bounds);

        // Hilfslinien speichern
        horizontal.forEach((position) => {
          guidelines.horizontal.set(position, { ids: [shapeId] });
        });

        vertical.forEach((position) => {
          guidelines.vertical.set(position, { ids: [shapeId] });
        });
      }
    },

    // Löscht alle Hilfslinien
    clearGuidelines: () => {
      guidelines.horizontal.clear();
      guidelines.vertical.clear();
    },
  };
}
