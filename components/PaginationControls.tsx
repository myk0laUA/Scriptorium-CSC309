import React from 'react';

// used ChatGPT for conversion to tsx
interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPageChange }) => (
  <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2 mt-8 text-sm">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="secondary-button px-4 py-2 rounded disabled:opacity-40"
    >
      Previous
    </button>
    <span className="px-2 py-2 text-gray-600 dark:text-gray-400" aria-live="polite">
      Page {currentPage} of {Math.max(1, totalPages)}
    </span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage >= totalPages}
      className="secondary-button px-4 py-2 rounded disabled:opacity-40"
    >
      Next
    </button>
  </nav>
);

export default PaginationControls;
