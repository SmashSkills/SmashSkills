import React from "react";
import ButtonPrimary from "../../components/ui_elements/buttons/button_primary";
import ButtonSecondary from "../../components/ui_elements/buttons/button_secondary";
import IlluGoals from "../../assets/illustrations/illu_goals.svg";

interface GoalPoint {
  text: string;
}

interface LayoutGoalsProps {
  title: string;
  points?: GoalPoint[];
  buttonPrimaryTitle?: string;
  buttonSecondaryTitle?: string;
  classNameButtonPrimary?: string;
  classNameButtonSecondary?: string;
  classNameImg?: string;
}

const LayoutGoals: React.FC<LayoutGoalsProps> = ({
  title,
  points = [],
  buttonPrimaryTitle,
  buttonSecondaryTitle,
  classNameButtonPrimary,
  classNameButtonSecondary,
  classNameImg,
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex gap-100">
        <div className="flex flex-col gap-10">
          <h1 className="text-6xl">{title}</h1>
          <div className="flex flex-col text-gray-500 text-xl gap-1">
            {points.map((point, index) => (
              <p
                className="before:content-['•'] before:mr-2 before:text-primary before:text-2xl"
                key={index}
              >
                {point.text}
              </p>
            ))}
          </div>
        </div>
        <div>
          <img src={IlluGoals} alt="IlluGoals" className={`${classNameImg}`} />
        </div>
      </div>
      <div className="flex gap-5 mt-20">
        {buttonSecondaryTitle && (
          <ButtonSecondary
            title={buttonSecondaryTitle}
            className={` 
            
            ${classNameButtonSecondary}`}
          />
        )}
        {buttonPrimaryTitle && (
          <ButtonPrimary
            title={buttonPrimaryTitle}
            className={`  
          
          ${classNameButtonPrimary}`}
          />
        )}
      </div>
    </div>
  );
};

export default LayoutGoals;
