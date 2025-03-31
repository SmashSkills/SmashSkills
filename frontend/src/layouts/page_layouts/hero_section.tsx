import React from "react";
import ButtonPrimary from "../../components/ui_elements/buttons/button_primary";
import ButtonSecondary from "../../components/ui_elements/buttons/button_secondary";
import IlluHeroSection from "../../assets/illustrations/illu_herosection.svg";

interface LayoutHeroSectionProps {
  title: string;
  slogan: string;
  buttonPrimaryTitle?: string;
  buttonSecondaryTitle?: string;
  classNameWrapper?: string;
  classNameTitle?: string;
  classNameSlogan?: string;
  classNameButtonPrimary?: string;
  classNameButtonSecondary?: string;
  classNameImg?: string;
}

const LayoutHeroSection: React.FC<LayoutHeroSectionProps> = ({
  title,
  slogan,
  buttonPrimaryTitle,
  buttonSecondaryTitle,
  classNameWrapper,
  classNameTitle,
  classNameSlogan,
  classNameButtonSecondary,
  classNameButtonPrimary,
  classNameImg,
}) => {
  return (
    <div
      className={`flex items-center justify-center gap-10 ${classNameWrapper}`}
    >
      <div className="flex flex-col ">
        <div className="flex  gap-5 mb-5">
          <h1 className={`text-6xl ${classNameTitle}`}>{title}</h1>
        </div>

        <p className={`text-gray-600 text-xl ${classNameSlogan}`}>{slogan}</p>
        <div className="flex gap-5 mt-20">
          {buttonSecondaryTitle && (
            <ButtonSecondary
              title={buttonSecondaryTitle}
              className={` ${classNameButtonSecondary}`}
            />
          )}
          {buttonPrimaryTitle && (
            <ButtonPrimary
              title={buttonPrimaryTitle}
              className={` ${classNameButtonPrimary}`}
            />
          )}
        </div>
      </div>

      <img
        src={IlluHeroSection}
        alt="IlluHeroSection"
        className={classNameImg}
      />
    </div>
  );
};

export default LayoutHeroSection;
