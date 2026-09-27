import React from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../Shared/StatusBadge";

const UnpaidBillsTable = ({ bills = [] }) => {
  const navigate = useNavigate();

  if (!bills.length) return null;

  return (
    <div className="overflow-x-auto bg-white rounded-xl border shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">MRN</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Patient</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Visit</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Remaining</th>
            <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="text-center px-4 py-3 font-medium text-gray-600">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {bills.map((b) => (
            <tr key={b.billID} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs">{b.mrn}</td>
              <td className="px-4 py-3 font-medium">{b.patientName}</td>
              <td className="px-4 py-3">#{b.visitID}</td>
              <td className="px-4 py-3 text-gray-500">
                {b.billDate ? new Date(b.billDate).toLocaleDateString() : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                ETB {Number(b.totalAmount).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-red-600">
                ETB {Number(b.remainingAmount).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-center">
                <StatusBadge status={b.status} />
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => navigate(`/cashier/pay/${b.billID}`)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                >
                  <i className="bi bi-cash mr-1"></i> Pay
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UnpaidBillsTable;
