import type { Editor } from "@tiptap/react";

// Moved from worksheet.tsx - Defines structure for drag data
export interface ShapeDragData {
  type: "shape";
  shapeType: string;
}

// Moved from worksheet.tsx - Defines structure for drop event info
export interface DropTargetInfo {
  sheetId: string;
  shapeType: string;
  clientX: number;
  clientY: number;
}

// Moved from layout_work_sheet.tsx
export interface WorksheetContent {
  title: string;
  body: string;
}

// Moved from layout_work_sheet.tsx
export interface WorksheetData {
  id: string;
  content: WorksheetContent;
}

// Moved from layout_work_sheet.tsx
export interface LayoutWorkSheetProps {
  className?: string;
  onPrint?: () => void;
  onEditorMount?: (editor: Editor | null) => void;
  dropTargetInfo: DropTargetInfo | null;
  onShapeDropped: () => void;
}

// Moved from layout_work_sheet.tsx
export interface WorksheetItemProps {
  sheet: WorksheetData;
  index: number;
  className?: string;
  isLast: boolean;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onEditorMount: (editor: Editor | null) => void;
  dropTargetInfo: DropTargetInfo | null;
  onShapeDropped: () => void;
}
