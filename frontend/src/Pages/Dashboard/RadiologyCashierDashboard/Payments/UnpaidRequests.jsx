import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import radiologyCashierApi from "../Services/radiologyCashierApi";
import SearchBar from "../Shared/SearchBar";
import UnpaidRequestsTable from "../Components/UnpaidRequestsTable";
import LoadingSpinner from "../Shared/LoadingSpinner";
import EmptyState from "../Shared/EmptyState";
import ErrorMessage from "../Shared/ErrorMessage";

const UnpaidRequests = () => {
  const { setPageTitle } = useOutletContext() || {};
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setPageTitle?.("Unpaid Radiology"); load(); }, []);
  const load = async () => {
    setLoading(true); setError("");
    try {
      const params = {};
      const q = search.trim();
      if (q) { if (/^\d+$/.test(q)) params.patientId = Number(q); else params.mrn = q; }
      const res = await radiologyCashierApi.getUnpaidRequests(params);
      setRequests(res.data || []);
    } catch (e) { setError(e.response?.data?.message || "Failed"); setRequests([]); }
    finally { setLoading(false); }
  };
  return (
    <div className="space-y-4">
      <SearchBar value={search} onChange={setSearch} onSearch={load} placeholder="Search by MRN or Patient ID..." />
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={load} />}
      {!loading && !error && requests.length === 0 && <EmptyState icon="bi-radioactive" title="No unpaid requests" />}
      {!loading && requests.length > 0 && <UnpaidRequestsTable requests={requests} />}
    </div>
  );
};
export default UnpaidRequests;
