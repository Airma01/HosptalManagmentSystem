import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTransfers } from "../services/centralStoreService";
import Table from "../components/tables/Table";
import Pagination from "../components/pagination/Pagination";

const TransferList = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getTransfers(page, pageSize);
        setTransfers(data.items || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load transfers.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page]);

  const columns = [
    { key: "branchName", label: "Branch" },
    { key: "transferDate", label: "Date", render: (v) => new Date(v).toLocaleString() },
    {
      key: "status",
      label: "Status",
      render: (v) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${v === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
          {v}
        </span>
      ),
    },
  ];

  const actions = (row) => (
    <Link to={`/csm/transfers/${row.transferId}`} className="text-blue-600 hover:underline text-sm">
      Details
    </Link>
  );

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold">Transfers</h4>
        <Link to="/csm/transfers/create" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          <i className="bi bi-plus-circle mr-2"></i> Create Transfer
        </Link>
      </div>
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">{error}</div>}
      <Table columns={columns} data={transfers} loading={loading} actions={actions} />
      <Pagination current={page} total={total} pageSize={pageSize} onPageChange={setPage} />
    </>
  );
};

export default TransferList;