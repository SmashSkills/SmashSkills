import React from "react";
import { Editor, BubbleMenu, isNodeSelection } from "@tiptap/react";
import {
  ArrowLeftFromLine,
  ArrowRightFromLine,
  ArrowUpFromLine,
  ArrowDownFromLine,
  Rows,
  Columns,
  Trash,
  SplitSquareHorizontal,
  Merge,
} from "lucide-react";
import ToolbarButton from "./ToolbarButton";

interface TableControlsProps {
  editor: Editor;
}

const TableControls: React.FC<TableControlsProps> = ({ editor }) => {
  if (!editor) return null;

  // Optionen für das BubbleMenu
  const bubbleMenuProps = {
    editor,
    tippyOptions: { duration: 100, placement: "top-start" as const },
    // Zeige das Menü nur an, wenn der Cursor in einer Tabelle ist
    // und es keine Node-Auswahl ist (wie z.B. ein ausgewähltes Bild)
    shouldShow: ({ editor, state }: { editor: Editor; state: { selection: unknown } }) => {
      const { selection } = state;
      return editor.isActive("table") && !isNodeSelection(selection);
    },
  };

  return (
    <BubbleMenu {...bubbleMenuProps}>
      <div className="flex gap-1 p-1 bg-white border border-gray-300 shadow-lg rounded-md">
        {/* Spaltenoperationen */}
        <ToolbarButton
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          title="Spalte davor einfügen"
        >
          <ArrowLeftFromLine size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          title="Spalte danach einfügen"
        >
          <ArrowRightFromLine size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().deleteColumn().run()}
          title="Spalte löschen"
        >
          <Columns size={18} className="text-primary" />
        </ToolbarButton>
        <div className="border-r border-gray-300 mx-1"></div> {/* Trenner */}
        {/* Zeilenoperationen */}
        <ToolbarButton
          onClick={() => editor.chain().focus().addRowBefore().run()}
          title="Zeile davor einfügen"
        >
          <ArrowUpFromLine size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().addRowAfter().run()}
          title="Zeile danach einfügen"
        >
          <ArrowDownFromLine size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().deleteRow().run()}
          title="Zeile löschen"
        >
          <Rows size={18} className="text-primary" />
        </ToolbarButton>
        <div className="border-r border-gray-300 mx-1"></div> {/* Trenner */}
        {/* Zellenoperationen (Optional) */}
        <ToolbarButton
          onClick={() => editor.chain().focus().mergeCells().run()}
          title="Zellen verbinden"
          disabled={!editor.can().mergeCells()}
        >
          <Merge size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().splitCell().run()}
          title="Zelle teilen"
          disabled={!editor.can().splitCell()}
        >
          <SplitSquareHorizontal size={18} />
        </ToolbarButton>
        <div className="border-r border-gray-300 mx-1"></div> {/* Trenner */}
        {/* Tabellenoperationen */}
        <ToolbarButton
          onClick={() => editor.chain().focus().deleteTable().run()}
          title="Tabelle löschen"
        >
          <Trash size={18} className="text-red-500" />
        </ToolbarButton>
      </div>
    </BubbleMenu>
  );
};

export default TableControls;
