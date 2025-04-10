import React, { useRef, useState } from "react";
import LayoutToolbarTop from "../layouts/worksheet/layout_toolbar_top";
import { Stage, Layer } from "react-konva";
import { exportToPDF } from "../util/pdf_logic/pdf_export";
import { TextProps, TextElement } from "../layouts/worksheet/text/add_text";
import {
  ShapeProps,
  ShapeElement,
  ShapeType,
} from "../layouts/worksheet/shape/add_shape";
import Konva from "konva";

interface WorksheetElement {
  id: string;
  type: "text" | "shape";
  props: TextProps | ShapeProps;
}

const DesignEditorPage: React.FC = () => {
  const worksheetRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const [elements, setElements] = useState<WorksheetElement[]>([]);
  const [, setSelectedId] = useState<string | null>(null);

  const handleToolSelect = (tool: string) => {
    console.log(`Werkzeug ausgewählt: ${tool}`);

    if (tool === "export") {
      handlePDFExport();
    }
  };

  const handlePDFExport = () => {
    if (worksheetRef.current) {
      exportToPDF(worksheetRef, {
        pageSize: "A4",
        margins: {
          top: "0mm",
          right: "0mm",
          bottom: "0mm",
          left: "0mm",
        },
        pageBreakSelectors: [".sheet-container"],
        hideClasses: ["print:hidden"],
        printSectionId: "worksheet-print-section",
      });
    } else {
      console.error("Worksheet-Referenz ist nicht verfügbar");
    }
  };

  const handleAddText = (textProps: TextProps) => {
    setElements((prev) => [
      ...prev,
      {
        id: textProps.id,
        type: "text",
        props: textProps,
      },
    ]);
  };

  const handleAddShape = (shapeProps: ShapeProps) => {
    setElements((prev) => [
      ...prev,
      {
        id: shapeProps.id,
        type: "shape",
        props: shapeProps,
      },
    ]);
  };

  const handleUpdateElement = (
    id: string,
    updates: Partial<TextProps | ShapeProps>
  ) => {
    setElements((prev) =>
      prev.map((element) =>
        element.id === id
          ? { ...element, props: { ...element.props, ...updates } }
          : element
      )
    );
  };

  const handleSelectElement = (id: string | null) => {
    setSelectedId(id);
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Wenn auf die Bühne geklickt wird und nicht auf ein Element
    if (e.target === e.currentTarget) {
      handleSelectElement(null);
    }
  };

  const worksheetContent = (
    <Stage
      ref={stageRef}
      width={794} // DIN A4 Breite
      height={1123} // DIN A4 Höhe
      onClick={handleStageClick}
    >
      <Layer>
        {/* Hintergrund */}
        <ShapeElement
          shapeProps={{
            id: "background",
            type: ShapeType.RECTANGLE,
            x: 0,
            y: 0,
            width: 794,
            height: 1123,
            fill: "white",
          }}
        />

        {/* Elemente rendern */}
        {elements.map((element) => {
          if (element.type === "text") {
            return (
              <TextElement
                key={element.id}
                textProps={element.props as TextProps}
                onSelect={() => handleSelectElement(element.id)}
                onUpdate={handleUpdateElement}
              />
            );
          } else if (element.type === "shape") {
            return (
              <ShapeElement
                key={element.id}
                shapeProps={element.props as ShapeProps}
                onSelect={() => handleSelectElement(element.id)}
                onUpdate={handleUpdateElement}
              />
            );
          }

          return null;
        })}
      </Layer>
    </Stage>
  );

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col pb-10">
      <div className="w-full bg-white shadow-lg z-30">
        <LayoutToolbarTop
          onToolSelect={handleToolSelect}
          stageRef={stageRef}
          onAddText={handleAddText}
          onAddShape={handleAddShape}
        />
      </div>
      <div className="flex-1 overflow-auto">
        <div className="flex justify-center items-center p-8 min-h-full overflow-auto">
          <div
            ref={worksheetRef}
            className="rounded-lg shadow-lg mb-8 sheet-container"
            style={{
              width: `794px`,
              height: `1123px`,
              minHeight: `1123px`,
            }}
          >
            {worksheetContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignEditorPage;
