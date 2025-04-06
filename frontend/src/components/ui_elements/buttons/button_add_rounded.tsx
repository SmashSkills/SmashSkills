import React from "react";

interface ButtonAddRoundedProps {
  onClick: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  title?: string;
}

const ButtonAddRounded: React.FC<ButtonAddRoundedProps> = ({
  onClick,
  className = "",
  size = "md",
  title = "Hinzufügen",
}) => {
  // Größen für den Button basierend auf der size-Prop
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  // Größen für das SVG-Icon basierend auf der size-Prop
  const iconSizes = {
    sm: "16",
    md: "20",
    lg: "24",
  };

  return (
    <button
      onClick={onClick}
      className={`bg-white rounded-full ${sizeClasses[size]} flex items-center justify-center shadow-md hover:shadow-lg print:hidden border-2 border-gray-300 transition-all duration-200 ease-in-out hover:bg-orange-light cursor-pointer ${className}`}
      title={title}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={iconSizes[size]}
        height={iconSizes[size]}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
  );
};

export default ButtonAddRounded;
