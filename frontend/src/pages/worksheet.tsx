import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import LayoutWorkSheet from "../layouts/sheets/worksheet_layouts/layout_work_sheet";
import LayoutCurriculaSidebar from "../layouts/sheets/worksheet_layouts/layout_curricula_sidebar";
import LayoutBuildingBlockSidebar from "../layouts/sheets/worksheet_layouts/layout_building_block_sidebar";
import LayoutTipTapAddonBar from "../layouts/sheets/worksheet_layouts/layout_tiptap_addon_bar";

interface WorksheetEditorProps {
  className?: string;
}

const WorksheetEditor: React.FC<WorksheetEditorProps> = () => {
  // State zur Verfolgung des aktiven Editors
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);

  // Callback, um den aktiven Editor zu aktualisieren
  const handleEditorMount = (editor: Editor | null) => {
    // Nur setzen, wenn ein gültiger Editor übergeben wird.
    // Wenn editor === null (onDestroy), wird der State nicht geändert.
    // Dies verhindert, dass die Toolbar verschwindet, wenn ein nicht-aktives Sheet gelöscht wird.
    // Nachteil: Wenn das *aktive* Sheet gelöscht wird, bleibt die Toolbar (zeigt auf zerstörten Editor).
    if (editor) {
      setActiveEditor(editor);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* TipTap Toolbar */}
      <div className="bg-white border border-gray-100 print:hidden">
        <LayoutTipTapAddonBar editor={activeEditor} />
      </div>

      <div className="flex flex-1 h-full overflow-hidden">
        {/* Linke Sidebar für Lehrpläne */}
        <div className="w-64 border-r border-gray-200 overflow-auto print:hidden">
          <LayoutCurriculaSidebar />
        </div>

        {/* Hauptbereich für das Arbeitsblatt */}
        <div className="flex-1 bg-background-dark-white overflow-auto p-4">
          <LayoutWorkSheet onEditorMount={handleEditorMount} />
        </div>

        {/* Rechte Sidebar für Bausteine */}
        <div className="w-64 border-l border-gray-200 overflow-auto print:hidden">
          <LayoutBuildingBlockSidebar />
        </div>
      </div>
    </div>
  );
};

export default WorksheetEditor;
