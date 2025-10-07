import React from 'react';

function PaginationControls({ meta, onPageChange }) {
  if (!meta) {
    return null;
  }

  return (
    <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-lg shadow-md">
      <button
        disabled={!meta.has_previous}
        onClick={() => onPageChange(meta.page - 1)}
        className="px-6 py-2 bg-eco-primary text-white rounded-lg hover:bg-eco-secondary transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ← Previous
      </button>
      
      <div className="text-center">
        <p className="text-gray-700 font-medium">
          Page {meta.page} of {meta.total_pages}
        </p>
        <p className="text-gray-500 text-sm">
          {meta.total_count} total records
        </p>
      </div>
      
      <button
        disabled={!meta.has_next}
        onClick={() => onPageChange(meta.page + 1)}
        className="px-6 py-2 bg-eco-primary text-white rounded-lg hover:bg-eco-secondary transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  );
}

export default PaginationControls;

