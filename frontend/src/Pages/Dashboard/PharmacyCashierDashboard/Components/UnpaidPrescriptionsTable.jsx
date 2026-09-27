import React from "react";
import { useNavigate } from "react-router-dom";

const UnpaidPrescriptionsTable = ({ prescriptions = [] }) => {
  const navigate = useNavigate();
  if (!prescriptions.length) return null;
  return (
    <div className="overflow-x-auto bg-white rounded-xl border shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">MRN</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Patient</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Branch</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Doctor</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
            <th className="text-center px-4 py-3 font-medium text-gray-600">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {prescriptions.map((p) => (
            <tr key={p.prescriptionID} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs">{p.mrn}</td>
              <td className="px-4 py-3 font-medium">{p.patientName}</td>
              <td className="px-4 py-3 text-gray-500">{p.branchName || `Branch #${p.branchPharmacyID}`}</td>
              <td className="px-4 py-3 text-gray-500">{p.doctorName}</td>
              <td className="px-4 py-3 text-right font-semibold">ETB {Number(p.totalAmount).toLocaleString()}</td>
              <td className="px-4 py-3 text-gray-500">{p.prescriptionDate ? new Date(p.prescriptionDate).toLocaleDateString() : "—"}</td>
              <td className="px-4 py-3 text-center">
                <button onClick={() => navigate(`/pharmacy-cashier/pay/${p.prescriptionID}`, { state: { prescription: p } })}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700">
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
export default UnpaidPrescriptionsTable;
