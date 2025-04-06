import React from "react";
import { Editor } from "@tiptap/react";
import { List, ListOrdered, CheckSquare } from "lucide-react";
import ToolbarButton from "./ToolbarButton";

interface ListControlsProps {
  editor: Editor;
}

/**
 * Komponente für die Listenfunktionen
 *
 * Enthält Buttons für:
 * - Aufzählungsliste (Bullet List)
 * - Nummerierte Liste (Ordered List)
 * - Aufgabenliste (Task List)
 */
const ListControls: React.FC<ListControlsProps> = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex gap-1 mr-2 border-r pr-2">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Aufzählung"
      >
        <List size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Nummerierte Liste"
      >
        <ListOrdered size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        isActive={editor.isActive("taskList")}
        title="Aufgabenliste"
      >
        <CheckSquare size={18} />
      </ToolbarButton>
    </div>
  );
};

export default ListControls;
