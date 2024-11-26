import React from 'react';

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex justify-center mt-4 space-x-2">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="px-3 py-1 border rounded-l disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      Previous
    </button>
    <span className="px-4 py-1 border-t border-b">
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="px-3 py-1 border rounded-r disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      Next
    </button>
  </div>
);

export default PaginationControls;
