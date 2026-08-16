import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BsClockHistory,
  BsCheckCircle,
  BsXCircle,
  BsEye,
} from "react-icons/bs";
import {
  getPendingRequests,
  getApprovedRequests,
  getRejectedRequests,
} from "../Services/requestService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";
import StatusBadge from "../Shared/StatusBadge";

const RequestList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [requests, setRequests] = useState([]);

  const tabs = [
    { key: "pending", label: "Pending", icon: <BsClockHistory />, color: "yellow" },
    { key: "approved", label: "Approved", icon: <BsCheckCircle />, color: "green" },
    { key: "rejected", label: "Rejected", icon: <BsXCircle />, color: "red" },
  ];

  const loadRequests = async (tab) => {
    try {
      setLoading(true);
      setError(null);
      let data;
      switch (tab) {
        case "pending":
          data = await getPendingRequests();
          break;
        case "approved":
          data = await getApprovedRequests();
          break;
        case "rejected":
          data = await getRejectedRequests();
          break;
        default:
          data = [];
      }
      setRequests(data);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to load ${tab} requests.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests(activeTab);
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => loadRequests(activeTab)} />;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Medicine Requests</h1>
        <span className="text-sm text-gray-500">{requests.length} requests</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.key
                ? `border-b-2 border-${tab.color}-500 text-${tab.color}-600`
                : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
            }`}
          >
            {tab.icon}
            {tab.label}
            <span
              className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.key
                  ? `bg-${tab.color}-100 text-${tab.color}-800`
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {requests.length}
            </span>
          </button>
        ))}
      </div>

      {requests.length === 0 ? (
        <EmptyState message={`No ${activeTab} requests found.`} />
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req.centralRequestID}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">#{req.centralRequestID}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{req.branchName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(req.requestDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{req.totalItems}</td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      to={`/csm/request/${req.centralRequestID}`}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <BsEye /> View
                    </Link>
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

export default RequestList;
