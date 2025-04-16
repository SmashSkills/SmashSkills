import React, { useEffect, useState } from "react";
import { Editor, useEditor, TLShapeId } from "@tldraw/tldraw";
import {
  SnapResult,
  moveShapesWithSnapping,
  DEFAULT_SNAP_SETTINGS,
} from "./SnappingUtils";

// Props für die SnappingGuidesOverlay-Komponente
interface SnappingGuidesOverlayProps {
  enabled?: boolean;
  guideColor?: string;
  guideWidth?: number;
  snapSettings?: typeof DEFAULT_SNAP_SETTINGS;
}

/**
 * Komponente zum Anzeigen von Hilfslinien während des Snappings
 */
export const SnappingGuidesOverlay: React.FC<SnappingGuidesOverlayProps> = ({
  enabled = true,
  guideColor = "#3b82f6", // Blaue Hilfslinien
  guideWidth = 1.5,
  snapSettings = DEFAULT_SNAP_SETTINGS,
}) => {
  const editor = useEditor();
  const [guides, setGuides] = useState<SnapResult["guides"]>({
    vertical: [],
    horizontal: [],
  });
  const [isSnapping, setIsSnapping] = useState(false);
  const [lastPoint, setLastPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled || !editor) return;

    // Handler für Drag-Start
    const handlePointerDown = (info: any) => {
      // Nur tracken, wenn ein Shape ausgewählt ist
      if (info.target === "shape" && editor.getSelectedShapeIds().length > 0) {
        setIsSnapping(true);
        setLastPoint({ x: info.point.x, y: info.point.y });
        // Guides zurücksetzen
        setGuides({ vertical: [], horizontal: [] });
      }
    };

    // Handler für Drag-Ende
    const handlePointerUp = () => {
      if (isSnapping) {
        setIsSnapping(false);
        // Guides zurücksetzen
        setGuides({ vertical: [], horizontal: [] });
      }
    };

    // Handler für Drag-Bewegung
    const handlePointerMove = (info: any) => {
      if (!isSnapping || !info.point) return;

      // Cursor-Bewegung berechnen
      const deltaX = info.point.x - lastPoint.x;
      const deltaY = info.point.y - lastPoint.y;

      // Wenn keine signifikante Bewegung, nichts tun
      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) return;

      // Aktuelle Position für die nächste Berechnung speichern
      setLastPoint({ x: info.point.x, y: info.point.y });

      // Ausgewählte Shapes holen
      const selectedIds = editor.getSelectedShapeIds();
      if (selectedIds.length === 0) return;

      // Shapes mit Snapping bewegen und Guides aktualisieren
      const snapResult = moveShapesWithSnapping(
        editor,
        selectedIds,
        deltaX,
        deltaY,
        snapSettings
      );
      setGuides(snapResult.guides);
    };

    // Event-Listener für das Editor-Objekt registrieren
    editor.on("pointer-down", handlePointerDown);
    editor.on("pointer-move", handlePointerMove);
    editor.on("pointer-up", handlePointerUp);
    editor.on("cancel", handlePointerUp);
    editor.on("complete", handlePointerUp);

    // Cleanup-Funktion
    return () => {
      editor.off("pointer-down", handlePointerDown);
      editor.off("pointer-move", handlePointerMove);
      editor.off("pointer-up", handlePointerUp);
      editor.off("cancel", handlePointerUp);
      editor.off("complete", handlePointerUp);
    };
  }, [editor, enabled, isSnapping, lastPoint, snapSettings]);

  // Wenn keine Hilfslinien oder Komponente deaktiviert, nichts rendern
  if (!enabled || (!guides.vertical.length && !guides.horizontal.length)) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Vertikale Hilfslinien */}
      {guides.vertical.map((guide, index) => (
        <div
          key={`v-${index}`}
          className="absolute"
          style={{
            left: `${guide.position}px`,
            top: `${guide.start}px`,
            height: `${guide.end - guide.start}px`,
            width: `${guideWidth}px`,
            backgroundColor: guideColor,
            opacity: 0.8,
          }}
        />
      ))}

      {/* Horizontale Hilfslinien */}
      {guides.horizontal.map((guide, index) => (
        <div
          key={`h-${index}`}
          className="absolute"
          style={{
            top: `${guide.position}px`,
            left: `${guide.start}px`,
            width: `${guide.end - guide.start}px`,
            height: `${guideWidth}px`,
            backgroundColor: guideColor,
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Hook zum Aktivieren des Snapping-Verhaltens im Editor
 */
export function useSnapping(editor: Editor, options = DEFAULT_SNAP_SETTINGS) {
  const [isEnabled, setIsEnabled] = useState(true);

  // Snapping aktivieren/deaktivieren
  const toggleSnapping = () => {
    setIsEnabled(!isEnabled);
  };

  // Snapping-Einstellungen aktualisieren
  const updateSnapSettings = (
    newSettings: Partial<typeof DEFAULT_SNAP_SETTINGS>
  ) => {
    return { ...options, ...newSettings };
  };

  return {
    isEnabled,
    toggleSnapping,
    updateSnapSettings,
  };
}

/**
 * HOC (Higher-Order Component) zum Einbinden des Snappings in den Tldraw-Editor
 */
export function withSnappingEnabled<T extends React.ComponentType<any>>(
  WrappedComponent: T,
  options = DEFAULT_SNAP_SETTINGS
): React.FC<React.ComponentProps<T>> {
  return (props) => {
    return (
      <>
        <WrappedComponent {...props} />
        <SnappingGuidesOverlay enabled={true} snapSettings={options} />
      </>
    );
  };
}
