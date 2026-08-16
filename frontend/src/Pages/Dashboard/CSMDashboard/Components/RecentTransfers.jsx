import React from "react";
import EmptyState from "../Shared/EmptyState";

const RecentTransfers = ({ items }) => {
  if (!items || items.length === 0) {
    return <EmptyState message="No recent transfers" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer ID</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((t, idx) => (
            <tr key={idx}>
              <td className="px-4 py-2 text-sm text-gray-900">#{t.transferId}</td>
              <td className="px-4 py-2 text-sm text-gray-700">{new Date(t.transferDate).toLocaleDateString()}</td>
              <td className="px-4 py-2 text-sm">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {t.status}
                </span>
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">{t.totalItems}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentTransfers;
