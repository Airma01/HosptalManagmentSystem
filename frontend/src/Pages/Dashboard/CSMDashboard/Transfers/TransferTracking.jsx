import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BsArrowLeft, BsCheckCircle, BsClock, BsTruck } from "react-icons/bs";
import { trackTransfer } from "../Services/transferService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import StatusBadge from "../Shared/StatusBadge";

const TransferTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tracking, setTracking] = useState(null);

  const loadTracking = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trackTransfer(id);
      setTracking(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tracking data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadTracking();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadTracking} />;
  if (!tracking) return <ErrorMessage message="Tracking data not found." />;

  const getStatusIcon = (status) => {
    const icons = {
      Pending: <BsClock className="text-yellow-500" />,
      Dispatched: <BsTruck className="text-blue-500" />,
      InTransit: <BsTruck className="text-purple-500" />,
      Received: <BsCheckCircle className="text-green-500" />,
      Closed: <BsCheckCircle className="text-gray-500" />,
      Cancelled: <BsClock className="text-red-500" />,
    };
    return icons[status] || <BsClock />;
  };

  const getTimelineColor = (status, currentStatus) => {
    const order = ["Pending", "Dispatched", "InTransit", "Received", "Closed"];
    const statusIndex = order.indexOf(status);
    const currentIndex = order.indexOf(currentStatus);
    if (statusIndex <= currentIndex) return "bg-green-500";
    return "bg-gray-300";
  };

  // Build timeline from history or create from status
  const timeline = tracking.history && tracking.history.length > 0
    ? tracking.history
    : [
        { status: "Pending", changedDate: tracking.dispatchedDate || tracking.inTransitDate || tracking.receivedDate || new Date().toISOString() },
        ...(tracking.dispatchedDate ? [{ status: "Dispatched", changedDate: tracking.dispatchedDate }] : []),
        ...(tracking.inTransitDate ? [{ status: "InTransit", changedDate: tracking.inTransitDate }] : []),
        ...(tracking.receivedDate ? [{ status: "Received", changedDate: tracking.receivedDate }] : []),
        ...(tracking.cancelledDate ? [{ status: "Cancelled", changedDate: tracking.cancelledDate }] : []),
      ].filter((t, i, arr) => arr.findIndex(x => x.status === t.status) === i);

  const currentStatus = tracking.status;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/csm/transfer/${id}`)}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <BsArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Transfer #{id} Tracking
        </h1>
        <StatusBadge status={currentStatus} />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Status Timeline</h2>
        <div className="space-y-4">
          {timeline.map((item, idx) => {
            const isCompleted = item.status === currentStatus ||
              ["Pending", "Dispatched", "InTransit", "Received"].indexOf(item.status) <
              ["Pending", "Dispatched", "InTransit", "Received"].indexOf(currentStatus);
            const isCurrent = item.status === currentStatus;
            return (
              <div key={idx} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${isCompleted ? "bg-green-500" : "bg-gray-300"} ${isCurrent ? "ring-4 ring-green-200" : ""}`} />
                  {idx < timeline.length - 1 && (
                    <div className={`w-0.5 h-8 ${isCompleted ? "bg-green-500" : "bg-gray-300"}`} />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span className={`font-medium ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                      {item.status}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  {item.changedDate && (
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(item.changedDate).toLocaleString()}
                    </p>
                  )}
                  {item.remarks && (
                    <p className="text-sm text-gray-600 mt-1 italic">"{item.remarks}"</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TransferTracking;
