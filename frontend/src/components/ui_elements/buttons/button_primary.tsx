import React from "react";

type ButtonType = "button" | "submit" | "reset";

/**
 * 
import React from 'react';
import ButtonPrimary from './ButtonPrimary';

const App: React.FC = () => {


  const handleClick = () => {
    console.log('Example!');
  };

  return (
    <div>
      <ButtonPrimary onClick={handleClick} />
    </div>
  );
};

export default App;
 * 
 */

interface ButtonPrimaryProps {
  title: string;
  type?: ButtonType;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  title,
  type = "button",
  className,
  onClick,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`font-inter text-white bg-primary rounded-full px-8 py-2 cursor-pointer 
        hover:font-semibold hover:bg-primary-hover 
        transition-colors duration-300
        ${className}`}
    >
      {title}
    </button>
  );
};

export default ButtonPrimary;
