interface CardSimpleProps {
  title: string;
  text: string;
  classNameWrapper?: string;
  classNameTitle?: string;
  classNameText?: string;
}

const CardSimple: React.FC<CardSimpleProps> = ({
  title,
  text,
  classNameWrapper,
  classNameTitle,
  classNameText,
}) => {
  return (
    <div
      className={`flex flex-col h-full w-full border border-gray-300 rounded-md p-5 gap-2   
    ${classNameWrapper}`}
    >
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
    </div>
  );
};

export default CardSimple;
