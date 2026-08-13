import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPendingRequests } from "../services/centralStoreService";
import Table from "../components/tables/Table";
import Pagination from "../components/pagination/Pagination";

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getPendingRequests(page, pageSize);
        setRequests(data.items || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load requests.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page]);

  const columns = [
    { key: "branchName", label: "Branch" },
    { key: "requestDate", label: "Date", render: (v) => new Date(v).toLocaleString() },
    {
      key: "status",
      label: "Status",
      render: (v) => <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">{v}</span>,
    },
  ];

  const actions = (row) => (
    <Link to={`/csm/requests/${row.requestID}`} className="text-blue-600 hover:underline text-sm">
      View
    </Link>
  );

  return (
    <>
      <h4 className="text-xl font-semibold mb-4">Pending Requests</h4>
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">{error}</div>}
      <Table columns={columns} data={requests} loading={loading} actions={actions} />
      <Pagination current={page} total={total} pageSize={pageSize} onPageChange={setPage} />
    </>
  );
};

export default PendingRequests;