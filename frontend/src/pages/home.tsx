import React from "react";
import LayoutHeroSection from "../layouts/page_layouts/hero_section";
import ParallaxSlice from "../components/visuals/parallax_slice";
import LayoutGoals from "../layouts/page_layouts/goals";
import IlluParallax from "../assets/illustrations/illu_parallax.svg";

const Home: React.FC = () => {
  return (
    <div className="h-1000 flex flex-col">
      <div className="mx-50 flex items-center justify-center py-20">
        <LayoutHeroSection
          title="Wieso SmashSkills?"
          slogan="Wieso SmashSkills so krass ist, weil wir krass sind."
          buttonPrimaryTitle="Jetzt registrieren"
          buttonSecondaryTitle="Hier einloggen"
          classNameButtonPrimary="w-54"
          classNameButtonSecondary="w-54"
          classNameImg="h-100"
        />
      </div>
      <ParallaxSlice
        imageSrc={IlluParallax}
        alt="Beispiel Parallax Bild"
        height="600px"
      />
      <div className="bg-gray-50 py-20 -mx-50 ">
        <LayoutGoals
          points={[
            { text: "Effiziente Aufgabenverwaltung" },
            { text: "Zeitersparnis für Lehrkräfte" },
            { text: "Benutzerfreundliche Oberfläche" },
          ]}
          title="Unsere Ziele"
          buttonPrimaryTitle="Jetzt registrieren"
          buttonSecondaryTitle="Hier einloggen"
          classNameImg="h-100"
        />
      </div>
    </div>
  );
};

export default Home;
