import React, { useState, useEffect } from "react";
import { getRequestReport } from "../services/centralStoreService";
import Table from "../components/tables/Table";

const RequestReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const result = await getRequestReport(fromDate || null, toDate || null);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load request report.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "requestId", label: "Request ID" },
    { key: "branchName", label: "Branch" },
    { key: "requestDate", label: "Date", render: (v) => new Date(v).toLocaleDateString() },
    { key: "status", label: "Status" },
    { key: "medicineName", label: "Medicine" },
    { key: "requested", label: "Requested" },
    { key: "approved", label: "Approved" },
  ];

  return (
    <>
      <h4 className="text-xl font-semibold mb-4">Request Report</h4>
      <div className="flex flex-wrap gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">From</label>
          <input type="date" className="mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">To</label>
          <input type="date" className="mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <div className="flex items-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors" onClick={fetchReport}>
            Filter
          </button>
        </div>
      </div>
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">{error}</div>}
      <Table columns={columns} data={data} loading={loading} />
      <button className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors" onClick={() => window.print()}>
        <i className="bi bi-printer mr-2"></i> Print
      </button>
    </>
  );
};

export default RequestReport;