import React from "react";
import ButtonPrimary from "../../components/ui_elements/buttons/button_primary";
import ButtonSecondary from "../../components/ui_elements/buttons/button_secondary";
import LogoSmashSkills from "../../components/logo/logo_smashskills";

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
  classNameLogo?: string;
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
  classNameLogo,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-10 
      
      ${classNameWrapper}`}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-5 mb-5">
          <LogoSmashSkills className={`${classNameLogo}`} glow />
          <h1
            className={`text-9xl 
      
      ${classNameTitle}`}
          >
            {title}
          </h1>
        </div>

        <p
          className={`text-gray-600 text-xl
      
      ${classNameSlogan}`}
        >
          {slogan}
        </p>
      </div>

      <div className="flex gap-5">
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

export default LayoutHeroSection;
