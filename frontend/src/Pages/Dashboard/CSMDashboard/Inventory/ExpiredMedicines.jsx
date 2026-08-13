import React, { useState, useEffect } from "react";
import { getExpiredMedicines } from "../services/centralStoreService";
import Table from "../components/tables/Table";

const ExpiredMedicines = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getExpiredMedicines();
        setData(result);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load expired medicines.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const columns = [
    { key: "medicineName", label: "Medicine" },
    { key: "batchNumber", label: "Batch" },
    { key: "quantity", label: "Quantity" },
    {
      key: "expiryDate",
      label: "Expiry Date",
      render: (v) => new Date(v).toLocaleDateString(),
    },
  ];

  return (
    <>
      <h4 className="text-xl font-semibold mb-4">Expired Medicines</h4>
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">{error}</div>}
      <Table columns={columns} data={data} loading={loading} />
      {!loading && data.length === 0 && <p className="text-gray-500 text-center mt-4">No expired medicines.</p>}
    </>
  );
};

export default ExpiredMedicines;