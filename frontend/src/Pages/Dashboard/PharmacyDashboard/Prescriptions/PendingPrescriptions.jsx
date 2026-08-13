import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pharmacyApi from "../Services/pharmacyApi";

const PendingPrescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await pharmacyApi.getPendingPrescriptions();
      setPrescriptions(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      setError("Failed to load prescriptions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter by patient name or ID
  const filtered = prescriptions.filter((p) =>
    p.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.prescriptionId.toString().includes(searchTerm)
  );

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleViewDetails = (id) => {
    navigate(`/pharmacy/prescriptions/${id}`);
  };

  const handleCheckAvailability = (id) => {
    navigate(`/pharmacy/prescriptions/${id}/availability`);
  };

  const handleDispense = (id) => {
    navigate(`/pharmacy/dispense/new/${id}`);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-600">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pending Prescriptions</h1>
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          <button
            onClick={() => navigate("/pharmacy/dispense")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
          >
            <i className="bi bi-clock-history"></i> Dispense History
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Search & counts */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Search by patient name or prescription ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="text-sm text-gray-500">
          Total: <span className="font-medium">{prescriptions.length}</span> pending
        </div>
      </div>

      {/* Table */}
      {currentItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <i className="bi bi-prescription2 text-5xl text-gray-300 block mb-3"></i>
          <p className="text-gray-500">No pending prescriptions found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Prescription ID</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Patient</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Doctor</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Items</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((p) => (
                  <tr key={p.prescriptionId} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">#{p.prescriptionId}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(p.prescriptionDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{p.patientName}</td>
                    <td className="px-4 py-3 text-gray-600">{p.doctorName}</td>
                    <td className="px-4 py-3 text-gray-600">{p.totalItems}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleViewDetails(p.prescriptionId)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                        >
                          <i className="bi bi-eye"></i> View
                        </button>
                        <button
                          onClick={() => handleCheckAvailability(p.prescriptionId)}
                          className="text-yellow-600 hover:text-yellow-800 text-sm font-medium flex items-center gap-1"
                        >
                          <i className="bi bi-box"></i> Stock
                        </button>
                        <button
                          onClick={() => handleDispense(p.prescriptionId)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1"
                        >
                          <i className="bi bi-check-circle"></i> Dispense
                        </button>
                      </div>
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

export default PendingPrescriptions;