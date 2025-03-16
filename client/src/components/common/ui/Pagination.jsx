import React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange, className }) => {
  return (
    <div
      className={`flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 ${className}`}
    >
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg border border-background-200 text-text-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-100 transition-all duration-300 hover:shadow-md space-x-2"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        <span>Previous</span>
      </button>

      {/* Page Indicator */}
      <div className="px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm bg-background-100 rounded-lg border border-background-200 text-text-500 font-medium">
        Page {currentPage} of {totalPages}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg border border-background-200 text-text-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-100 transition-all duration-300 hover:shadow-md space-x-2"
      >
        <span>Next</span>
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    </div>
  );
};

export default Pagination;
