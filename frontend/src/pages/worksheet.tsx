import React, { useState, useCallback } from "react";
import { Editor } from "@tiptap/react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import LayoutWorkSheet from "../layouts/sheets/worksheet_layouts/layout_work_sheet";
import LayoutCurriculaSidebar from "../layouts/sheets/worksheet_layouts/layout_curricula_sidebar";
import LayoutBuildingBlockSidebar from "../layouts/sheets/worksheet_layouts/layout_building_block_sidebar";
import LayoutTipTapAddonBar from "../layouts/sheets/worksheet_layouts/layout_tiptap_addon_bar";
import ShapeOverlay from "../components/building_blocks/ShapeOverlay";
// Importiere Typen aus der neuen zentralen Datei
import type {
  ShapeDragData,
  DropTargetInfo,
} from "../layouts/sheets/worksheet_layouts/worksheet.types";

interface WorksheetEditorProps {
  className?: string;
}

const WorksheetEditor: React.FC<WorksheetEditorProps> = () => {
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDragData, setActiveDragData] = useState<ShapeDragData | null>(
    null
  );
  const [dropTargetInfo, setDropTargetInfo] = useState<DropTargetInfo | null>(
    null
  ); // Neuer State

  const handleEditorMount = (editor: Editor | null) => {
    if (editor) {
      setActiveEditor(editor);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveDragData(event.active.data.current as ShapeDragData);
    console.log("Drag started:", event.active);
    setDropTargetInfo(null); // Drop Info beim Start zurücksetzen
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active, activatorEvent } = event; // activatorEvent für Mauskoordinaten
    setActiveId(null);
    setActiveDragData(null);

    console.log("Drag ended:", { active, over });

    // Prüfen, ob über einer gültigen Sheet-Dropzone gelandet
    if (
      over &&
      over.data.current?.accepts === "shape" &&
      active.data.current?.type === "shape"
    ) {
      const activeData = active.data.current as ShapeDragData;
      const overData = over.data.current as {
        sheetId: string;
        accepts: string;
      };

      // Hole Client-Koordinaten vom Event
      const dropCoords = {
        clientX:
          (activatorEvent as MouseEvent)?.clientX ??
          (activatorEvent as TouchEvent)?.touches?.[0]?.clientX ??
          0,
        clientY:
          (activatorEvent as MouseEvent)?.clientY ??
          (activatorEvent as TouchEvent)?.touches?.[0]?.clientY ??
          0,
      };

      console.log(
        `Shape ${active.id} (${activeData?.shapeType}) dropped on Sheet ${overData?.sheetId} at`,
        dropCoords
      );

      // Setze den State, um die Zielkomponente zu informieren
      if (dropCoords.clientX !== 0 || dropCoords.clientY !== 0) {
        // Nur setzen, wenn Koordinaten gültig
        setDropTargetInfo({
          sheetId: overData.sheetId,
          shapeType: activeData.shapeType,
          clientX: dropCoords.clientX,
          clientY: dropCoords.clientY,
        });
      } else {
        console.warn("Konnte Drop-Koordinaten nicht ermitteln.");
        setDropTargetInfo(null);
      }
    } else {
      console.log("Nicht über gültiger Dropzone losgelassen.");
      setDropTargetInfo(null); // Sicherstellen, dass zurückgesetzt wird
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveDragData(null);
    setDropTargetInfo(null); // Auch hier zurücksetzen
    console.log("Drag cancelled");
  };

  // Wichtig: Funktion, um den State zurückzusetzen, nachdem die Form hinzugefügt wurde
  const clearDropTargetInfo = useCallback(() => {
    setDropTargetInfo(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col h-full">
        <div className="bg-white border-b print:hidden">
          <LayoutTipTapAddonBar editor={activeEditor} />
        </div>

        <div className="flex flex-1 h-full overflow-hidden">
          <div className="w-64 border-r border-gray-200 overflow-auto print:hidden">
            <LayoutCurriculaSidebar />
          </div>

          <div className="flex-1 bg-background-dark-white overflow-auto p-4">
            <LayoutWorkSheet
              onEditorMount={handleEditorMount}
              dropTargetInfo={dropTargetInfo}
              onShapeDropped={clearDropTargetInfo} // Callback zum Zurücksetzen
            />
          </div>

          <div className="w-64 border-l border-gray-200 overflow-auto print:hidden overscroll-contain">
            <LayoutBuildingBlockSidebar />
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeId ? <ShapeOverlay data={activeDragData} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default WorksheetEditor;
