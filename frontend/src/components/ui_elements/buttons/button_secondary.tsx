type ButtonType = "button" | "submit" | "reset";

/**
 * 
import React from 'react';
import ButtonSecondary from './ButtonSecondary';

const App: React.FC = () => {


  const handleClick = () => {
    console.log('Example!');
  };

  return (
    <div>
      <ButtonSecondary onClick={handleClick} />
    </div>
  );
};

export default App;
 * 
 */

interface ButtonSecondaryProps {
  title: string;
  type?: ButtonType;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const ButtonSecondary: React.FC<ButtonSecondaryProps> = ({
  title,
  type = "button",
  className,
  onClick,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`font-inter text-primary border border-primary rounded-lg px-8 py-2 cursor-pointer 
        hover:font-semibold hover:border-primary-hover hover:text-primary-hover
        transition-colors duration-300
        ${className}`}
    >
      {title}
    </button>
  );
};

export default ButtonSecondary;
