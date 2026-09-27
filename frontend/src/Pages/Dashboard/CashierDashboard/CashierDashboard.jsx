import React, { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import cashierApi from "./Services/cashierApi";
import SummaryCards from "./Components/SummaryCards";
import LoadingSpinner from "./Shared/LoadingSpinner";
import ErrorMessage from "./Shared/ErrorMessage";

const CashierDashboard = () => {
  const { setPageTitle } = useOutletContext() || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setPageTitle?.("Dashboard");
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await cashierApi.todayCollection();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <SummaryCards
        totalCollected={data?.totalCollected}
        totalTransactions={data?.totalTransactions}
        cashTotal={data?.cashTotal}
        telebirrTotal={data?.telebirrTotal}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/cashier/unpaid-bills"
          className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <i className="bi bi-receipt text-2xl"></i>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Unpaid Bills</h3>
            <p className="text-sm text-gray-500">Search & collect consultation fees</p>
          </div>
        </Link>

        <Link
          to="/cashier/today-collection"
          className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <i className="bi bi-cash-stack text-2xl"></i>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Today Collection</h3>
            <p className="text-sm text-gray-500">View today's payment report</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default CashierDashboard;
