import React from "react";

const Pagination = ({ current, total, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const handlePage = (page) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  return (
    <div className="flex justify-center mt-4">
      <nav className="flex gap-1">
        <button
          className={`px-3 py-1 rounded-md border ${current === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
          onClick={() => handlePage(current - 1)}
          disabled={current === 1}
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`px-3 py-1 rounded-md border ${
              current === i + 1
                ? "bg-indigo-600 text-white border-indigo-600"
                : "hover:bg-gray-100"
            }`}
            onClick={() => handlePage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className={`px-3 py-1 rounded-md border ${current === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
          onClick={() => handlePage(current + 1)}
          disabled={current === totalPages}
        >
          Next
        </button>
      </nav>
    </div>
  );
};

export default Pagination;