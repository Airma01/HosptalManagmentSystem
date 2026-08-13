import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pharmacyApi from "./Services/pharmacyApi";
import DashboardCards from "./Components/DashboardCards";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentTransfers, setRecentTransfers] = useState([]);
  const [error, setError] = useState("");

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await pharmacyApi.getDashboard();
        const data = response.data;
        setDashboardData(data);
        setRecentRequests(data.recentRequests || []);
        setRecentTransfers(data.recentTransfersList || []);
        setError("");
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Quick action handlers
  const handleCreateRequest = () => navigate("/pharmacy/requests/new");
  const handleViewInventory = () => navigate("/pharmacy/inventory");
  const handleDispense = () => navigate("/pharmacy/prescriptions");

  // Helper to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pharmacy Dashboard</h1>
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          <button
            onClick={handleCreateRequest}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
          >
            <i className="bi bi-plus-circle"></i> New Request
          </button>
          <button
            onClick={handleViewInventory}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
          >
            <i className="bi bi-box"></i> Inventory
          </button>
          <button
            onClick={handleDispense}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
          >
            <i className="bi bi-prescription2"></i> Dispense
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <DashboardCards data={dashboardData} loading={loading} />

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Requests */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-700">
              Recent Requests
            </h2>
            <button
              onClick={() => navigate("/pharmacy/requests")}
              className="text-blue-600 text-sm hover:underline"
            >
              View All
            </button>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-10 bg-gray-100 rounded"></div>
              <div className="h-10 bg-gray-100 rounded"></div>
              <div className="h-10 bg-gray-100 rounded"></div>
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="text-gray-500 text-center py-6">
              <i className="bi bi-inbox text-3xl block mb-2"></i>
              No recent requests
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Items</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.slice(0, 5).map((req) => (
                    <tr key={req.requestId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2">{formatDate(req.requestDate)}</td>
                      <td className="py-2">{req.totalItems}</td>
                      <td className="py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            req.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : req.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Transfers */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-700">
              Recent Transfers
            </h2>
            <button
              onClick={() => navigate("/pharmacy/transfers")}
              className="text-blue-600 text-sm hover:underline"
            >
              View All
            </button>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-10 bg-gray-100 rounded"></div>
              <div className="h-10 bg-gray-100 rounded"></div>
              <div className="h-10 bg-gray-100 rounded"></div>
            </div>
          ) : recentTransfers.length === 0 ? (
            <div className="text-gray-500 text-center py-6">
              <i className="bi bi-truck text-3xl block mb-2"></i>
              No recent transfers
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Items</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransfers.slice(0, 5).map((transfer) => (
                    <tr key={transfer.transferId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2">{formatDate(transfer.transferDate)}</td>
                      <td className="py-2">{transfer.totalItems}</td>
                      <td className="py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            transfer.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : transfer.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transfer.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;