import React, { useState, useEffect } from "react";
import { Editor } from "@tldraw/tldraw";

// Define TLBounds interface because it's not directly exported by tldraw
interface TLBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface SheetGuideFormat {
  name: string;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  showCenterLines: boolean;
}

export interface SheetGuideSettings {
  enabled: boolean;
  showMargins: boolean;
  showCenterLines: boolean;
  currentFormat: SheetGuideFormat;
  formats: SheetGuideFormat[];
}

// Konstanten für das Snapping
export const SNAP_TOLERANCE = 12; // Snap-Toleranz in Pixeln - erhöht für besseres Einrasten

export const DEFAULT_SHEET_FORMATS: SheetGuideFormat[] = [
  {
    name: "Standard",
    marginTop: 40,
    marginRight: 40,
    marginBottom: 40,
    marginLeft: 40,
    showCenterLines: true,
  },
  {
    name: "Breit",
    marginTop: 30,
    marginRight: 60,
    marginBottom: 30,
    marginLeft: 60,
    showCenterLines: true,
  },
  {
    name: "Schmal",
    marginTop: 60,
    marginRight: 30,
    marginBottom: 60,
    marginLeft: 30,
    showCenterLines: true,
  },
  {
    name: "Kein Rand",
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    showCenterLines: true,
  },
];

export type SheetGuideManager = ReturnType<typeof createSheetGuideManager>;

/**
 * Erstellt einen Manager für Sheet-Hilfslinien mit Event-System für reaktives Verhalten
 * @param editor Editor-Instanz
 * @param width Breite des Sheets
 * @param height Höhe des Sheets
 * @returns SheetGuideManager
 */
export function createSheetGuideManager(
  editor: Editor,
  width: number,
  height: number
) {
  // Initial-Einstellungen
  const initialSettings: SheetGuideSettings = {
    enabled: true,
    showMargins: true,
    showCenterLines: true,
    currentFormat: DEFAULT_SHEET_FORMATS[0],
    formats: DEFAULT_SHEET_FORMATS,
  };

  // State für die Einstellungen
  let settings = { ...initialSettings };

  // Event-System für reaktives Verhalten
  type EventListener = () => void;
  const listeners: EventListener[] = [];

  const subscribe = (listener: EventListener) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  };

  const notifyListeners = () => {
    listeners.forEach((listener) => listener());
  };

  /**
   * Berechnet den Snap-Offset für die X-Koordinate basierend auf den Sheet-Hilfslinien
   */
  const calculateSnapOffsetX = (
    shapeBounds: TLBounds,
    tolerance: number = SNAP_TOLERANCE
  ): number => {
    if (!settings.enabled) return 0;

    const { marginLeft, marginRight } = settings.currentFormat;

    // Berechnung der Guidelines
    const leftMargin = marginLeft;
    const rightMargin = width - marginRight;
    const centerLine = width / 2;

    // Berechnung der relevanten Punkte des Shapes
    const shapeLeft = shapeBounds.minX;
    const shapeRight = shapeBounds.maxX;
    const shapeCenter = (shapeLeft + shapeRight) / 2;
    const shapeWidth = shapeBounds.width;

    let offsetX = 0;
    let minDistance = tolerance;

    // Hilfsfunktion zum Prüfen und Setzen des Offsets
    const checkAndSetOffset = (shapePos: number, targetPos: number) => {
      const distance = Math.abs(shapePos - targetPos);
      if (distance < minDistance) {
        minDistance = distance;
        offsetX = targetPos - shapePos;
        return true;
      }
      return false;
    };

    // Prüfe verschiedene Snap-Möglichkeiten mit Priorität

    // 1. Snapping für Mittellinie (höchste Priorität)
    if (settings.showCenterLines) {
      // Mittelpunkt des Shapes zur Mittellinie
      if (checkAndSetOffset(shapeCenter, centerLine)) return offsetX;

      // Linke Kante zur Mittellinie
      if (checkAndSetOffset(shapeLeft, centerLine)) return offsetX;

      // Rechte Kante zur Mittellinie
      if (checkAndSetOffset(shapeRight, centerLine)) return offsetX;
    }

    // 2. Snapping für Marginlinien
    if (settings.showMargins) {
      // Linke Kante zum linken Rand
      if (checkAndSetOffset(shapeLeft, leftMargin)) return offsetX;

      // Rechte Kante zum rechten Rand
      if (checkAndSetOffset(shapeRight, rightMargin)) return offsetX;

      // Rechte Kante zum linken Rand (Objekt endet am linken Rand)
      if (checkAndSetOffset(shapeRight, leftMargin)) return offsetX;

      // Linke Kante zum rechten Rand (Objekt beginnt am rechten Rand)
      if (checkAndSetOffset(shapeLeft, rightMargin)) return offsetX;

      // Objekt zentriert zwischen den Rändern (falls es passt)
      const contentWidth = rightMargin - leftMargin;
      if (shapeWidth <= contentWidth) {
        const contentCenter = leftMargin + contentWidth / 2;
        if (checkAndSetOffset(shapeCenter, contentCenter)) return offsetX;
      }
    }

    return offsetX;
  };

  /**
   * Berechnet den Snap-Offset für die Y-Koordinate basierend auf den Sheet-Hilfslinien
   */
  const calculateSnapOffsetY = (
    shapeBounds: TLBounds,
    tolerance: number = SNAP_TOLERANCE
  ): number => {
    if (!settings.enabled) return 0;

    const { marginTop, marginBottom } = settings.currentFormat;

    // Berechnung der Guidelines
    const topMargin = marginTop;
    const bottomMargin = height - marginBottom;
    const centerLine = height / 2;

    // Berechnung der relevanten Punkte des Shapes
    const shapeTop = shapeBounds.minY;
    const shapeBottom = shapeBounds.maxY;
    const shapeCenter = (shapeTop + shapeBottom) / 2;
    const shapeHeight = shapeBounds.height;

    let offsetY = 0;
    let minDistance = tolerance;

    // Hilfsfunktion zum Prüfen und Setzen des Offsets
    const checkAndSetOffset = (shapePos: number, targetPos: number) => {
      const distance = Math.abs(shapePos - targetPos);
      if (distance < minDistance) {
        minDistance = distance;
        offsetY = targetPos - shapePos;
        return true;
      }
      return false;
    };

    // Prüfe verschiedene Snap-Möglichkeiten mit Priorität

    // 1. Snapping für Mittellinie (höchste Priorität)
    if (settings.showCenterLines) {
      // Mittelpunkt des Shapes zur Mittellinie
      if (checkAndSetOffset(shapeCenter, centerLine)) return offsetY;

      // Obere Kante zur Mittellinie
      if (checkAndSetOffset(shapeTop, centerLine)) return offsetY;

      // Untere Kante zur Mittellinie
      if (checkAndSetOffset(shapeBottom, centerLine)) return offsetY;
    }

    // 2. Snapping für Marginlinien
    if (settings.showMargins) {
      // Obere Kante zum oberen Rand
      if (checkAndSetOffset(shapeTop, topMargin)) return offsetY;

      // Untere Kante zum unteren Rand
      if (checkAndSetOffset(shapeBottom, bottomMargin)) return offsetY;

      // Untere Kante zum oberen Rand (Objekt endet am oberen Rand)
      if (checkAndSetOffset(shapeBottom, topMargin)) return offsetY;

      // Obere Kante zum unteren Rand (Objekt beginnt am unteren Rand)
      if (checkAndSetOffset(shapeTop, bottomMargin)) return offsetY;

      // Objekt zentriert zwischen den Rändern (falls es passt)
      const contentHeight = bottomMargin - topMargin;
      if (shapeHeight <= contentHeight) {
        const contentCenter = topMargin + contentHeight / 2;
        if (checkAndSetOffset(shapeCenter, contentCenter)) return offsetY;
      }
    }

    return offsetY;
  };

  /**
   * Berechnet den Snap-Offset für ein Shape basierend auf den Sheet-Hilfslinien
   * @param shapeBounds Die Bounds des Shapes
   * @param tolerance Toleranzbereich für das Snapping in Pixeln
   * @returns {x, y} Offset-Werte für das Snapping
   */
  const calculateSnapOffset = (
    shapeBounds: TLBounds,
    tolerance: number = SNAP_TOLERANCE
  ) => {
    const offsetX = calculateSnapOffsetX(shapeBounds, tolerance);
    const offsetY = calculateSnapOffsetY(shapeBounds, tolerance);

    return { offsetX, offsetY };
  };

  // Hilfslinie-Komponente
  const SheetGuideline: React.FC<{
    direction: "horizontal" | "vertical" | "box";
    position?: number;
    top?: number;
    left?: number;
    width?: number;
    height?: number;
    color?: string;
    dashed?: boolean;
  }> = ({ direction, position, top, left, width, height, color, dashed }) => {
    // Standardfarbe setzen
    const lineColor = color || "rgba(30, 144, 255, 0.5)"; // Leichtes Blau für Hilfslinien

    if (
      direction === "box" &&
      top !== undefined &&
      left !== undefined &&
      width !== undefined &&
      height !== undefined
    ) {
      return (
        <div
          style={{
            position: "absolute",
            top: `${top}px`,
            left: `${left}px`,
            width: `${width}px`,
            height: `${height}px`,
            border: `1px ${dashed ? "dashed" : "solid"} ${lineColor}`,
            pointerEvents: "none",
            zIndex: 100,
          }}
        />
      );
    }

    const style: React.CSSProperties =
      direction === "horizontal"
        ? {
            position: "absolute",
            left: 0,
            top: `${position}px`,
            width: "100%",
            height: "1px",
            backgroundColor: lineColor,
            borderBottom: dashed ? `1px dashed ${lineColor}` : "none",
            pointerEvents: "none",
            zIndex: 100,
          }
        : {
            position: "absolute",
            left: `${position}px`,
            top: 0,
            width: "1px",
            height: "100%",
            backgroundColor: lineColor,
            borderRight: dashed ? `1px dashed ${lineColor}` : "none",
            pointerEvents: "none",
            zIndex: 100,
          };

    return <div style={style} />;
  };

  // Reaktive Komponente zum Rendern der Hilfslinien
  const SheetGuidelines: React.FC = () => {
    // Verwende einen lokalen State, um die Komponente bei Änderungen neu zu rendern
    const [guideSettings, setGuideSettings] = useState(settings);

    // Abonniere Änderungen an den Settings
    useEffect(() => {
      const unsubscribe = subscribe(() => {
        setGuideSettings({ ...settings });
      });

      return unsubscribe;
    }, []);

    if (!guideSettings.enabled) return null;

    const guidelines = [];
    const { currentFormat } = guideSettings;

    // Randlinien hinzufügen, wenn aktiviert
    if (guideSettings.showMargins) {
      // Rand-Box zeichnen
      guidelines.push(
        <SheetGuideline
          key="margin-box"
          direction="box"
          top={currentFormat.marginTop}
          left={currentFormat.marginLeft}
          width={width - currentFormat.marginLeft - currentFormat.marginRight}
          height={height - currentFormat.marginTop - currentFormat.marginBottom}
          color="rgba(100, 100, 255, 0.4)"
          dashed={true}
        />
      );
    }

    // Zentrumslinien hinzufügen, wenn aktiviert
    if (guideSettings.showCenterLines || currentFormat.showCenterLines) {
      // Horizontale Mittellinie
      guidelines.push(
        <SheetGuideline
          key="center-h"
          direction="horizontal"
          position={height / 2}
          color="rgba(255, 100, 100, 0.4)"
        />
      );

      // Vertikale Mittellinie
      guidelines.push(
        <SheetGuideline
          key="center-v"
          direction="vertical"
          position={width / 2}
          color="rgba(255, 100, 100, 0.4)"
        />
      );
    }

    return <>{guidelines}</>;
  };

  return {
    SheetGuidelines,

    // Abonnieren von Änderungen für reaktives Verhalten
    subscribe,

    // Einstellungen abrufen
    getSettings: () => settings,

    // Aktiviert/deaktiviert die Hilfslinien
    toggleEnabled: () => {
      settings = {
        ...settings,
        enabled: !settings.enabled,
      };
      notifyListeners();
      return settings.enabled;
    },

    // Aktiviert/deaktiviert die Randlinien
    toggleMargins: () => {
      settings = {
        ...settings,
        showMargins: !settings.showMargins,
      };
      notifyListeners();
      return settings.showMargins;
    },

    // Aktiviert/deaktiviert die Zentrumslinien
    toggleCenterLines: () => {
      settings = {
        ...settings,
        showCenterLines: !settings.showCenterLines,
      };
      notifyListeners();
      return settings.showCenterLines;
    },

    // Setzt das aktuelle Format
    setFormat: (formatName: string) => {
      const format = settings.formats.find((f) => f.name === formatName);
      if (format) {
        settings = {
          ...settings,
          currentFormat: format,
        };
        notifyListeners();
      }
      return settings.currentFormat;
    },

    // Fügt ein neues Format hinzu
    addFormat: (format: SheetGuideFormat) => {
      settings = {
        ...settings,
        formats: [...settings.formats, format],
      };
      notifyListeners();
      return settings.formats;
    },

    // Setzt alle Einstellungen zurück
    resetSettings: () => {
      settings = { ...initialSettings };
      notifyListeners();
      return settings;
    },

    // Hilfs- und Snap-Funktionen
    calculateSnapOffset,
  };
}
