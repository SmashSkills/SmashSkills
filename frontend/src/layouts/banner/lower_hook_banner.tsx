import React from "react";
import ButtonPrimary from "../../components/ui_elements/buttons/button_primary";

interface LayoutBannerLowerHookProps {
  title: string;
  text: string;
  buttonTitle: string;
  classNameWrapper?: string;
  classNameTitle?: string;
  classNameText?: string;
  classNameButton?: string;
}

const LayoutBannerLowerHook: React.FC<LayoutBannerLowerHookProps> = ({
  title,
  text,
  buttonTitle,
  classNameWrapper = "",
  classNameTitle = "",
  classNameText = "",
  classNameButton = "",
}) => {
  return (
    <div className={`bg-secondary ${classNameWrapper}`}>
      <h1 className={`text-white text-4xl mb-3${classNameTitle}`}>{title}</h1>
      <p className={`text-gray-300 text-lg mb-3${classNameText}`}>{text}</p>
      {buttonTitle && (
        <div>
          {" "}
          <ButtonPrimary title={buttonTitle} className={classNameButton} />
        </div>
      )}
    </div>
  );
};

export default LayoutBannerLowerHook;
