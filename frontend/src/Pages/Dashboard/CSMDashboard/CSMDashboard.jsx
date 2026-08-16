import React, { useState, useEffect } from "react";
import {
  getDashboardSummary,
  getDashboardStats,
  getLowStockMedicines,
  getExpiringMedicines,
  getInventoryValue,
  getBranchAlerts,
} from "./Services/dashboardService";
import DashboardHeader from "./Components/DashboardHeader";
import SummaryCards from "./Components/SummaryCards";
import DashboardStats from "./Components/DashboardStats";
import LowStockTable from "./Components/LowStockTable";
import ExpiringMedicineTable from "./Components/ExpiringMedicineTable";
import BranchAlertsTable from "./Components/BranchAlertsTable";
import InventoryValueChart from "./Components/InventoryValueChart";
import RecentTransfers from "./Components/RecentTransfers";
import LoadingSpinner from "./Shared/LoadingSpinner";
import ErrorMessage from "./Shared/ErrorMessage";
import EmptyState from "./Shared/EmptyState";
import "./CSMDashboard.css";

const CSMDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [inventoryValue, setInventoryValue] = useState([]);
  const [branchAlerts, setBranchAlerts] = useState([]);
  const [recentTransfers, setRecentTransfers] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        summaryData,
        statsData,
        lowStockData,
        expiringData,
        invValueData,
        alertsData,
      ] = await Promise.all([
        getDashboardSummary(),
        getDashboardStats(),
        getLowStockMedicines(),
        getExpiringMedicines(30),
        getInventoryValue(),
        getBranchAlerts(),
      ]);

      setSummary(summaryData);
      setStats(statsData);
      setLowStock(lowStockData || []);
      setExpiring(expiringData || []);
      setInventoryValue(invValueData || []);
      setBranchAlerts(alertsData || []);

      // We could also fetch recent transfers separately if needed
      // For now, we leave it empty or fetch from transfer endpoint if available
      // In future, we can use getRecentTransfers() from transferService
      setRecentTransfers([]);
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="csm-dashboard p-4 md:p-6 max-w-7xl mx-auto">
      <DashboardHeader />

      {/* Summary Cards */}
      <div className="mb-6">
        <SummaryCards summary={summary} />
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        <DashboardStats stats={stats} />
      </div>

      {/* Two-column layout: Low Stock & Expiring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Low Stock Medicines</h2>
          {lowStock.length === 0 ? (
            <EmptyState message="No low stock items." />
          ) : (
            <LowStockTable items={lowStock} />
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Expiring Soon (30 days)</h2>
          {expiring.length === 0 ? (
            <EmptyState message="No expiring medicines." />
          ) : (
            <ExpiringMedicineTable items={expiring} />
          )}
        </div>
      </div>

      {/* Branch Alerts & Inventory Value */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Branch Alerts</h2>
          {branchAlerts.length === 0 ? (
            <EmptyState message="No branch alerts." />
          ) : (
            <BranchAlertsTable items={branchAlerts} />
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Inventory Value by Medicine</h2>
          {inventoryValue.length === 0 ? (
            <EmptyState message="No inventory data." />
          ) : (
            <InventoryValueChart items={inventoryValue} />
          )}
        </div>
      </div>

      {/* Recent Transfers (placeholder) */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Recent Transfers</h2>
        {recentTransfers.length === 0 ? (
          <EmptyState message="No recent transfers." />
        ) : (
          <RecentTransfers items={recentTransfers} />
        )}
      </div>
    </div>
  );
};

export default CSMDashboard;
