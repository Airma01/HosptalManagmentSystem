import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTransferDetails } from "../services/centralStoreService";

const TransferDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getTransferDetails(id);
        setTransfer(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load transfer.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (error) return <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">{error}</div>;
  if (!transfer) return <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">Transfer not found.</div>;

  return (
    <>
      <h4 className="text-xl font-semibold mb-4">Transfer Details</h4>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p><strong>Transfer ID:</strong> {transfer.centralTransferID}</p>
        <p><strong>Central Request ID:</strong> {transfer.centralRequestID || "N/A"}</p>
        <p><strong>Branch:</strong> {transfer.branchName}</p>
        <p><strong>Date:</strong> {new Date(transfer.transferDate).toLocaleString()}</p>
        <p><strong>Status:</strong> <span className={`px-2 py-1 text-xs font-semibold rounded-full ${transfer.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{transfer.status}</span></p>
        <h5 className="font-semibold mt-4 mb-2">Items</h5>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transfer.details && transfer.details.map((d, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{d.medicineName}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{d.quantityTransferred}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <button className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors" onClick={() => navigate("/csm/transfers")}>
        Back to Transfers
      </button>
    </>
  );
};

export default TransferDetails;