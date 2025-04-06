import React from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
} from "lucide-react";
import ToolbarButton from "./ToolbarButton";

interface TextFormattingProps {
  editor: Editor;
}

/**
 * Komponente für die grundlegenden Textformatierungsoptionen
 *
 * Enthält Buttons für:
 * - Fett
 * - Kursiv
 * - Unterstrichen
 * - Durchgestrichen
 * - Hervorhebung
 */
const TextFormatting: React.FC<TextFormattingProps> = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex gap-1 mr-2 border-r pr-2">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Fett"
      >
        <Bold size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Kursiv"
      >
        <Italic size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Unterstrichen"
      >
        <Underline size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Durchgestrichen"
      >
        <Strikethrough size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive("highlight")}
        title="Hervorheben"
      >
        <Highlighter size={18} />
      </ToolbarButton>
    </div>
  );
};

export default TextFormatting;
