import React from 'react';

function PaginationControls({ meta, onPageChange }) {
  if (!meta) {
    return null;
  }

  return (
    <div className="flex justify-between items-center mt-6 p-5 bg-white rounded-xl shadow-lg border border-gray-100">
      <button
        disabled={!meta.has_previous}
        onClick={() => onPageChange(meta.page - 1)}
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-eco-primary to-eco-secondary text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:opacity-90 active:scale-95"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>
      
      <div className="text-center">
        <div className="flex items-center gap-2">
          {/* Page indicator dots for small page counts */}
          {meta.total_pages <= 5 && (
            <div className="hidden md:flex items-center gap-1 mr-3">
              {[...Array(meta.total_pages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => onPageChange(idx + 1)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                    meta.page === idx + 1 
                      ? 'bg-eco-primary scale-125' 
                      : 'bg-gray-300 hover:bg-eco-secondary'
                  }`}
                />
              ))}
            </div>
          )}
          <p className="text-gray-700 font-medium">
            Page <span className="text-eco-primary font-bold">{meta.page}</span> of <span className="font-bold">{meta.total_pages}</span>
          </p>
        </div>
        <p className="text-gray-500 text-sm mt-1">
          {meta.total_count.toLocaleString()} total records
        </p>
      </div>
      
      <button
        disabled={!meta.has_next}
        onClick={() => onPageChange(meta.page + 1)}
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-eco-primary to-eco-secondary text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:opacity-90 active:scale-95"
      >
        Next
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

export default PaginationControls;

