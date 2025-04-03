import ButtonPrimary from "../buttons/button_primary";

interface CardSimpleProps {
  title: string;
  text: string;
  icon?: any;
  titleButton?: string;
  classNameWrapper?: string;
  classNameTitle?: string;
  classNameText?: string;
  classNameButton?: string;
}

const CardSimple: React.FC<CardSimpleProps> = ({
  title,
  text,
  icon = [],
  titleButton,
  classNameWrapper,
  classNameTitle,
  classNameText,
  classNameButton,
}) => {
  return (
    <div
      className={`flex flex-col h-full w-full rounded-md p-5 gap-2    
    ${classNameWrapper}`}
    >
      <div className="inline-flex items-center justify-center bg-orange-light rounded-md p-2 w-fit h-fit">
        {icon}
      </div>

      <h1
        className={`
        ${classNameTitle}`}
      >
        {title}
      </h1>

      <p
        className={`text-gray-500
        ${classNameText}`}
      >
        {text}
      </p>
      {titleButton && (
        <div>
          <ButtonPrimary title={titleButton} className={classNameButton} />
        </div>
      )}
    </div>
  );
};

export default CardSimple;
