type ButtonType = "button" | "submit" | "reset";

interface ButtonSecondaryProps {
  title: string;
  type?: ButtonType;
  className?: string;
}

const ButtonSecondary: React.FC<ButtonSecondaryProps> = ({
  title,
  type = "button",
  className,
}) => {
  return (
    <button
      type={type}
      className={`font-inter text-primary border border-primary rounded-full px-8 py-2 
        hover:font-semibold hover:border-primary-hover hover:text-primary-hover
        transition-colors duration-300
        ${className}`}
    >
      {title}
    </button>
  );
};

export default ButtonSecondary;
