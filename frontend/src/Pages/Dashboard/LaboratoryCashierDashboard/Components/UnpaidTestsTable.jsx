import React from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../Shared/StatusBadge";

const UnpaidTestsTable = ({ tests = [] }) => {
  const navigate = useNavigate();
  if (!tests.length) return null;

  return (
    <div className="overflow-x-auto bg-white rounded-xl border shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">MRN</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Patient</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Test</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Doctor</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Price</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
            <th className="text-center px-4 py-3 font-medium text-gray-600">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {tests.map((t) => (
            <tr key={t.testID} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs">{t.mrn}</td>
              <td className="px-4 py-3 font-medium">{t.patientName}</td>
              <td className="px-4 py-3">{t.testName}</td>
              <td className="px-4 py-3 text-gray-500">{t.doctorName}</td>
              <td className="px-4 py-3 text-right font-semibold">ETB {Number(t.price).toLocaleString()}</td>
              <td className="px-4 py-3 text-gray-500">{t.requestDate ? new Date(t.requestDate).toLocaleDateString() : "—"}</td>
              <td className="px-4 py-3 text-center">
                <button onClick={() => navigate(`/laboratory-cashier/pay/${t.testID}`, { state: { test: t } })}
                  className="px-3 py-1.5 bg-teal-600 text-white text-xs rounded-lg hover:bg-teal-700">
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

export default UnpaidTestsTable;
