import React, { useState, useRef } from "react";
import {
  Type,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Star,
  ArrowRight,
  Palette,
  ZoomIn,
  ZoomOut,
  Eraser,
  Undo,
  Redo,
  Download,
  ChevronDown,
  PenLine,
  Heart,
} from "lucide-react";
import { addTextToWorksheet, TextProps } from "./text/add_text";
import { addShapeToWorksheet, ShapeType, ShapeProps } from "./shape/add_shape";
import { ColorManager, ColorPicker } from "./colors/add_color";
import Konva from "konva";

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  label,
  onClick,
  active = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-200 transition-colors ${
        active ? "bg-gray-200" : ""
      }`}
      title={label}
    >
      <div className="text-gray-700">{icon}</div>
      <span className="text-xs mt-1 text-gray-600">{label}</span>
    </button>
  );
};

interface ToolbarDropdownProps {
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const ToolbarDropdown: React.FC<ToolbarDropdownProps> = ({
  icon,
  label,
  isOpen,
  onClick,
  children,
}) => {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-200 transition-colors ${
          isOpen ? "bg-gray-200" : ""
        }`}
        title={label}
      >
        <div className="text-gray-700 flex items-center">
          {icon}
          <ChevronDown
            className={`ml-1 w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
        <span className="text-xs mt-1 text-gray-600">{label}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-52 bg-white shadow-lg rounded-lg p-2 z-50 grid grid-cols-3 gap-1">
          {children}
        </div>
      )}
    </div>
  );
};

interface LayoutToolbarTopProps {
  onToolSelect: (tool: string) => void;
  stageRef?: React.RefObject<Konva.Stage | null>;
  onAddText?: (textProps: TextProps) => void;
  onAddShape?: (shapeProps: ShapeProps) => void;
}

const LayoutToolbarTop: React.FC<LayoutToolbarTopProps> = ({
  onToolSelect,
  stageRef,
  onAddText,
  onAddShape,
}) => {
  const [shapesDropdownOpen, setShapesDropdownOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState("");
  const colorManager = useRef(ColorManager.getInstance());

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
    onToolSelect(tool);

    // Schließe Dropdown nach Auswahl
    if (tool.startsWith("shape:")) {
      setShapesDropdownOpen(false);
    }
  };

  const handleTextTool = () => {
    handleToolSelect("text");

    // Text zum Worksheet hinzufügen, wenn StageRef vorhanden
    if (stageRef && stageRef.current && onAddText) {
      addTextToWorksheet(stageRef as React.RefObject<Konva.Stage>, onAddText);
    }

    console.log("Text-Element wird erzeugt");
  };

  const handleShapeTool = (shapeType: ShapeType) => {
    const toolName = `shape:${shapeType}`;
    handleToolSelect(toolName);

    // Form zum Worksheet hinzufügen, wenn StageRef vorhanden
    if (stageRef && stageRef.current && onAddShape) {
      addShapeToWorksheet(
        shapeType,
        stageRef as React.RefObject<Konva.Stage>,
        onAddShape
      );
    }

    console.log(`${shapeType}-Form wird erzeugt`);
  };

  const handleColorTool = () => {
    handleToolSelect("color");
    setColorPickerOpen(!colorPickerOpen);
  };

  const handleColorChange = (color: string) => {
    colorManager.current.setActiveColor(color);
    console.log(`Farbe geändert zu: ${color}`);
  };

  return (
    <div className="w-full bg-white border-b-2 border-gray-300 p-2 flex items-center justify-center space-x-2">
      {/* Zeichenwerkzeuge - Kategorie 1 */}
      <div className="flex space-x-2 border-r pr-4">
        <ToolbarButton
          icon={<Type size={20} />}
          label="Text"
          onClick={handleTextTool}
          active={selectedTool === "text"}
        />

        <ToolbarDropdown
          icon={<Square size={20} />}
          label="Formen"
          isOpen={shapesDropdownOpen}
          onClick={() => setShapesDropdownOpen(!shapesDropdownOpen)}
        >
          <ToolbarButton
            icon={<Square size={18} />}
            label="Rechteck"
            onClick={() => handleShapeTool(ShapeType.RECTANGLE)}
          />
          <ToolbarButton
            icon={<Circle size={18} />}
            label="Kreis"
            onClick={() => handleShapeTool(ShapeType.CIRCLE)}
          />
          <ToolbarButton
            icon={<Triangle size={18} />}
            label="Dreieck"
            onClick={() => handleShapeTool(ShapeType.TRIANGLE)}
          />
          <ToolbarButton
            icon={<Hexagon size={18} />}
            label="Sechseck"
            onClick={() => handleShapeTool(ShapeType.HEXAGON)}
          />
          <ToolbarButton
            icon={<Star size={18} />}
            label="Stern"
            onClick={() => handleShapeTool(ShapeType.STAR)}
          />
          <ToolbarButton
            icon={<ArrowRight size={18} />}
            label="Pfeil"
            onClick={() => handleShapeTool(ShapeType.ARROW)}
          />
          <ToolbarButton
            icon={<PenLine size={18} />}
            label="Linie"
            onClick={() => handleShapeTool(ShapeType.LINE)}
          />
          <ToolbarButton
            icon={<Heart size={18} />}
            label="Herz"
            onClick={() => handleShapeTool(ShapeType.HEART)}
          />
        </ToolbarDropdown>

        <ToolbarButton
          icon={<PenLine size={20} />}
          label="Freihand"
          onClick={() => handleToolSelect("pen")}
          active={selectedTool === "pen"}
        />
      </div>

      {/* Bearbeitungswerkzeuge - Kategorie 2 */}
      <div className="flex space-x-2 border-r pr-4 relative">
        <ToolbarButton
          icon={<Palette size={20} />}
          label="Farbe"
          onClick={handleColorTool}
          active={selectedTool === "color"}
        />

        {colorPickerOpen && (
          <div className="absolute top-full left-0 mt-1 z-50">
            <ColorPicker onColorChange={handleColorChange} />
          </div>
        )}

        <ToolbarButton
          icon={<Eraser size={20} />}
          label="Radierer"
          onClick={() => handleToolSelect("eraser")}
          active={selectedTool === "eraser"}
        />
      </div>

      {/* Zoomen - Kategorie 3 */}
      <div className="flex space-x-2 border-r pr-4">
        <ToolbarButton
          icon={<ZoomIn size={20} />}
          label="Vergrößern"
          onClick={() => handleToolSelect("zoom-in")}
        />
        <ToolbarButton
          icon={<ZoomOut size={20} />}
          label="Verkleinern"
          onClick={() => handleToolSelect("zoom-out")}
        />
      </div>

      {/* Aktionen - Kategorie 4 */}
      <div className="flex space-x-2">
        <ToolbarButton
          icon={<Undo size={20} />}
          label="Rückgängig"
          onClick={() => handleToolSelect("undo")}
        />
        <ToolbarButton
          icon={<Redo size={20} />}
          label="Wiederholen"
          onClick={() => handleToolSelect("redo")}
        />
        <ToolbarButton
          icon={<Download size={20} />}
          label="Exportieren"
          onClick={() => handleToolSelect("export")}
        />
      </div>
    </div>
  );
};

export default LayoutToolbarTop;
