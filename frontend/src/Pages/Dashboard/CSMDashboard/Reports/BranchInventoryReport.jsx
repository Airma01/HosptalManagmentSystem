import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import { getBranchInventoryReport } from "../Services/reportService";
import { getAllBranches } from "../Services/branchService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";

const BranchInventoryReport = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(branchId || "");

  const loadBranches = async () => {
    try {
      const data = await getAllBranches();
      setBranches(data);
    } catch (err) {
      // Silently fail, we can still show report if branchId is provided
    }
  };

  const loadReport = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getBranchInventoryReport(id);
      setReport(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load branch inventory report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
    if (branchId) {
      loadReport(branchId);
    }
  }, [branchId]);

  const handleBranchChange = (e) => {
    const id = e.target.value;
    setSelectedBranch(id);
    if (id) {
      navigate(`/csm/report/branch-inventory/${id}`);
      loadReport(id);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => loadReport(selectedBranch)} />;
  if (!report) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/csm/report")}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <BsArrowLeft /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Branch Inventory Report</h1>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600 mb-4">Select a branch to view its inventory report.</p>
          <select
            value={selectedBranch}
            onChange={handleBranchChange}
            className="border border-gray-300 rounded-md p-2 w-full max-w-md"
          >
            <option value="">Select a branch</option>
            {branches.map((b) => (
              <option key={b.branchPharmacyID} value={b.branchPharmacyID}>
                {b.branchName}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate("/csm/report")}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <BsArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Inventory Report: {report.branchName}
        </h1>
        <span className="text-sm text-gray-500">
          Generated: {new Date(report.reportDate).toLocaleString()}
        </span>
      </div>

      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Items</p>
            <p className="text-2xl font-bold text-blue-600">{report.inventory?.length || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Quantity</p>
            <p className="text-2xl font-bold text-green-600">
              {report.inventory?.reduce((sum, i) => sum + (i.quantityAvailable || 0), 0) || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Unique Medicines</p>
            <p className="text-2xl font-bold text-purple-600">
              {new Set(report.inventory?.map(i => i.medicineID)).size || 0}
            </p>
          </div>
        </div>
      </div>

      {report.inventory?.length === 0 ? (
        <EmptyState message="No inventory items found for this branch." />
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {report.inventory.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.medicineName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.batchNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.quantityAvailable}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(item.expiryDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BranchInventoryReport;
