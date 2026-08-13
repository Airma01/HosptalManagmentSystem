import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pharmacyApi from "../Services/pharmacyApi";

const DispenseHistory = () => {
  const navigate = useNavigate();
  const [dispenses, setDispenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await pharmacyApi.getDispenseHistory();
      setDispenses(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching dispense history:", err);
      setError("Failed to load dispense history.");
    } finally {
      setLoading(false);
    }
  };

  // Filter by patient name or dispense ID
  const filtered = dispenses.filter((d) =>
    d.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.dispenseId.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleViewDetails = (id) => {
    navigate(`/pharmacy/dispense/${id}`);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dispense History</h1>
        <button
          onClick={() => navigate("/pharmacy/prescriptions")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
        >
          <i className="bi bi-prescription2"></i> View Pending
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Search by patient name or dispense ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="text-sm text-gray-500">
          Total: <span className="font-medium">{dispenses.length}</span> dispenses
        </div>
      </div>

      {currentItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <i className="bi bi-clock-history text-5xl text-gray-300 block mb-3"></i>
          <p className="text-gray-500">No dispense history found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Dispense ID</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Patient</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Pharmacist</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Items</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Total Amount</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((d) => (
                  <tr key={d.dispenseId} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">#{d.dispenseId}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(d.dispenseDate).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{d.patientName}</td>
                    <td className="px-4 py-3 text-gray-600">{d.pharmacistName}</td>
                    <td className="px-4 py-3 text-gray-600">{d.totalItems}</td>
                    <td className="px-4 py-3 font-medium text-gray-700">
                      ${d.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewDetails(d.dispenseId)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        <i className="bi bi-eye"></i> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

export default DispenseHistory;