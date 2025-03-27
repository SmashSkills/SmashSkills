// Beispiel: In deiner LinkNavigation-Komponente
import React from "react";
import { NavLink } from "react-router-dom";

export interface NavItem {
  label: string;
  path: string;
}

interface LinkNavigationProps {
  items: NavItem[];
}

const LinkNavigation: React.FC<LinkNavigationProps> = ({ items }) => {
  return (
    <nav className="text-primary ">
      <ul className="flex gap-5">
        {items.map((item, index) => (
          <li key={index}>
            <NavLink to={item.path}>
              {({ isActive }) => (
                <div className="relative group ">
                  <span
                    className={` ${
                      isActive
                        ? "font-bold"
                        : "hover:font-bold"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`absolute left-0 right-0 bottom-0 h-0.5 bg-primary transform origin-center transition-transform duration-300 ${
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  ></span>
                </div>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default LinkNavigation;
