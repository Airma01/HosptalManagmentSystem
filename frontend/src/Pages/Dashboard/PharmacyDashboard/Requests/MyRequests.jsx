import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pharmacyApi from "../Services/pharmacyApi";

const MyRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelLoading, setCancelLoading] = useState(null);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await pharmacyApi.getMyRequests();
      setRequests(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to load your requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      setCancelLoading(requestId);
      await pharmacyApi.cancelRequest(requestId, { cancelReason: "Cancelled by pharmacist" });
      // Refresh list
      await fetchRequests();
    } catch (err) {
      console.error("Cancel error:", err);
      setError(err.response?.data?.message || "Failed to cancel request.");
    } finally {
      setCancelLoading(null);
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/pharmacy/requests/${id}`);
  };

  // Filter by status or ID
  const filtered = requests.filter((r) =>
    r.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.centralRequestId.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-800",
      Approved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
      Cancelled: "bg-gray-100 text-gray-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Requests</h1>
        <button
          onClick={() => navigate("/pharmacy/requests/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
        >
          <i className="bi bi-plus-circle"></i> New Request
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
            placeholder="Search by request ID or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="text-sm text-gray-500">
          Total: <span className="font-medium">{requests.length}</span> requests
        </div>
      </div>

      {currentItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <i className="bi bi-inbox text-5xl text-gray-300 block mb-3"></i>
          <p className="text-gray-500">No requests found.</p>
          <button
            onClick={() => navigate("/pharmacy/requests/new")}
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Create Your First Request
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Request ID</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Total Items</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Approved</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((r) => (
                  <tr key={r.centralRequestId} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">#{r.centralRequestId}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(r.requestDate).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.totalItems}</td>
                    <td className="px-4 py-3 text-gray-600">{r.approvedQuantityTotal || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(r.centralRequestId)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                        >
                          <i className="bi bi-eye"></i> View
                        </button>
                        {r.status === "Pending" && (
                          <button
                            onClick={() => handleCancel(r.centralRequestId)}
                            disabled={cancelLoading === r.centralRequestId}
                            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                          >
                            {cancelLoading === r.centralRequestId ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <i className="bi bi-x-circle"></i>
                            )}
                            Cancel
                          </button>
                        )}
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

export default MyRequests;