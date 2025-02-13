import React from 'react';
import { ChevronRight,ChevronLeft } from 'lucide-react';


const Pagination = ({ currentPage, totalPages, onPageChange, className }) => {
  return (
    <div className={`flex justify-center items-center space-x-4 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center px-4 py-2 text-sm rounded-lg border border-background-200 text-text-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-100 transition-all duration-300 hover:shadow-md space-x-2"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Previous</span>
      </button>
      
      <div className="px-4 py-2 text-sm bg-background-100 rounded-lg border border-background-200 text-text-500 font-medium">
        Page {currentPage} of {totalPages}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center px-4 py-2 text-sm rounded-lg border border-background-200 text-text-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-100 transition-all duration-300 hover:shadow-md space-x-2"
      >
        <span>Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Pagination;