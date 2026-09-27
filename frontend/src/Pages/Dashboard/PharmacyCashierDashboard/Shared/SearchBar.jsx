import React from "react";

const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search by MRN, name, or Visit ID...",
}) => (
  <div className="flex gap-2">
    <div className="relative flex-1">
      <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />
    </div>
    <button
      onClick={onSearch}
      className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
    >
      <i className="bi bi-search mr-1"></i> Search
    </button>
  </div>
);

export default SearchBar;
