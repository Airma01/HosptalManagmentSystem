import React, { useState, useEffect } from "react";
import { getDashboard } from "../services/centralStoreService";
import DashboardStatCard from "../components/cards/DashboardStatCard";

const PharmacyInfo = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDashboard();
        setData(result);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  if (error)
    return <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">{error}</div>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <DashboardStatCard
          title="Total Stock"
          value={data.totalMedicinesInStock || 0}
          icon="bi-capsule"
          color="blue"
        />
        <DashboardStatCard
          title="Low Stock"
          value={data.lowStockCount || 0}
          icon="bi-exclamation-triangle"
          color="yellow"
          link="/csm/inventory/low-stock"
        />
        <DashboardStatCard
          title="Expired"
          value={data.expiredCount || 0}
          icon="bi-calendar-x"
          color="red"
          link="/csm/inventory/expired"
        />
        <DashboardStatCard
          title="Pending Requests"
          value={data.pendingRequestsCount || 0}
          icon="bi-clock-history"
          color="cyan"
          link="/csm/requests"
        />
      </div>

      {/* Recent Transfers */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h5 className="text-lg font-semibold mb-4">Recent Transfers</h5>
        {data.recentTransfers && data.recentTransfers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.recentTransfers.map((t) => (
                  <tr key={t.transferId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t.branchName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(t.transferDate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          t.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {t.totalItems}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center">No recent transfers.</p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a href="/csm/inventory" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          Manage Inventory
        </a>
        <a href="/csm/medicines" className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          Medicines
        </a>
        <a href="/csm/requests" className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          Pending Requests
        </a>
        <a href="/csm/transfers" className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          Transfers
        </a>
        <a href="/csm/reports/stock" className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          Reports
        </a>
      </div>
    </>
  );
};

export default PharmacyInfo;