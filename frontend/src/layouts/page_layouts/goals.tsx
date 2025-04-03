import React from "react";
import ButtonPrimary from "../../components/ui_elements/buttons/button_primary";
import ButtonSecondary from "../../components/ui_elements/buttons/button_secondary";
import IlluGoals from "../../assets/illustrations/illu_goals.svg";
import TagSingleStringInfo from "../../components/ui_elements/tags/tag_single_string_info";
import CardSimple from "../../components/ui_elements/cards/card_simple";

interface CardItem {
  icon: React.ReactNode;
  title: string;
  text: string;
}
interface LayoutGoalsProps {
  title: string;
  text: string;
  cardItems: CardItem[];
  buttonPrimaryTitle?: string;
  buttonSecondaryTitle?: string;
  classNameButtonPrimary?: string;
  classNameButtonSecondary?: string;
  classNameImg?: string;
}

const LayoutGoals: React.FC<LayoutGoalsProps> = ({
  title,
  text,
  cardItems,
  buttonPrimaryTitle,
  buttonSecondaryTitle,
  classNameButtonPrimary,
  classNameButtonSecondary,
  classNameImg,
}) => {
  return (
    <div className="relative flex items-center justify-center z-10 gap-0">
      <img
        src={IlluGoals}
        alt="IlluGoals"
        className={`relative w-1/2 z-10 ${classNameImg}`}
      />
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col gap-3 items-start">
          <TagSingleStringInfo text="Unsere Mission" />
          <div className="flex flex-col gap-5">
            <h1 className="text-6xl z-10 text-secondary">{title}</h1>
            <p className="text-gray-500 text-lg ">{text}</p>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-10">
            {cardItems.map((item, index) => (
              <CardSimple
                key={index}
                icon={item.icon}
                title={item.title}
                text={item.text}
                classNameTitle="text-secondary text-lg"
                classNameWrapper="shadow-md bg-white"
              />
            ))}
          </div>

          <div className="flex gap-5 mt-20 items-start">
            {buttonPrimaryTitle && (
              <ButtonPrimary
                title={buttonPrimaryTitle}
                className={`  
          
          ${classNameButtonPrimary}`}
              />
            )}
            {buttonSecondaryTitle && (
              <ButtonSecondary
                title={buttonSecondaryTitle}
                className={`border-secondary text-secondary 
            
            ${classNameButtonSecondary}`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutGoals;
