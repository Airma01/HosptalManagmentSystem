import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import laboratoryCashierApi from "../Services/laboratoryCashierApi";
import SearchBar from "../Shared/SearchBar";
import UnpaidTestsTable from "../Components/UnpaidTestsTable";
import LoadingSpinner from "../Shared/LoadingSpinner";
import EmptyState from "../Shared/EmptyState";
import ErrorMessage from "../Shared/ErrorMessage";

const UnpaidTests = () => {
  const { setPageTitle } = useOutletContext() || {};
  const [search, setSearch] = useState("");
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setPageTitle?.("Unpaid Lab Tests"); load(); }, []);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const params = {};
      const q = search.trim();
      if (q) {
        if (/^\d+$/.test(q)) params.patientId = Number(q);
        else params.mrn = q;
      }
      const res = await laboratoryCashierApi.getUnpaidTests(params);
      setTests(res.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load");
      setTests([]);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <SearchBar value={search} onChange={setSearch} onSearch={load} placeholder="Search by MRN or Patient ID..." />
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={load} />}
      {!loading && !error && tests.length === 0 && (
        <EmptyState icon="bi-droplet" title="No unpaid lab tests" message="All tests may be paid." />
      )}
      {!loading && tests.length > 0 && <UnpaidTestsTable tests={tests} />}
    </div>
  );
};

export default UnpaidTests;
