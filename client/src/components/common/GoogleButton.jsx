import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

const GoogleButton = () => {
  return (
    <button className="w-full flex items-center justify-center py-2 border rounded-md  border-[#F23276] text-[#273044]
        hover:bg-[#1E467F] hover:text-white hover:border-none group text-sm">
      <FontAwesomeIcon icon={faGoogle} className="text-[#F23276] mr-2 group-hover:text-white transition-colors" />
      Continue with Google
    </button>
  );
};

export default GoogleButton;