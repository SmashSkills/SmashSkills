//utils
import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
// Pages
import Home from "./pages/home";
import ToUse from "./pages/to_use";
import CurriculaNotRegistered from "./pages/curricula_not_registered";
import DesignEditorPage from "./pages/design_editor";
//components
import LayoutHeader, { NavItem } from "./layouts/navigation_layouts/header";

const navItems: NavItem[] = [
  { label: "Startseite", path: "/" },
  { label: "Benutzung", path: "/to-use" },
  { label: "Lehrpläne", path: "/curricula-not-registered" },
  { label: "Design Editor", path: "/design-editor" },
];

function App() {
  const location = useLocation();
  const isWorksheetPage = location.pathname === "/worksheet";
  const isDesignEditorPage = location.pathname === "/design-editor";
  const fullScreenPage = isWorksheetPage || isDesignEditorPage;

  return (
    <div
      className={fullScreenPage ? "h-screen overflow-hidden" : "min-h-screen"}
    >
      <header className="fixed top-0 left-0 w-full z-40">
        <LayoutHeader items={navItems} />
      </header>
      <main className={fullScreenPage ? "pt-16 h-screen" : "py-40"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/to-use" element={<ToUse />} />
          <Route
            path="/curricula-not-registered"
            element={<CurriculaNotRegistered />}
          />
          <Route path="/design-editor" element={<DesignEditorPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
