import React, { useState, useEffect } from "react";
import pharmacyApi from "../Services/pharmacyApi";

const StockReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await pharmacyApi.getStockReport();
      setData(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching stock report:", err);
      setError("Failed to load stock report.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.filter((item) =>
    item.medicineName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-600">Loading stock report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Stock Report</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500">Total Medicines</p>
          <p className="text-2xl font-bold text-blue-600">{data.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500">Total Batches</p>
          <p className="text-2xl font-bold text-green-600">{data.reduce((sum, i) => sum + i.batchCount, 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500">Total Quantity</p>
          <p className="text-2xl font-bold text-purple-600">{data.reduce((sum, i) => sum + i.totalQuantity, 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500">Avg per Medicine</p>
          <p className="text-2xl font-bold text-orange-600">
            {data.length ? Math.round(data.reduce((sum, i) => sum + i.totalQuantity, 0) / data.length) : 0}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Search by medicine name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <button
          onClick={() => window.print()}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
        >
          <i className="bi bi-printer"></i> Export / Print
        </button>
      </div>

      {currentItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No stock data available.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Medicine</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Generic Name</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Total Quantity</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Batches</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Earliest Expiry</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Latest Expiry</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{item.medicineName}</td>
                    <td className="px-4 py-3 text-gray-600">{item.genericName}</td>
                    <td className="px-4 py-3 font-medium text-gray-700">{item.totalQuantity}</td>
                    <td className="px-4 py-3 text-gray-600">{item.batchCount}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.oldestExpiry ? new Date(item.oldestExpiry).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.newestExpiry ? new Date(item.newestExpiry).toLocaleDateString() : "N/A"}
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

export default StockReport;