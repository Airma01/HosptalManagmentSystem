import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import pharmacyApi from "../Services/pharmacyApi";
import AcceptTransferModal from "./AcceptTransferModal";

const TransferDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await pharmacyApi.getTransferDetails(id);
        setTransfer(res.data);
        setError("");
      } catch (err) {
        console.error("Error fetching transfer details:", err);
        setError("Failed to load transfer details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  const handleActionComplete = () => {
    navigate("/pharmacy/transfers");
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-600">Loading transfer details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
        </div>
        <button
          onClick={() => navigate("/pharmacy/transfers")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Transfers
        </button>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen text-center text-gray-500">
        Transfer not found.
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-800",
      Completed: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate("/pharmacy/transfers")}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <i className="bi bi-arrow-left"></i> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Transfer Details</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Transfer ID</p>
            <p className="text-lg font-medium text-gray-800">#{transfer.centralTransferId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="text-lg font-medium text-gray-800">
              {new Date(transfer.transferDate).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(transfer.status)}`}>
              {transfer.status}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div>
            <p className="text-sm text-gray-500">From Central Store</p>
            <p className="text-gray-800">{transfer.fromCentralStore}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Processed By</p>
            <p className="text-gray-800">{transfer.processedByManager}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold text-gray-700">Transfer Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Medicine</th>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Quantity</th>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Batch</th>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {transfer.details.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{item.medicineName}</td>
                  <td className="px-4 py-3 text-gray-600">{item.quantityTransferred}</td>
                  <td className="px-4 py-3 text-gray-600">{item.batchNumber || "N/A"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {transfer.status === "Pending" && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
          >
            <i className="bi bi-box-arrow-down"></i> Add to Inventory
          </button>
        )}
        <button
          onClick={() => navigate("/pharmacy/transfers")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
        >
          <i className="bi bi-arrow-left"></i> Back to List
        </button>
      </div>

      {showModal && (
        <AcceptTransferModal
          transfer={transfer}
          onClose={() => setShowModal(false)}
          onComplete={handleActionComplete}
        />
      )}
    </div>
  );
};

export default TransferDetails;