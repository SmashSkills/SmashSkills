import React from "react";
import { Editor } from "@tiptap/react";
import TextFormatting from "../../../components/tiptap_addons/TextFormatting";
import HeadingControls from "../../../components/tiptap_addons/HeadingControls";
import AlignmentControls from "../../../components/tiptap_addons/AlignmentControls";
import ListControls from "../../../components/tiptap_addons/ListControls";
import MediaControls from "../../../components/tiptap_addons/MediaControls";
import HistoryControls from "../../../components/tiptap_addons/HistoryControls";
import TextStyleControls from "../../../components/tiptap_addons/TextStyleControls";

interface LayoutTipTapAddonBarProps {
  editor: Editor | null;
  className?: string;
}

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

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-1 p-2 bg-gray-50 border-b ${className}`}
    >
      <TextFormatting editor={editor} />
      <TextStyleControls editor={editor} />
      <HeadingControls editor={editor} />
      <AlignmentControls editor={editor} />
      <ListControls editor={editor} />
      <MediaControls editor={editor} />
      <HistoryControls editor={editor} />
    </div>
  );
};

export default LayoutTipTapAddonBar;
