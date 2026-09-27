import React, { useState } from "react";
import { useParams, useNavigate, useLocation, useOutletContext } from "react-router-dom";
import pharmacyCashierApi from "../Services/pharmacyCashierApi";
import PaymentForm from "../Components/PaymentForm";
import ErrorMessage from "../Shared/ErrorMessage";

const CollectPharmacyPayment = () => {
  const { prescriptionId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { setPageTitle } = useOutletContext() || {};
  const rx = state?.prescription;
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  React.useEffect(() => { setPageTitle?.("Collect Pharmacy Payment"); }, []);
  const handlePay = async (formData) => {
    setPaying(true); setError("");
    try {
      const res = await pharmacyCashierApi.pay({
        prescriptionID: Number(prescriptionId),
        amountPaid: formData.amountPaid,
        paymentMethod: formData.paymentMethod,
        transactionReference: formData.transactionReference,
        notes: formData.notes,
      });
      navigate("/pharmacy-cashier/payment-success", { state: { receipt: res.data } });
    } catch (e) { setError(e.response?.data?.message || "Payment failed"); }
    finally { setPaying(false); }
  };
  return (
    <div className="max-w-lg space-y-4">
      <button onClick={() => navigate(-1)} className="text-sm text-emerald-600 hover:underline">
        <i className="bi bi-arrow-left mr-1"></i> Back
      </button>
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-lg font-bold">{rx?.patientName || "Patient"}</h2>
        <p className="text-sm text-gray-500 mb-1">MRN: {rx?.mrn} · {rx?.branchName}</p>
        {rx?.medicines?.length > 0 && (
          <ul className="text-xs text-gray-600 mb-2 list-disc list-inside">
            {rx.medicines.slice(0, 5).map((m, i) => (
              <li key={i}>{m.medicineName} × {m.quantity}</li>
            ))}
          </ul>
        )}
        <p className="text-sm mb-4">Total: <span className="font-bold text-red-600">ETB {Number(rx?.totalAmount || 0).toLocaleString()}</span></p>
        {error && <div className="mb-4"><ErrorMessage message={error} /></div>}
        <PaymentForm remainingAmount={rx?.totalAmount || 0} onSubmit={handlePay} loading={paying} />
      </div>
    </div>
  );
};
export default CollectPharmacyPayment;
