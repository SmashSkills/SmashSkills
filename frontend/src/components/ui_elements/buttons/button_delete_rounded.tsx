import React from "react";

interface ButtonDeleteRoundedProps {
  onClick: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  title?: string;
}

const ButtonDeleteRounded: React.FC<ButtonDeleteRoundedProps> = ({
  onClick,
  className = "",
  size = "sm",
  title = "Löschen",
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
      className={`bg-white rounded-full ${sizeClasses[size]} flex items-center justify-center shadow-md hover:bg-red-100 print:hidden border-2 border-gray-300 transition-all duration-200 ease-in-out cursor-pointer ${className}`}
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
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  );
};

export default ButtonDeleteRounded;
