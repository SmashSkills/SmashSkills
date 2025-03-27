import React from "react";
import logo from "../../assets/logo/Logo.svg";

interface LogoSmashSkillsProps {
  className?: string;
  glow?: boolean;
}

const LogoSmashSkills: React.FC<LogoSmashSkillsProps> = ({ className, glow = false }) => {
  return (
    <img
      src={logo}
      alt="LogoSmashSkills"
      className={`${className} ${glow ? "logo-glow" : ""}`}
    />
  );
};

export default LogoSmashSkills;
