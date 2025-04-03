import React from "react";
import { IoIosArrowForward } from "react-icons/io";
import { motion } from "framer-motion";

interface ButtonSliderProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  classNameWrapper?: string;
}

const ButtonSlider: React.FC<ButtonSliderProps> = ({ onClick, classNameWrapper }) => {
  return (
    <motion.button
      whileHover={{ backgroundColor: "rgba(255, 87, 34, 0.2)", scale: 1.2 }}
      transition={{ duration: 0 }}
      onClick={onClick}
      className={`group flex items-center justify-center w-12 h-12 rounded-full bg-white transition duration-300 border border-gray-300 ${classNameWrapper}`}
    >
      <IoIosArrowForward className="text-secondary group-hover:text-primary-hover" />
    </motion.button>
  );
};

export default ButtonSlider;

