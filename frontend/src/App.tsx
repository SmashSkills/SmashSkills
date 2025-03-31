//utils
import "./App.css";
import { Routes, Route } from "react-router-dom";
// Pages
import Home from "./pages/home";
import ToUse from "./pages/to_use";
//components
import LayoutHeader, { NavItem } from "./layouts/navigation_layouts/header";

const navItems: NavItem[] = [
  { label: "Startseite", path: "/" },
  { label: "Benutzung", path: "/to-use" },
  { label: "Lehrpläne", path: "/a" },
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
          <Route path="/to-use" element={<ToUse />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
