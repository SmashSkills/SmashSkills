import { useState, useEffect, useRef } from "react";

/**
 * ButtonFilterDropdown Component
 *
 * A generic dropdown component with built-in filtering functionality.
 *
 * ? Usage:
 * @param - Provide an array of options via the `options` prop.
 * @param - Optionally specify a `labelExtractor` function to customize the displayed label for each option.
 *   This function takes an option as its parameter and should return a string.
 *   For example, if your options are objects with multiple properties (e.g., { id: number, name: string }),
 *   you can pass a function like `option => option.name` to display only the name property.
 *   If `labelExtractor` is not provided, the component defaults to using `String(option)` to generate the label.
 * @param - The `selected` prop indicates the current selection.
 * @param - The `onSelect` callback is triggered when an option is selected or deselected.
 *   (If the same option is selected twice, it is deselected.)
 * ? - The dropdown includes a text input to filter options.
 *
 * Simply import and use this component in your JSX.
 */

export interface ButtonFilterDropdownProps<T> {
  options: T[];
  selected?: T;
  onSelect: (option: T | undefined) => void;
  labelExtractor?: (option: T) => string;
  placeholder?: string;
}

export function ButtonFilterDropdown<T>({
  options,
  selected,
  onSelect,
  labelExtractor,
  placeholder = "Suche...",
}: ButtonFilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) => {
    const label = labelExtractor ? labelExtractor(option) : String(option);
    return label.toLowerCase().includes(filterText.toLowerCase());
  });

  const handleSelect = (option: T) => {
    if (selected === option) {
      onSelect(undefined);
    } else {
      onSelect(option);
    }
    setIsOpen(false);
    setFilterText("");
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        className="inline-flex justify-between items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {selected
          ? labelExtractor
            ? labelExtractor(selected)
            : String(selected)
          : placeholder}
        <svg
          className="w-5 h-5 ml-2 -mr-1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 010-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute mt-2 w-full rounded-md shadow-lg bg-white z-10">
          <div className="py-1">
            <input
              type="text"
              placeholder={placeholder}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full px-3 py-2 border-b border-gray-200 focus:outline-none"
            />
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const isSelected = selected === option;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelect(option)}
                    className={`block w-full text-left px-4 py-2 text-sm cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? "bg-gray-100 text-primary"
                        : "text-gray-700 hover:text-primary"
                    }`}
                  >
                    {labelExtractor ? labelExtractor(option) : String(option)}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                Keine Ergebnisse
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ButtonFilterDropdown;
