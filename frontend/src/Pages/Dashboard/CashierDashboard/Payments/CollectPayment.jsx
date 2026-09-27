import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import cashierApi from "../Services/cashierApi";
import PaymentForm from "../Components/PaymentForm";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";

const CollectPayment = () => {
  const { billId } = useParams();
  const navigate = useNavigate();
  const { setPageTitle } = useOutletContext() || {};
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPageTitle?.("Collect Payment");
    loadBill();
  }, [billId]);

  const loadBill = async () => {
    setLoading(true);
    try {
      const res = await cashierApi.getBill(billId);
      setBill(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Bill not found");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (formData) => {
    setPaying(true);
    setError("");
    try {
      const res = await cashierApi.pay({
        billID: Number(billId),
        amountPaid: formData.amountPaid,
        paymentMethod: formData.paymentMethod,
        transactionReference: formData.transactionReference,
        notes: formData.notes,
      });
      navigate("/cashier/payment-success", {
        state: { receipt: res.data },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error && !bill) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-lg space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-blue-600 hover:underline"
      >
        <i className="bi bi-arrow-left mr-1"></i> Back
      </button>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-lg font-bold mb-1">{bill?.patientName}</h2>
        <p className="text-sm text-gray-500 mb-4">
          MRN: {bill?.mrn} · Visit #{bill?.visitID}
        </p>
        <p className="text-sm mb-4">
          Remaining:{" "}
          <span className="font-bold text-red-600">
            ETB {Number(bill?.remainingAmount).toLocaleString()}
          </span>
        </p>

        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}

        <PaymentForm
          remainingAmount={bill?.remainingAmount}
          onSubmit={handlePay}
          loading={paying}
        />
      </div>
    </div>
  );
};

export default CollectPayment;
