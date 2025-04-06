import React from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  CheckSquare,
  Table as TableIcon,
  Image as ImageIcon,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  Redo,
  Undo,
} from "lucide-react";

interface LayoutTipTapAddonBarProps {
  editor: Editor | null;
  className?: string;
}

/**
 * Toolbar button component
 */
const ToolbarButton: React.FC<{
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}> = ({ onClick, isActive, disabled, title, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-md transition-colors ${
      isActive
        ? "bg-primary-blue text-white"
        : "hover:bg-gray-100 text-gray-700"
    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    title={title}
  >
    {children}
  </button>
);

/**
 * TipTap Editor Toolbar Component
 * Provides formatting controls for the TipTap editor
 */
const LayoutTipTapAddonBar: React.FC<LayoutTipTapAddonBarProps> = ({
  editor,
  className = "",
}) => {
  if (!editor) {
    return null;
  }

  // Insert link handler
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL eingeben:", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  // Insert image handler
  const addImage = () => {
    const url = window.prompt("Bild-URL eingeben:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // Insert table handler
  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <div
      className={`flex flex-wrap gap-1 p-2 bg-gray-50 border-b ${className}`}
    >
      {/* Text style buttons */}
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

      {/* Headings */}
      <div className="flex gap-1 mr-2 border-r pr-2">
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          title="Überschrift 1"
        >
          <Heading1 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          title="Überschrift 2"
        >
          <Heading2 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          title="Überschrift 3"
        >
          <Heading3 size={18} />
        </ToolbarButton>
      </div>

      {/* Alignment buttons */}
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

      {/* Lists */}
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

      {/* Links & Media */}
      <div className="flex gap-1 mr-2 border-r pr-2">
        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive("link")}
          title="Link einfügen"
        >
          <LinkIcon size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Bild einfügen">
          <ImageIcon size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={insertTable} title="Tabelle einfügen">
          <TableIcon size={18} />
        </ToolbarButton>
      </div>

      {/* Undo/Redo */}
      <div className="flex gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Rückgängig"
        >
          <Undo size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Wiederherstellen"
        >
          <Redo size={18} />
        </ToolbarButton>
      </div>
    </div>
  );
};

export default LayoutTipTapAddonBar;
