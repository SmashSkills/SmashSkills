//utils
import "./App.css";
//components
import LogoSmashSkills from "./components/logo/logo_smashskills";
import ButtonPrimary from "./components/ui_elements/buttons/button_primary";
import ButtonSecondary from "./components/ui_elements/buttons/button_secondary";

function App() {
  return (
    <div className="bg-secondary flex gap-20 items-center">
      <LogoSmashSkills className="" />
      <div className="flex gap-5">
        <ButtonSecondary title="Secondary" />
        <ButtonPrimary title="Primary" />
      </div>
    </div>
  );
}

export default App;
