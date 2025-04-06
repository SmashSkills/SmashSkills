import React from "react";
import { Editor } from "@tiptap/react";
import { Heading1, Heading2, Heading3 } from "lucide-react";
import ToolbarButton from "./ToolbarButton";

interface HeadingControlsProps {
  editor: Editor;
}

/**
 * Komponente für die Überschriftenformatierungen
 *
 * Enthält Buttons für:
 * - Überschrift 1 (h1)
 * - Überschrift 2 (h2)
 * - Überschrift 3 (h3)
 */
const HeadingControls: React.FC<HeadingControlsProps> = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex gap-1 mr-2 border-r pr-2">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="Überschrift 1"
      >
        <Heading1 size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Überschrift 2"
      >
        <Heading2 size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="Überschrift 3"
      >
        <Heading3 size={18} />
      </ToolbarButton>
    </div>
  );
};

export default HeadingControls;
