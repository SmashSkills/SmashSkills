import React from "react";
import Shapes from "../../../components/building_blocks/shapes";

/**
 * Props interface for the building block sidebar layout component
 */
interface LayoutBuildingBlockSidebarProps {
  className?: string;
}

/**
 * Building Block Sidebar Layout Component
 * Provides a sidebar layout for building block-related content
 */
const LayoutBuildingBlockSidebar: React.FC<LayoutBuildingBlockSidebarProps> = ({
  className,
}) => {
  return (
    <div className={`p-4 ${className}`}>
      <h2 className="text-lg font-semibold mb-4">Bausteine</h2>

      {/* Abschnitt für Formen */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-2">Formen</h3>
        <Shapes />
      </div>

      {/* Hier könnten später weitere Baustein-Typen folgen */}
      {/* z.B. Textfelder, spezielle Symbole etc. */}
    </div>
  );
};

export default LayoutBuildingBlockSidebar;
