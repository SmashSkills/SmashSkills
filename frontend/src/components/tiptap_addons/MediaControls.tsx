import React from "react";
import { Editor } from "@tiptap/react";
import { Table as TableIcon } from "lucide-react";
import ToolbarButton from "./ToolbarButton";

interface MediaControlsProps {
  editor: Editor;
}

/**
 * Komponente für die Medieneinfügung (Nur Tabelle)
 *
 * Enthält Buttons für:
 * - Tabellen
 */
const MediaControls: React.FC<MediaControlsProps> = ({ editor }) => {
  if (!editor) return null;

  // Insert table handler
  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <div className="flex gap-1 mr-2 border-r pr-2">
      <ToolbarButton onClick={insertTable} title="Tabelle einfügen">
        <TableIcon size={18} />
      </ToolbarButton>
    </div>
  );
};

export default MediaControls;
