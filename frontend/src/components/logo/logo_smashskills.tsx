import logo from "../../assets/logo/Logo.svg"

interface LogoSmashSkillsProps {
  className?: string;
}

const LogoSmashSkills: React.FC<LogoSmashSkillsProps> = ({ className }) => {
  return <img src={logo} alt="LogoSmashSkills" className={className} />;
};

export default LogoSmashSkills;
