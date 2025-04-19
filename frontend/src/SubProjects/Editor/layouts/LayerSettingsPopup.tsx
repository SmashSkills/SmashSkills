import React, { useCallback } from "react";
import {
  Editor,
  track,
  TLShape,
  TLTextShape,
  TLTextShapeProps,
} from "@tldraw/tldraw";
import { CustomGeoShape } from "../components/custom-shapes/CustomGeoShapeUtil";
import { LayerDividerShape } from "../components/custom-shapes/LayerDividerShapeUtil";

interface LayerSettingsPopupProps {
  editor: Editor;
  isVisible: boolean;
}

// Helper-Funktion für den Shape-Namen
function getShapeDisplayName(editor: Editor, shape: TLShape): string {
  if (editor.isShapeOfType<TLTextShape>(shape, "text")) {
    const props = shape.props as TLTextShapeProps;
    const textValue = props.text || "";
    const truncatedText = textValue.substring(0, 20);
    return `Text: "${truncatedText}${textValue.length > 20 ? "..." : ""}"`;
  }
  if (editor.isShapeOfType<CustomGeoShape>(shape, "custom-geo")) {
    return `Form: ${shape.props.geo}`;
  }
  return shape.type;
}

export const LayerSettingsPopup = track(
  ({ editor, isVisible }: LayerSettingsPopupProps) => {
    const shapes = editor.getCurrentPageShapes();
    const selectedShapeIds = editor.getSelectedShapeIds();

    // Zählt, wie viele Divider bereits existieren, für die Namensgebung
    const layerDividerCount = shapes.filter((s) => s.type === "layer-divider")
      .length;

    // Funktion zum Hinzufügen eines neuen Layers (Dividers)
    const handleAddLayer = useCallback(() => {
      const newLayerName = `Layer ${layerDividerCount + 1}`;
      // Erstelle die Divider-Shape - Position ist irrelevant, da unsichtbar
      editor.createShape<LayerDividerShape>({
        type: "layer-divider",
        x: 0,
        y: 0,
        props: {
          name: newLayerName,
          w: 1,
          h: 1,
        },
      });
      // Optional: Divider direkt nach vorne bringen?
      // const newShape = editor.getShape(editor.getSelectedShapeIds()[0]); // Annahme: wird direkt selektiert?
      // if (newShape) editor.bringToFront([newShape.id]);
    }, [editor, layerDividerCount]);

    if (!isVisible) return null;

    return (
      <div className="p-4 bg-white shadow-md rounded-lg max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3 border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-800">
            Objekte & Layer
          </h3>
          <button
            onClick={handleAddLayer}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-600"
            title="Neuen Layer hinzufügen"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>

        {shapes.length === 0 ? (
          <p className="text-sm text-gray-500">
            Keine Objekte auf dieser Seite.
          </p>
        ) : (
          <ul className="space-y-1">
            {[...shapes].reverse().map((shape: TLShape) => {
              if (
                editor.isShapeOfType<LayerDividerShape>(shape, "layer-divider")
              ) {
                return (
                  <li key={shape.id} className="pt-3 pb-1 px-1">
                    <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                      {shape.props.name}
                    </h4>
                    <hr className="mt-1 border-gray-300" />
                  </li>
                );
              }

              return (
                <li
                  key={shape.id}
                  className={`text-sm px-2 py-1 rounded hover:bg-gray-100 cursor-pointer ${
                    selectedShapeIds.includes(shape.id)
                      ? "bg-blue-100 text-blue-800 font-medium"
                      : "text-gray-700"
                  }`}
                  onClick={() => editor.select(shape.id)}
                  title={`Typ: ${shape.type}, ID: ${shape.id}`}
                >
                  {getShapeDisplayName(editor, shape)}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }
);

export default LayerSettingsPopup;
