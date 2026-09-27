import React from "react";
import { useNavigate } from "react-router-dom";

const UnpaidRequestsTable = ({ requests = [] }) => {
  const navigate = useNavigate();
  if (!requests.length) return null;
  return (
    <div className="overflow-x-auto bg-white rounded-xl border shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">MRN</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Patient</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Exam</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Doctor</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Price</th>
            <th className="text-center px-4 py-3 font-medium text-gray-600">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {requests.map((r) => (
            <tr key={r.radiologyRequestID} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs">{r.mrn}</td>
              <td className="px-4 py-3 font-medium">{r.patientName}</td>
              <td className="px-4 py-3">{r.examName}</td>
              <td className="px-4 py-3 text-gray-500">{r.doctorName}</td>
              <td className="px-4 py-3 text-right font-semibold">ETB {Number(r.price).toLocaleString()}</td>
              <td className="px-4 py-3 text-center">
                <button onClick={() => navigate(`/radiology-cashier/pay/${r.radiologyRequestID}`, { state: { request: r } })}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700">
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
export default UnpaidRequestsTable;
