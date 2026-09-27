import React from "react";

const TodayCollectionTable = ({ payments = [] }) => {
  if (!payments.length) return null;

  return (
    <div className="overflow-x-auto bg-white rounded-xl border shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Receipt</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Patient</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">MRN</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Method</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {payments.map((p) => (
            <tr key={p.paymentID} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs">{p.receiptNumber}</td>
              <td className="px-4 py-3 font-medium">{p.patientName}</td>
              <td className="px-4 py-3 font-mono text-xs">{p.mrn}</td>
              <td className="px-4 py-3 text-right font-semibold text-green-600">
                ETB {Number(p.amountPaid).toLocaleString()}
              </td>
              <td className="px-4 py-3">{p.paymentMethod}</td>
              <td className="px-4 py-3 text-gray-500">
                {p.paymentDate
                  ? new Date(p.paymentDate).toLocaleTimeString()
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TodayCollectionTable;
