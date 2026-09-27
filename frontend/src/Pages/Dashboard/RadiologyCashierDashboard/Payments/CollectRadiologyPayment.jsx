import React, { useState } from "react";
import { useParams, useNavigate, useLocation, useOutletContext } from "react-router-dom";
import radiologyCashierApi from "../Services/radiologyCashierApi";
import PaymentForm from "../Components/PaymentForm";
import ErrorMessage from "../Shared/ErrorMessage";

const CollectRadiologyPayment = () => {
  const { requestId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { setPageTitle } = useOutletContext() || {};
  const request = state?.request;
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  React.useEffect(() => { setPageTitle?.("Collect Radiology Payment"); }, []);
  const handlePay = async (formData) => {
    setPaying(true); setError("");
    try {
      const res = await radiologyCashierApi.pay({
        radiologyRequestID: Number(requestId),
        amountPaid: formData.amountPaid,
        paymentMethod: formData.paymentMethod,
        transactionReference: formData.transactionReference,
        notes: formData.notes,
      });
      navigate("/radiology-cashier/payment-success", { state: { receipt: res.data } });
    } catch (e) { setError(e.response?.data?.message || "Payment failed"); }
    finally { setPaying(false); }
  };
  return (
    <div className="max-w-lg space-y-4">
      <button onClick={() => navigate(-1)} className="text-sm text-indigo-600 hover:underline">
        <i className="bi bi-arrow-left mr-1"></i> Back
      </button>
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-lg font-bold">{request?.patientName || "Patient"}</h2>
        <p className="text-sm text-gray-500 mb-1">MRN: {request?.mrn} · {request?.examName}</p>
        <p className="text-sm mb-4">Amount: <span className="font-bold text-red-600">ETB {Number(request?.price || 0).toLocaleString()}</span></p>
        {error && <div className="mb-4"><ErrorMessage message={error} /></div>}
        <PaymentForm remainingAmount={request?.price || 0} onSubmit={handlePay} loading={paying} />
      </div>
    </div>
  );
};
export default CollectRadiologyPayment;
