import React from "react";
import LayoutHeroSection from "../layouts/page_layouts/hero_section";
import ParallaxSlice from "../components/visuals/parallax_slice";
import LayoutGoals from "../layouts/page_layouts/goals";
import IlluParallax from "../assets/illustrations/illu_parallax.svg";
import LayoutCurriculumHighlights from "../layouts/page_layouts/curriculum_highlights";
const Home: React.FC = () => {
  return (
    <div className="flex flex-col">
      <div className=" flex items-center justify-center py-20">
        <LayoutHeroSection
          title="Wieso SmashSkills?"
          slogan="Eine Zeitersparnis für Lehrer und Schüler zugleich!"
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
      <div className="py-20">
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
      <div className="py-20">
        <LayoutCurriculumHighlights title="Offizielle Lehrpläne" />
      </div>
    </div>
  );
};

export default Home;
