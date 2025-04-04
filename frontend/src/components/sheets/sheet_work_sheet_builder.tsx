import React, { useEffect, useState, ReactNode } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Canvas, Rect, Circle } from "fabric";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { PDFDocument } from "pdf-lib";

interface SheetWorkSheetBuilderProps {
  initialContent?: string;
}

interface DraggableShapeProps {
  id: string;
  children: ReactNode;
}

const DraggableShape: React.FC<DraggableShapeProps> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: id,
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      {children}
    </div>
  );
};

const SheetWorkSheetBuilder: React.FC<SheetWorkSheetBuilderProps> = ({
  initialContent = "",
}) => {
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
  });

  const { setNodeRef: setDropRef } = useDroppable({
    id: "canvas-drop-area",
  });

  useEffect(() => {
    const fabricCanvas = new Canvas("canvas", {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
    });
    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  const addShape = (type: "rectangle" | "circle") => {
    if (!canvas) return;

    let shape;
    switch (type) {
      case "rectangle":
        shape = new Rect({
          left: 100,
          top: 100,
          width: 100,
          height: 100,
          fill: "#ff0000",
        });
        break;
      case "circle":
        shape = new Circle({
          left: 100,
          top: 100,
          radius: 50,
          fill: "#0000ff",
        });
        break;
    }
    if (shape) {
      canvas.add(shape);
      canvas.renderAll();
    }
  };

  const exportToPDF = async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([800, 600]);

    // Hier würde die Konvertierung von Canvas zu PDF implementiert
    // Dies ist ein vereinfachtes Beispiel
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-4">
        <div className="toolbar flex gap-2">
          <DraggableShape id="rectangle">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => addShape("rectangle")}
            >
              Rechteck
            </button>
          </DraggableShape>
          <DraggableShape id="circle">
            <button
              className="px-4 py-2 bg-green-500 text-white rounded"
              onClick={() => addShape("circle")}
            >
              Kreis
            </button>
          </DraggableShape>
        </div>
      </div>

      <DndContext>
        <div
          ref={setDropRef}
          className="canvas-container border-2 border-gray-300 rounded"
        >
          <canvas id="canvas" />
        </div>
      </DndContext>

      <div className="editor-container border-2 border-gray-300 rounded p-4">
        <EditorContent editor={editor} />
      </div>

      <button
        className="px-4 py-2 bg-purple-500 text-white rounded"
        onClick={exportToPDF}
      >
        Als PDF exportieren
      </button>
    </div>
  );
};

export default SheetWorkSheetBuilder;
