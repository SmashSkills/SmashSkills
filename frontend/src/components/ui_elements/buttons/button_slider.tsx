import React from "react";
import { IoIosArrowForward } from "react-icons/io";

interface ButtonSliderProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const ButtonSlider: React.FC<ButtonSliderProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-12 h-12 rounded-full bg-white transition duration-300 hover:scale-105"
    >
      <IoIosArrowForward className="text-secondary  hover:text-primary-hover" />
    </button>
  );
};

export default ButtonSlider;
