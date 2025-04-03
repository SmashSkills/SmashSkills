import React from "react";

export interface BackgroundCurvedTransitionProps {
  className?: string;
  textColorClassName?: string; // <-- neu
  viewBox?: string;
  preserveAspectRatio?: string;
  pathD?: string;
}

const BackgroundCurvedTransition: React.FC<BackgroundCurvedTransitionProps> = ({
  className = "",
  textColorClassName = "text-gray-100",
  viewBox = "0 0 1440 320",
  preserveAspectRatio = "none",
  pathD = "M0,192L80,160C160,128,320,64,480,80C640,96,800,192,960,208C1120,224,1280,160,1360,128L1440,96V320H0Z",
}) => {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${className}`}>
      <svg
        className={`relative block w-full h-20 ${textColorClassName}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        preserveAspectRatio={preserveAspectRatio}
      >
        <path fill="currentColor" d={pathD} />
      </svg>
    </div>
  );
};

export default BackgroundCurvedTransition;
