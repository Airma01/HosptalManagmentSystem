import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import { getBranchConsumption } from "../Services/branchService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";

const BranchConsumption = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [consumption, setConsumption] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [branchName, setBranchName] = useState("");

  const loadConsumption = async (from, to) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBranchConsumption(id, from, to);
      setConsumption(data);
      if (data.length > 0) {
        setBranchName(data[0].branchName || "Branch");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load branch consumption.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    setFromDate(thirtyDaysAgo.toISOString().split("T")[0]);
    setToDate(now.toISOString().split("T")[0]);
    loadConsumption(thirtyDaysAgo.toISOString(), now.toISOString());
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fromDate && toDate) {
      loadConsumption(fromDate, toDate);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => loadConsumption(fromDate, toDate)} />;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate(`/csm/branch/${id}`)}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <BsArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {branchName || "Branch"} – Consumption
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4 bg-white shadow rounded-lg p-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1 block border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1 block border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Apply Filter
        </button>
      </form>

      {consumption.length === 0 ? (
        <EmptyState message="No consumption data found for the selected period." />
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Consumed</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period Start</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {consumption.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.medicineName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-semibold">{item.totalConsumed}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(item.periodStart).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(item.periodEnd).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BranchConsumption;
