import React, { useEffect, useState } from "react";

const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  if (value <= inMin) return outMin;
  if (value >= inMax) return outMax;
  const ratio = (value - inMin) / (inMax - inMin);
  return outMin + ratio * (outMax - outMin);
};

const AnimatedBackgroundCircles = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollY / docHeight;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const blueTranslateX = mapRange(scrollProgress, 0.3, 0.7, 0, 80); // in vw
  const blueTranslateY = mapRange(scrollProgress, 0.3, 0.7, 0, 60); // in vh

  const orangeTranslateX = mapRange(scrollProgress, 0.3, 0.7, 0, -20); // in vw
  const orangeTranslateY = mapRange(scrollProgress, 0.3, 0.7, 0, -30); // in vh

  return (
    <>
      <div
        className="fixed w-40 h-40 rounded-full bg-secondary opacity-30 z-[-10] pointer-events-none transition-all duration-100 ease-linear"
        style={{
          transform: `translate(${blueTranslateX}vw, ${blueTranslateY}vh)`,
        }}
      />

      <div
        className="fixed w-60 h-60 rounded-full bg-primary opacity-20 z-[-10] pointer-events-none transition-all duration-100 ease-linear"
        style={{
          transform: `translate(${orangeTranslateX}vw, ${orangeTranslateY}vh)`,
        }}
      />
    </>
  );
};

export default AnimatedBackgroundCircles;
