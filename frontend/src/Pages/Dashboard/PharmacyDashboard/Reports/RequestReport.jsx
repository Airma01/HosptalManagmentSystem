import React, { useState, useEffect } from "react";
import pharmacyApi from "../Services/pharmacyApi";

const RequestReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await pharmacyApi.getRequestReport();
      setData(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching request report:", err);
      setError("Failed to load request report.");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = data.slice(startIndex, startIndex + itemsPerPage);

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
          <p className="mt-3 text-gray-600">Loading request report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Request Report</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {data.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No request data available.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Request ID</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Requested By</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Total Requested</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Approved</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((r) => (
                  <tr key={r.requestId} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">#{r.requestId}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(r.requestDate).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.requestedBy}</td>
                    <td className="px-4 py-3 text-gray-600">{r.totalRequested}</td>
                    <td className="px-4 py-3 text-gray-600">{r.totalApproved || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(r.status)}`}>
                        {r.status}
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
                Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, data.length)} of {data.length}
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

export default RequestReport;