import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMedicines, deactivateMedicine } from "../services/centralStoreService";
import Table from "../components/tables/Table";
import Pagination from "../components/pagination/Pagination";
import ConfirmModal from "../components/modals/ConfirmModal";
import MessageModal from "../components/modals/MessageModal";

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    fetchMedicines();
  }, [page, search]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const data = await getMedicines(search, page, pageSize);
      setMedicines(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "Failed to load medicines.", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMedicines();
  };

  const handleDeactivate = async () => {
    try {
      await deactivateMedicine(selectedId);
      setMessage({ text: "Medicine deactivated successfully.", variant: "success" });
      fetchMedicines();
    } catch (error) {
      if (error.response?.status === 501) {
        setMessage({
          text: "Deactivation is not supported by the backend (Medicine model lacks IsActive).",
          variant: "warning",
        });
      } else {
        setMessage({ text: error.response?.data?.message || "Failed to deactivate.", variant: "danger" });
      }
    } finally {
      setShowDeactivateModal(false);
      setSelectedId(null);
    }
  };

  const columns = [
    { key: "medicineName", label: "Name" },
    { key: "genericName", label: "Generic" },
    { key: "unitPrice", label: "Price", render: (v) => `$${v.toFixed(2)}` },
    { key: "unitOfMeasure", label: "Unit" },
  ];

  const actions = (row) => (
    <div className="flex gap-2">
      <Link to={`/csm/medicines/${row.medicineID}`} className="text-blue-600 hover:underline text-sm">
        View
      </Link>
      <Link to={`/csm/medicines/edit/${row.medicineID}`} className="text-indigo-600 hover:underline text-sm">
        Edit
      </Link>
      <button
        className="text-red-600 hover:underline text-sm"
        onClick={() => {
          setSelectedId(row.medicineID);
          setShowDeactivateModal(true);
        }}
      >
        Deactivate
      </button>
    </div>
  );

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold">Medicines</h4>
        <Link to="/csm/medicines/add" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          <i className="bi bi-plus-circle mr-2"></i> Add Medicine
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Search by name or generic"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
          Search
        </button>
        <button
          type="button"
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
          onClick={() => { setSearch(""); setPage(1); }}
        >
          Clear
        </button>
      </form>

      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          message.variant === "success" ? "bg-green-100 text-green-700" :
          message.variant === "danger" ? "bg-red-100 text-red-700" :
          "bg-yellow-100 text-yellow-700"
        } flex justify-between`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-gray-500 hover:text-gray-700">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}

      <Table columns={columns} data={medicines} loading={loading} actions={actions} />
      <Pagination current={page} total={total} pageSize={pageSize} onPageChange={setPage} />

      <ConfirmModal
        show={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Medicine"
        message="Are you sure you want to deactivate this medicine? This action may not be reversible."
        confirmText="Deactivate"
        variant="danger"
      />
    </>
  );
};

export default MedicineList;