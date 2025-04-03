import React from "react";
import ButtonPrimary from "../buttons/button_primary";

interface CardCurriculumShowcaseProps {
  title: string;
  items?: { icon?: React.ReactNode; label: string; content: string }[];
  buttonTitle: string;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  contentClassName?: string;
}

const CardCurriculumShowcase: React.FC<CardCurriculumShowcaseProps> = ({
  title,
  items = [],
  buttonTitle,
  className = "",
  iconClassName = "",
  labelClassName = "",
  contentClassName = "",
}) => {
  return (
    <div
      className={`flex flex-col h-full w-full border border-gray-300 rounded-md p-5 gap-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h1 className="text-xl font-semibold text-secondary">{title}</h1>
        <ButtonPrimary title={buttonTitle} />
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-start sm:items-center gap-2 min-w-[200px] border border-gray-300 rounded-full p-2 px-5"
          >
            <span className={`${iconClassName} text-secondary`}>
              {item.icon}
            </span>
            <div className="flex gap-1 flex-wrap text-sm">
              <h1 className={`${labelClassName} font-bold text-secondary`}>
                {item.label}:
              </h1>
              <p className={`${contentClassName} text-gray-900 font-bold`}>
                {item.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardCurriculumShowcase;

