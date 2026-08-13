import React, { useState, useEffect } from "react";
import { getStockReport } from "../services/centralStoreService";
import Table from "../components/tables/Table";

const StockReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getStockReport();
        setData(result);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load stock report.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const columns = [
    { key: "medicineName", label: "Medicine" },
    { key: "openingStock", label: "Opening" },
    { key: "received", label: "Received" },
    { key: "transferredOut", label: "Transferred Out" },
    { key: "closingStock", label: "Closing" },
  ];

  return (
    <>
      <h4 className="text-xl font-semibold mb-4">Stock Movement Report</h4>
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">{error}</div>}
      <Table columns={columns} data={data} loading={loading} />
      <button className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors" onClick={() => window.print()}>
        <i className="bi bi-printer mr-2"></i> Print
      </button>
    </>
  );
};

export default StockReport;