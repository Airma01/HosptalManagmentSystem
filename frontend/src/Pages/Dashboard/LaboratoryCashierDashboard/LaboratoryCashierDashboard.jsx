import React, { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import laboratoryCashierApi from "./Services/laboratoryCashierApi";
import SummaryCards from "./Components/SummaryCards";
import LoadingSpinner from "./Shared/LoadingSpinner";
import ErrorMessage from "./Shared/ErrorMessage";

const LaboratoryCashierDashboard = () => {
  const { setPageTitle } = useOutletContext() || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setPageTitle?.("Dashboard");
    laboratoryCashierApi.todayCollection()
      .then((r) => setData(r.data))
      .catch((e) => setError(e.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <SummaryCards
        totalCollected={data?.totalCollected}
        totalTransactions={data?.totalTransactions}
        cashTotal={data?.cashTotal}
        telebirrTotal={data?.telebirrTotal}
      />
      <Link to="/laboratory-cashier/unpaid-tests"
        className="block bg-white rounded-xl border shadow-sm p-6 hover:shadow-md flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
          <i className="bi bi-droplet text-2xl"></i>
        </div>
        <div>
          <h3 className="font-semibold">Unpaid Lab Tests</h3>
          <p className="text-sm text-gray-500">Collect laboratory payments</p>
        </div>
      </Link>
    </div>
  );
};

export default LaboratoryCashierDashboard;
