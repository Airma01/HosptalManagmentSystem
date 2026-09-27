import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import cashierApi from "../Services/cashierApi";
import StatusBadge from "../Shared/StatusBadge";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";

const BillDetails = () => {
  const { billId } = useParams();
  const navigate = useNavigate();
  const { setPageTitle } = useOutletContext() || {};
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setPageTitle?.("Bill Details");
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

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!bill) return null;

  return (
    <div className="max-w-2xl space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-blue-600 hover:underline"
      >
        <i className="bi bi-arrow-left mr-1"></i> Back
      </button>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold">{bill.patientName}</h2>
            <p className="text-sm text-gray-500">MRN: {bill.mrn}</p>
            <p className="text-sm text-gray-500">Visit #{bill.visitID}</p>
          </div>
          <StatusBadge status={bill.status} />
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Bill Items</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="text-left py-2">Service</th>
                <th className="text-center py-2">Qty</th>
                <th className="text-right py-2">Unit</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {(bill.items || []).map((item) => (
                <tr key={item.billItemID} className="border-b">
                  <td className="py-2">{item.serviceName}</td>
                  <td className="text-center py-2">{item.quantity}</td>
                  <td className="text-right py-2">
                    {Number(item.unitPrice).toLocaleString()}
                  </td>
                  <td className="text-right py-2">
                    {Number(item.totalPrice).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between text-sm">
          <span>Total</span>
          <span className="font-bold">
            ETB {Number(bill.totalAmount).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm text-green-600">
          <span>Paid</span>
          <span>ETB {Number(bill.paidAmount).toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-red-600 mt-1">
          <span>Remaining</span>
          <span>ETB {Number(bill.remainingAmount).toLocaleString()}</span>
        </div>

        {bill.status !== "Paid" && bill.status !== "Waived" && (
          <button
            onClick={() => navigate(`/cashier/pay/${bill.billID}`)}
            className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            <i className="bi bi-cash mr-2"></i> Collect Payment
          </button>
        )}
      </div>
    </div>
  );
};

export default BillDetails;
