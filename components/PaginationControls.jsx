import React from 'react';

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex justify-center mt-4 space-x-2">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="px-4 py-2 border rounded-l bg-gray-900 text-white hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      Previous
    </button>
    <span className="px-4 py-2 border-t border-b bg-gray-100">
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="px-4 py-2 border rounded-r bg-gray-900 text-white hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      Next
    </button>
  </div>
);

export default PaginationControls;
