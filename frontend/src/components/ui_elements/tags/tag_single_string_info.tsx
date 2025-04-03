import React from "react";

interface TagSingleStringInfoProps {
  text: string;
  classNameWrapper?: string;
  classNameText?: string;
}

const TagSingleStringInfo: React.FC<TagSingleStringInfoProps> = ({
  text,
  classNameWrapper,
  classNameText,
}) => {
  return (
    <div
      className={`flex w-max items-center rounded-full bg-orange-light px-2 py-[0.5px]
    ${classNameWrapper}`}
    >
      <p
        className={`text-primary font-semibold
        ${classNameText}`}
      >
        {text}
      </p>
    </div>
  );
};

export default TagSingleStringInfo;
