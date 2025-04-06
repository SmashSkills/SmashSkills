import React from "react";
import { Editor } from "@tiptap/react";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import ToolbarButton from "./ToolbarButton";

interface AlignmentControlsProps {
  editor: Editor;
}

/**
 * Komponente für die Textausrichtung
 *
 * Enthält Buttons für:
 * - Linksbündig
 * - Zentriert
 * - Rechtsbündig
 * - Blocksatz
 */
const AlignmentControls: React.FC<AlignmentControlsProps> = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex gap-1 mr-2 border-r pr-2">
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        title="Linksbündig"
      >
        <AlignLeft size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        title="Zentriert"
      >
        <AlignCenter size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        title="Rechtsbündig"
      >
        <AlignRight size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        isActive={editor.isActive({ textAlign: "justify" })}
        title="Blocksatz"
      >
        <AlignJustify size={18} />
      </ToolbarButton>
    </div>
  );
};

export default AlignmentControls;
