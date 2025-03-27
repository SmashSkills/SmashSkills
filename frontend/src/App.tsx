//utils
import "./App.css";
import { Routes, Route } from "react-router-dom";
// Pages
import Home from "./pages/home";
import About from "./pages/about";
//components
import LayoutHeader, { NavItem } from "./layouts/navigation_layouts/header";

const navItems: NavItem[] = [
  { label: "Startseite", path: "/" },
  { label: "Lernfächer", path: "/about" },
  { label: "Aufgabenpool", path: "/jztu" },
  { label: "Profil", path: "/aboutfwe" },
];

function App() {
  return (
    <div>
      <div className="fixed top-0 left-0 w-full z-40">
        <LayoutHeader items={navItems} />
      </div>

      <div className="my-20 mx-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
