import React from "react";
import LayoutHeroSection from "../layouts/page_layouts/hero_section";
import ParallaxSlice from "../components/visuals/parallax_slice";
import LayoutGoals from "../layouts/page_layouts/goals";
import IlluParallax from "../assets/illustrations/illu_parallax.svg";
import LayoutCurriculumHighlights from "../layouts/page_layouts/curriculum_highlights";
import { TiFlashOutline } from "react-icons/ti";
import { CiClock2 } from "react-icons/ci";
import { FiUsers } from "react-icons/fi";
import { IoBookOutline } from "react-icons/io5";

const Home: React.FC = () => {
  const keyText: string[] = [
    "Weniger Stress, mehr Struktur",
    "Lehrplankonforme Inhalte für alle Bundesländer",
    "SmashSkills stellt geprüfte Inhalte direkt zur Verfügung",
  ];

  const cardItems = [
    {
      icon: <TiFlashOutline size={24} className="text-primary" />, 
      title: "Effiziente Aufgabenverwaltung",
      text: "Durch das modulare Baukastenprinzip lassen sich Aufgaben schnell und flexibel strukturieren.",
    },
    {
      icon: <CiClock2 size={24} className="text-primary" />,
      title: "Mehr Zeit fürs Wesentliche",
      text: "Spart Zeit durch digitalisierte Arbeitsprozesse.",
    },
    {
      icon: <FiUsers size={24} className="text-primary" />,
      title: "Intuitive Nutzung",
      text: "Benutzerfreundliche Oberfläche für schnellen Einstieg.",
    },
    {
      icon: <IoBookOutline size={24} className="text-primary" />,
      title: "Lehrplankonform",
      text: "Offiziell abgestimmte Inhalte.",
    },
  ];
  return (
    <div className="flex flex-col ">
      <div className="fixed w-40 h-40 rounded-full bg-secondary opacity-30 top-[100px] left-[100px] z-0 pointer-events-none" />
      <div className="fixed w-60 h-60 rounded-full bg-primary opacity-20 bottom-[300px] right-[-100px] z-0 pointer-events-none" />
      <div className=" flex items-center justify-center px-50 pb-20 ">
        <LayoutHeroSection
          title="Wieso SmashSkills?"
          slogan="SmashSkills vereinfacht die Unterrichtsplanung, automatisiert wiederkehrende Aufgaben und stellt geprüfte Inhalte direkt zur Verfügung. So bleibt mehr Zeit für das, was wirklich zählt!"
          keyText={keyText}
          buttonPrimaryTitle="Jetzt registrieren"
          buttonSecondaryTitle="Hier einloggen"
          classNameButtonPrimary="w-54"
          classNameButtonSecondary="w-54"
          classNameImg="h-100"
          tag="Für Lehrkräfte entwickelt"
        />
      </div>
      <div className="z-1">
        <ParallaxSlice
          imageSrc={IlluParallax}
          alt="Beispiel Parallax Bild"
          height="600px"
        />
      </div>

      <div className="relative py-20 z-0 px-50">
        <div className="absolute inset-0 bg-background-dark-white z-[-1] " />
        <LayoutGoals
          title="Was wir erreichen wollen"
          text="Wir haben es uns zur Aufgabe gemacht, den Schulalltag für Lehrkräfte zu vereinfachen und die Qualität des Unterrichts zu verbessern"
          buttonPrimaryTitle="Jetzt registrieren"
          buttonSecondaryTitle="Hier einloggen"
          classNameImg="h-100"
          cardItems={cardItems}
        />
      </div>
      <div className="py-20 px-50">
        <LayoutCurriculumHighlights title="Offizielle Lehrpläne" />
      </div>
      {/**Background */}
    </div>
  );
};

export default Home;
