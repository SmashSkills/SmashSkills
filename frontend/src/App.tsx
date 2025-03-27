//utils
import "./App.css";
//components
import LogoSmashSkills from "./components/logo/logo_smashskills";
import ButtonPrimary from "./components/ui_elements/buttons/button_primary";
import ButtonSecondary from "./components/ui_elements/buttons/button_secondary";
import LayoutHeroSection from "./layouts/page_layouts/hero_section";

function App() {
  return (
    <div>
      <div className="bg-secondary flex gap-20 items-center p-4">
        <LogoSmashSkills className="h-10" />
        <div className="flex gap-5 text-xs">
          <ButtonSecondary title="Hier einloggen" className="" />
          <ButtonPrimary title="Jetzt registrieren" className="" />
        </div>
      </div>
      <div className="mt-20">
        {" "}
        <LayoutHeroSection
          title="SmashSkills"
          slogan="lorem Ipsum mashalla halla fihujwegflkwejhgf"
          buttonPrimaryTitle="Jetzt registrieren"
          buttonSecondaryTitle="Hier einloggen"
          classNameLogo="h-80"

        />
      </div>
    </div>
  );
}

export default App;
