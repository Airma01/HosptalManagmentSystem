import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import radiologyCashierApi from "../Services/radiologyCashierApi";
import SummaryCards from "../Components/SummaryCards";
import LoadingSpinner from "../Shared/LoadingSpinner";
import EmptyState from "../Shared/EmptyState";
import ErrorMessage from "../Shared/ErrorMessage";

const TodayCollection = () => {
  const { setPageTitle } = useOutletContext() || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    setPageTitle?.("Today Collection");
    radiologyCashierApi.todayCollection()
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
      {data?.payments?.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-xl border shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="text-left px-4 py-3">Receipt</th>
              <th className="text-left px-4 py-3">Patient</th>
              <th className="text-right px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Method</th>
            </tr></thead>
            <tbody className="divide-y">
              {data.payments.map((p, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 font-mono text-xs">{p.receiptNumber}</td>
                  <td className="px-4 py-3">{p.patientName}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-semibold">ETB {Number(p.amountPaid).toLocaleString()}</td>
                  <td className="px-4 py-3">{p.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState icon="bi-cash-stack" title="No payments today" />}
    </div>
  );
};
export default TodayCollection;
