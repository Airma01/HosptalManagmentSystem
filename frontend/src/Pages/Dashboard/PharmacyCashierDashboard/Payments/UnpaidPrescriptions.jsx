import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import pharmacyCashierApi from "../Services/pharmacyCashierApi";
import SearchBar from "../Shared/SearchBar";
import UnpaidPrescriptionsTable from "../Components/UnpaidPrescriptionsTable";
import LoadingSpinner from "../Shared/LoadingSpinner";
import EmptyState from "../Shared/EmptyState";
import ErrorMessage from "../Shared/ErrorMessage";

const UnpaidPrescriptions = () => {
  const { setPageTitle } = useOutletContext() || {};
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setPageTitle?.("Unpaid Prescriptions"); load(); }, []);
  const load = async () => {
    setLoading(true); setError("");
    try {
      const params = {};
      const q = search.trim();
      if (q) { if (/^\d+$/.test(q)) params.patientId = Number(q); else params.mrn = q; }
      const res = await pharmacyCashierApi.getUnpaidPrescriptions(params);
      setList(res.data || []);
    } catch (e) { setError(e.response?.data?.message || "Failed"); setList([]); }
    finally { setLoading(false); }
  };
  return (
    <div className="space-y-4">
      <SearchBar value={search} onChange={setSearch} onSearch={load} placeholder="Search by MRN or Patient ID (all branches)..." />
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={load} />}
      {!loading && !error && list.length === 0 && (
        <EmptyState icon="bi-prescription2" title="No unpaid prescriptions" message="All branches checked." />
      )}
      {!loading && list.length > 0 && <UnpaidPrescriptionsTable prescriptions={list} />}
    </div>
  );
};
export default UnpaidPrescriptions;
