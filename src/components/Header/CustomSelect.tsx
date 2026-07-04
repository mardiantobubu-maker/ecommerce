import React, { useState, useEffect, useRef } from "react";

const CustomSelect = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="dropdown-content custom-select relative w-full">
      <div
        className={`select-selected w-full whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer px-2 xsm:px-4 py-2.5 bg-gray-1 border border-gray-3 rounded-l-[5px] text-base ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={toggleDropdown}
      >
        {selectedOption.label}
      </div>
      <div className={`select-items absolute left-0 top-full w-full bg-white border border-gray-3 rounded-b-md shadow-lg z-10 ${isOpen ? "" : "select-hide"}`}>
        {options.map((option, index) => (
          <div
            key={index}
            onClick={() => handleOptionClick(option)}
            className={`select-item px-4 py-2 cursor-pointer hover:bg-gray-1 text-base ${
              value === option.value ? "same-as-selected bg-gray-2" : ""
            }`}
          >
            {option.label}
          </div>



        ))}
      </div>
    </div>
  );
};

export default CustomSelect;
