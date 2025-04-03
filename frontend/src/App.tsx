//utils
import "./App.css";
import { Routes, Route } from "react-router-dom";
// Pages
import Home from "./pages/home";
import ToUse from "./pages/to_use";
import CurriculaNotRegistered from "./pages/curricula_not_registered";
//components
import LayoutHeader, { NavItem } from "./layouts/navigation_layouts/header";

const navItems: NavItem[] = [
  { label: "Startseite", path: "/" },
  { label: "Benutzung", path: "/to-use" },
  { label: "Lehrpläne", path: "/curricula-not-registered" },
];



function App() {
  return (
    <div className="h-full">
      <header className="fixed top-0 left-0 w-full z-40">
        <LayoutHeader items={navItems} />
      </header>

      <main className="py-40">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/to-use" element={<ToUse />} />
          <Route
            path="/curricula-not-registered"
            element={<CurriculaNotRegistered />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
