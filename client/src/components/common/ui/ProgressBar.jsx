import React from "react";


const ProgressBar = ({ progress }) => (
  <div className="flex items-center gap-2">
    <div className="w-full bg-gray-200 rounded-full h-2.5 relative overflow-hidden">
      <div
        className="bg-primary-500 h-2.5 rounded-full"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
    <span className="text-xs text-text-600 font-medium whitespace-nowrap">
      {Math.round(progress)}%
    </span>
  </div>
);
export default ProgressBar;