import React, { useState, useEffect } from "react";
import pharmacyApi from "../Services/pharmacyApi";

const ExpiryReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, expired, near
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await pharmacyApi.getExpiryReport();
      setData(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching expiry report:", err);
      setError("Failed to load expiry report.");
    } finally {
      setLoading(false);
    }
  };

  // Filter by status and search
  const filtered = data.filter((item) => {
    const matchStatus =
      filter === "all" ||
      (filter === "expired" && item.status === "Expired") ||
      (filter === "near" && item.status === "Near Expiry") ||
      (filter === "valid" && item.status === "Valid");
    const matchSearch = item.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Summary
  const expiredCount = data.filter((i) => i.status === "Expired").length;
  const nearExpiryCount = data.filter((i) => i.status === "Near Expiry").length;
  const validCount = data.filter((i) => i.status === "Valid").length;

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-600">Loading expiry report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Expiry Report</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500">Expired</p>
          <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500">Near Expiry (≤30 days)</p>
          <p className="text-2xl font-bold text-yellow-600">{nearExpiryCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500">Valid</p>
          <p className="text-2xl font-bold text-green-600">{validCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("expired")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === "expired"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Expired
          </button>
          <button
            onClick={() => setFilter("near")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === "near"
                ? "bg-yellow-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Near Expiry
          </button>
          <button
            onClick={() => setFilter("valid")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === "valid"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Valid
          </button>
        </div>
        <div className="relative flex-1 max-w-xs">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Search medicine or batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {currentItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No items match your filters.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Medicine</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Batch</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Quantity</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Expiry Date</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Days Left</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.inventoryId} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{item.medicineName}</td>
                    <td className="px-4 py-3 text-gray-600">{item.batchNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{item.quantityAvailable}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.daysRemaining}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.status === "Expired"
                            ? "bg-red-100 text-red-800"
                            : item.status === "Near Expiry"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <span className="px-3 py-1 rounded bg-blue-600 text-white">{currentPage}</span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpiryReport;