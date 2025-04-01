import React from "react";
import ButtonPrimary from "../buttons/button_primary";

interface CardCurriculumShowcaseProps {
  title: string;
  items?: { icon?: React.ReactNode; label: string; content: string }[];
  buttonTitle: string;
}

const CardCurriculumShowcase: React.FC<CardCurriculumShowcaseProps> = ({
  title,
  items = [],
  buttonTitle,
}) => {
  return (
    <div className="flex flex-col h-full w-full border border-gray-300 rounded-md p-5 gap-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h1 className="text-xl font-semibold text-secondary">{title}</h1>
        <ButtonPrimary title={buttonTitle} />
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-start sm:items-center gap-2 min-w-[200px]"
          >
            <span className="text-secondary">{item.icon}</span>
            <div className="flex gap-1 flex-wrap text-sm">
              <h1 className="font-bold text-secondary">{item.label}:</h1>
              <p className="text-gray-900">{item.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardCurriculumShowcase;
