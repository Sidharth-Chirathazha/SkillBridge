import React from 'react';

const DropdownMenu = ({ dropDownItems, value, onChange, defaultLabel="Select an option" }) => {
  return (
    <div className="w-full">
      <select
        value={value??""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
      >
        <option value="">{defaultLabel}</option>
        {dropDownItems?.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownMenu;