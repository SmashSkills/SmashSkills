import React from "react";
import ButtonPrimary from "../../components/ui_elements/buttons/button_primary";
import IlluCurriculumHighlights from "../../assets/illustrations/illu_Curriculum_highlights.svg";
import CardSimple from "../../components/ui_elements/cards/card_simple";
import TagSingleStringInfo from "../../components/ui_elements/tags/tag_single_string_info";
import { FiTarget } from "react-icons/fi";
import { LuSparkles } from "react-icons/lu";
import { IoBookOutline } from "react-icons/io5";

const cardItems = [
  {
    icon: <FiTarget size={30} className="text-primary" />,
    title: "Alle Bundesländer",
    text: "Lehrpläne für alle 16 Bundesländer und sämtliche Schulformen",
  },

  {
    icon: <LuSparkles size={30} className="text-primary" />,
    title: "Stets aktuell",
    text: "Automatische Updates bei Änderungen der offiziellen Lehrpläne",
  },

  {
    icon: <IoBookOutline size={30} className="text-primary" />,
    title: "Direkte Integration",
    text: "Nahtlose Verknüpfung mit dem Arbeitsblatt-Generator",
  },
];

interface LayoutCurriculumHighlightsProps {
  title: string;
}

const LayoutCurriculumHighlights: React.FC<LayoutCurriculumHighlightsProps> = ({
  title,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-10 ">
      <div className="flex flex-col items-center gap-3">
        <TagSingleStringInfo text="Bundesweit verfügbar" />
        <div className="flex flex-col gap-5">
          <h1 className="w-full flex justify-center text-6xl z-10 text-secondary">
            {title}
          </h1>
          <p className="text-gray-500 text-l px-80 text-center">
            Greifen Sie auf aktuelle Lehrpläne aller Bundesländer zu und
            erstellen Sie daraus mit wenigen Klicks passende
            Unterrichtsmaterialien.
          </p>
        </div>
      </div>

      <div>
        <img
          src={IlluCurriculumHighlights}
          alt="IlluCurriculumHighlights"
          className="z-10 items-center"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-6xl">
        {cardItems.map((item, index) => (
          <CardSimple
            key={index}
            icon={item.icon}
            title={item.title}
            text={item.text}
            classNameWrapper="items-center shadow-md"
            classNameText="text-center"
            classNameTitle="text-lg text-secondary"
          />
        ))}
      </div>
      <ButtonPrimary title="Weiter zu den Lehrplänen" />
    </div>
  );
};

export default LayoutCurriculumHighlights;
