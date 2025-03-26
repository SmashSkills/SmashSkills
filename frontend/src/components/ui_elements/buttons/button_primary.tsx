type ButtonType = "button" | "submit" | "reset";
interface ButtonPrimaryProps {
  title: string;
  type?: ButtonType;
  className?: string;
}

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  title,
  type = "button",
  className,
}) => {
  return (
    <button
      type={type}
      className={`font-inter text-white bg-primary rounded-full px-10 py-2 
        hover:font-semibold hover:bg-primary-hover 
        transition-colors duration-300
        ${className}`}
    >
      {title}
    </button>
  );
};

export default ButtonPrimary;
