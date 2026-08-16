import React, { useState, useEffect } from "react";
import { getInventoryValueReport } from "../Services/reportService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";

const InventoryValueReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInventoryValueReport();
      setReport(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inventory value report.");
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
        <h1 className="text-2xl font-bold text-gray-800">Inventory Value Report</h1>
        <span className="text-sm text-gray-500">
          Generated: {new Date(report.reportDate).toLocaleString()}
        </span>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-500">Total Inventory Value</p>
          <p className="text-4xl font-bold text-green-600">
            ${report.totalValue?.toFixed(2) || "0.00"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {report.items?.length || 0} medicines
          </p>
        </div>
      </div>

      {report.items?.length === 0 ? (
        <EmptyState message="No inventory value data available." />
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {report.items.map((item, idx) => {
                const percent = report.totalValue > 0 
                  ? ((item.totalValue / report.totalValue) * 100).toFixed(1)
                  : 0;
                return (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.medicineName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.totalQuantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">${item.unitPrice?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                      ${item.totalValue?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{percent}%</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="3" className="px-4 py-3 text-sm font-bold text-gray-800">Total</td>
                <td className="px-4 py-3 text-sm font-bold text-green-600">
                  ${report.totalValue?.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventoryValueReport;
