import React from "react";
import { Editor } from "@tiptap/react";
import { Undo as UndoIcon, Redo as RedoIcon } from "lucide-react";
import ToolbarButton from "./ToolbarButton";

interface HistoryControlsProps {
  editor: Editor;
}

/**
 * Komponente für die Bearbeiten-Historie
 *
 * Enthält Buttons für:
 * - Rückgängig machen
 * - Wiederherstellen
 */
const HistoryControls: React.FC<HistoryControlsProps> = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex gap-1">
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Rückgängig machen"
      >
        <UndoIcon size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Wiederherstellen"
      >
        <RedoIcon size={18} />
      </ToolbarButton>
    </div>
  );
};

export default HistoryControls;
