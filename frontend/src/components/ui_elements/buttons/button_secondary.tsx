interface ButtonSecondaryProps {
  title: string;
  className?: string;
}

const ButtonSecondary: React.FC<ButtonSecondaryProps> = ({
  title,
  className,
}) => {
  return (
    <button
      className={`font-inter text-primary border-1 border-primary rounded-full px-10 py-2 
        hover:font-semibold hover:border-primary-hover hover:text-primary-hover
        transition-colors duration-300
        ${className}`}
    >
      {title}
    </button>
  );
};

export default ButtonSecondary;
