import React, { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import pharmacyCashierApi from "./Services/pharmacyCashierApi";
import SummaryCards from "./Components/SummaryCards";
import LoadingSpinner from "./Shared/LoadingSpinner";
import ErrorMessage from "./Shared/ErrorMessage";

const PharmacyCashierDashboard = () => {
  const { setPageTitle } = useOutletContext() || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    setPageTitle?.("Dashboard");
    pharmacyCashierApi.todayCollection()
      .then((r) => setData(r.data))
      .catch((e) => setError(e.response?.data?.message || "Failed"))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  return (
    <div className="space-y-6">
      <SummaryCards totalCollected={data?.totalCollected} totalTransactions={data?.totalTransactions}
        cashTotal={data?.cashTotal} telebirrTotal={data?.telebirrTotal} />
      <Link to="/pharmacy-cashier/unpaid-prescriptions"
        className="block bg-white rounded-xl border shadow-sm p-6 hover:shadow-md flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <i className="bi bi-prescription2 text-2xl"></i>
        </div>
        <div>
          <h3 className="font-semibold">Unpaid Prescriptions</h3>
          <p className="text-sm text-gray-500">All branch pharmacies</p>
        </div>
      </Link>
    </div>
  );
};
export default PharmacyCashierDashboard;
