import React, { useEffect } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import ReceiptCard from "../Components/ReceiptCard";

const PaymentSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { setPageTitle } = useOutletContext() || {};
  const receipt = state?.receipt;
  useEffect(() => {
    setPageTitle?.("Payment Success");
    if (!receipt) navigate("/radiology-cashier/unpaid-requests");
  }, []);
  if (!receipt) return null;
  return (
    <div className="space-y-4">
      <ReceiptCard receipt={receipt} />
      <div className="flex justify-center gap-3">
        <button onClick={() => navigate("/radiology-cashier/unpaid-requests")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Collect Another</button>
        <button onClick={() => navigate("/radiology-cashier/dashboard")}
          className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Dashboard</button>
      </div>
    </div>
  );
};
export default PaymentSuccess;
