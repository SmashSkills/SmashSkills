import React from "react";

export interface ParallaxSliceProps {
  imageSrc: string;
  alt?: string;
  height?: string;
  children?: React.ReactNode;
}

const ParallaxSlice: React.FC<ParallaxSliceProps> = ({
  imageSrc,
  alt = "Parallax image",
  height = "600px",
  children,
}) => {
  return (
    <div className="relative overflow-hidden -mx-50" style={{ height }}>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageSrc})`,
          backgroundAttachment: "fixed",
        }}
        aria-label={alt}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default ParallaxSlice;
