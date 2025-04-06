import React from "react";

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean; // Wird nicht mehr verwendet, für Kompatibilität beibehalten
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

/**
 * Wiederverwendbare Button-Komponente für die TipTap-Toolbar
 *
 * @param onClick - Funktion, die bei Klick ausgeführt wird
 * @param isActive - Wird ignoriert (für Kompatibilität beibehalten)
 * @param disabled - Gibt an, ob der Button deaktiviert ist
 * @param title - Tooltip-Text
 * @param children - Kind-Elemente (in der Regel das Icon)
 */
const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  disabled,
  title,
  children,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-md transition-colors hover:bg-gray-100 text-gray-700 ${
      disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
    }`}
    title={title}
  >
    {children}
  </button>
);

export default ToolbarButton;
