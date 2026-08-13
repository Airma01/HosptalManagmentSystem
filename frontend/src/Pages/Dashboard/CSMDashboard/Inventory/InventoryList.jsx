import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getInventory } from "../services/centralStoreService";
import Table from "../components/tables/Table";
import Pagination from "../components/pagination/Pagination";

const InventoryList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getInventory(page, pageSize);
        setItems(data.items || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page]);

  const columns = [
    { key: "medicineName", label: "Medicine" },
    { key: "batchNumber", label: "Batch" },
    { key: "quantityAvailable", label: "Quantity" },
    { key: "expiryDate", label: "Expiry", render: (v) => new Date(v).toLocaleDateString() },
    { key: "source", label: "Source" },
  ];

  const actions = (row) => (
    <Link to={`/csm/inventory/update/${row.centralInventoryID}`} className="text-yellow-600 hover:underline text-sm">
      Adjust
    </Link>
  );

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold">Inventory</h4>
        <Link to="/csm/inventory/add" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          <i className="bi bi-plus-circle mr-2"></i> Add Stock
        </Link>
      </div>
      <Table columns={columns} data={items} loading={loading} actions={actions} />
      <Pagination current={page} total={total} pageSize={pageSize} onPageChange={setPage} />
    </>
  );
};

export default InventoryList;