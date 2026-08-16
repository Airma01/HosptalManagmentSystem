import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getExpiryReport } from "../Services/reportService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";

const ExpiryReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getExpiryReport();
      setReport(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load expiry report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;
  if (!report) return <ErrorMessage message="Report data not found." />;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Expiry Report</h1>
        <span className="text-sm text-gray-500">
          Generated: {new Date(report.reportDate).toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="font-semibold text-red-700 mb-2">Expired Medicines</h2>
          <p className="text-3xl font-bold text-red-600">{report.expired?.length || 0}</p>
          {report.expired?.length > 0 && (
            <p className="text-sm text-red-600 mt-1">
              Total Quantity: {report.expired.reduce((s, i) => s + (i.quantity || 0), 0)}
            </p>
          )}
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="font-semibold text-yellow-700 mb-2">Near Expiry (30 days)</h2>
          <p className="text-3xl font-bold text-yellow-600">{report.nearExpiry?.length || 0}</p>
          {report.nearExpiry?.length > 0 && (
            <p className="text-sm text-yellow-600 mt-1">
              Total Quantity: {report.nearExpiry.reduce((s, i) => s + (i.quantity || 0), 0)}
            </p>
          )}
        </div>
      </div>

      {report.expired?.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-gray-700 mb-2">Expired Items</h2>
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {report.expired.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.medicineName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.batchNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-red-600 font-semibold">{item.daysOverdue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {report.nearExpiry?.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-700 mb-2">Near Expiry Items</h2>
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Until</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {report.nearExpiry.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.medicineName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.batchNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-yellow-600 font-semibold">{item.daysUntilExpiry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {report.expired?.length === 0 && report.nearExpiry?.length === 0 && (
        <EmptyState message="No expiry issues found." />
      )}
    </div>
  );
};

export default ExpiryReport;
