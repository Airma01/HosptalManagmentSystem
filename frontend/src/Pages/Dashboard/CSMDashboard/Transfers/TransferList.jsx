import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BsPlus, BsEye, BsTruck, BsClockHistory } from "react-icons/bs";
import { getAllTransfers } from "../Services/transferService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";
import StatusBadge from "../Shared/StatusBadge";
import SearchBar from "../Shared/SearchBar";

const TransferList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const statuses = [
    "all",
    "Pending",
    "Dispatched",
    "InTransit",
    "Received",
    "Closed",
    "Cancelled",
  ];

  const loadTransfers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllTransfers();
      setTransfers(data);
      setFiltered(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load transfers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  const handleSearch = (query) => {
    applyFilters(query, statusFilter);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    applyFilters("", status);
  };

  const applyFilters = (query, status) => {
    let result = transfers;
    if (query && query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (t) =>
          t.branchName?.toLowerCase().includes(q) ||
          t.centralTransferID?.toString().includes(q)
      );
    }
    if (status !== "all") {
      result = result.filter((t) => t.status === status);
    }
    setFiltered(result);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadTransfers} />;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Transfers</h1>
        <Link
          to="/csm/transfer/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <BsPlus /> Create Transfer
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[200px]">
          <SearchBar onSearch={handleSearch} placeholder="Search by branch or ID..." />
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilter(status)}
              className={`px-3 py-1 text-sm rounded-full transition ${
                statusFilter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status === "all" ? "All" : status}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No transfers found." />
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transfer ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((t) => (
                <tr key={t.centralTransferID}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">#{t.centralTransferID}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {t.centralRequestID ? (
                      <Link
                        to={`/csm/request/${t.centralRequestID}`}
                        className="text-blue-600 hover:underline"
                      >
                        #{t.centralRequestID}
                      </Link>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{t.branchName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(t.transferDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{t.totalItems}</td>
                  <td className="px-4 py-3 text-sm flex gap-2">
                    <Link
                      to={`/csm/transfer/${t.centralTransferID}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <BsEye />
                    </Link>
                    <Link
                      to={`/csm/transfer/track/${t.centralTransferID}`}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <BsTruck />
                    </Link>
                    {t.status === "Pending" && (
                      <Link
                        to={`/csm/transfer/dispatch/${t.centralTransferID}`}
                        className="text-green-600 hover:text-green-800"
                      >
                        <BsClockHistory />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransferList;
