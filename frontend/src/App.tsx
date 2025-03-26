//utils
import "./App.css";
//components
import LogoSmashSkills from "./components/logo/logo_smashskills";
import ButtonPrimary from "./components/ui_elements/buttons/button_primary";


function App() {
  return (
    <div className="bg-secondary flex gap-20 items-center">
      <LogoSmashSkills className=""/>
      <ButtonPrimary title="Primary"/>
    </div>
  );
}

export default App;
