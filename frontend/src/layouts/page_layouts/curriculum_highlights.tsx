import React from "react";
import ButtonPrimary from "../../components/ui_elements/buttons/button_primary";
import IlluCurriculumHighlights from "../../assets/illustrations/illu_Curriculum_highlights.svg";

interface LayoutCurriculumHighlightsProps {
  title: string;
}

const LayoutCurriculumHighlights: React.FC<LayoutCurriculumHighlightsProps> = ({
  title,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-10">
      <h1 className="w-full flex justify-end text-6xl">{title}</h1>
      <div>
        <img src={IlluCurriculumHighlights} alt="IlluCurriculumHighlights" />
      </div>
      <ButtonPrimary title="Weiter zu den Lehrplänen" />
    </div>
  );
};

export default LayoutCurriculumHighlights;
