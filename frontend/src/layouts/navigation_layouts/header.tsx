import React from "react";
import LinkNavigation from "../../components/ui_elements/links/link_navigation";
import ButtonPrimary from "../../components/ui_elements/buttons/button_primary";
import ButtonSecondary from "../../components/ui_elements/buttons/button_secondary";
import LogoSmashSkills from "../../components/logo/logo_smashskills";

// Header probs
export interface NavItem {
  label: string;
  path: string;
}

interface LayoutHeaderProps {
  items: NavItem[];
}

// Button probs
interface ButtonProps {
  title: string;
  className: string;
}

interface ButtonConfig {
  primary: ButtonProps;
  secondary: ButtonProps;
}

const buttonProps: ButtonConfig = {
  primary: {
    title: "Jetzt registrieren",
    className: "text-sm",
  },
  secondary: {
    title: "Hier einloggen",
    className: "text-sm text-white border-white",
  },
};

const LayoutHeader: React.FC<LayoutHeaderProps> = ({ items }) => {
  return (
    <div className="flex bg-secondary items-center justify-between py-3 px-20 shadow-md">
      <div className="flex items-center justify-center gap-5 text-white">
        <LogoSmashSkills className="h-10" />
        <h1 className="text-4xl">SmashSkills</h1>
      </div>

      <nav className="">
        <LinkNavigation items={items} />
      </nav>
      <div className="flex gap-5">
        <ButtonSecondary
          title={buttonProps.secondary.title}
          className={buttonProps.secondary.className}
        />
        <ButtonPrimary
          title={buttonProps.primary.title}
          className={buttonProps.primary.className}
        />
      </div>
    </div>
  );
};

export default LayoutHeader;
