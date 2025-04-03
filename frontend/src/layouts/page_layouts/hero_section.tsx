import React from "react";
import ButtonPrimary from "../../components/ui_elements/buttons/button_primary";
import ButtonSecondary from "../../components/ui_elements/buttons/button_secondary";
import IlluHeroSection from "../../assets/illustrations/illu_herosection.svg";
import TagSingleStringInfo from "../../components/ui_elements/tags/tag_single_string_info";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

interface LayoutHeroSectionProps {
  title: string;
  slogan: string;
  tag?: string;
  keyText?: string[];
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
  tag,
  keyText = [],
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
      <div className="flex flex-col z-10">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            {tag && (
              <div className="w-max">
                <TagSingleStringInfo text={tag} />
              </div>
            )}
            <h1 className={`text-6xl text-secondary ${classNameTitle}`}>
              {title}
            </h1>
          </div>
          <p className={`text-gray-500 text-lg ${classNameSlogan}`}>{slogan}</p>
          <div className="flex flex-col gap-2">
            {keyText.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-gray-500"
              >
                <IoMdCheckmarkCircleOutline
                  size={22}
                  className="text-primary"
                />
                <p className="text-lg">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-5 mt-20">
          {buttonPrimaryTitle && (
            <ButtonPrimary
              title={buttonPrimaryTitle}
              className={` ${classNameButtonPrimary}`}
            />
          )}
          {buttonSecondaryTitle && (
            <ButtonSecondary
              title={buttonSecondaryTitle}
              className={`border-secondary text-secondary ${classNameButtonSecondary}`}
            />
          )}
        </div>
      </div>

      {/* Kreise – fixiert zum Viewport */}

      {/* Bild */}
      <img
        src={IlluHeroSection}
        alt="IlluHeroSection"
        className={`relative bg-white p-5 rounded-md z-10 ${classNameImg}`}
      />
    </div>
  );
};

export default LayoutHeroSection;
