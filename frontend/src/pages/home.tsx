import React from "react";
import LayoutHeroSection from "../layouts/page_layouts/hero_section";
import ParallaxSlice from "../components/visuals/parallax_slice";
import IlluParallax from "../assets/illustrations/illu_parallax.svg";

const Home: React.FC = () => {
  return (
    <div className="h-1000">
      <div className="flex items-center justify-center mb-50">
        <LayoutHeroSection
          title="SmashSkills"
          slogan="Wieso SmashSkills so krass ist, weil wir krass sind."
          buttonPrimaryTitle="Jetzt registrieren"
          buttonSecondaryTitle="Hier einloggen"
        />
      </div>
        <ParallaxSlice
          imageSrc={IlluParallax}
          alt="Beispiel Parallax Bild"
          height="600px"
        ></ParallaxSlice>
    </div>
  );
};

export default Home;
