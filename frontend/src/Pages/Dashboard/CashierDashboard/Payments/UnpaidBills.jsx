import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import cashierApi from "../Services/cashierApi";
import SearchBar from "../Shared/SearchBar";
import UnpaidBillsTable from "../Components/UnpaidBillsTable";
import LoadingSpinner from "../Shared/LoadingSpinner";
import EmptyState from "../Shared/EmptyState";
import ErrorMessage from "../Shared/ErrorMessage";

const UnpaidBills = () => {
  const { setPageTitle } = useOutletContext() || {};
  const [search, setSearch] = useState("");
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    setPageTitle?.("Unpaid Bills");
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const params = {};
      const q = search.trim();
      if (q) {
        if (/^\d+$/.test(q)) {
          params.visitID = Number(q);
        } else if (q.length <= 20 && !q.includes(" ")) {
          params.mrn = q;
        } else {
          params.patientName = q;
        }
      }
      const res = await cashierApi.getUnpaidBills(params);
      setBills(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bills");
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="space-y-4">
      <SearchBar
        value={search}
        onChange={setSearch}
        onSearch={handleSearch}
        placeholder="Search by MRN, Patient Name, or Visit ID..."
      />

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={handleSearch} />}
      {!loading && !error && searched && bills.length === 0 && (
        <EmptyState
          icon="bi-receipt"
          title="No unpaid bills found"
          message="Try a different search or all bills may be paid."
        />
      )}
      {!loading && bills.length > 0 && <UnpaidBillsTable bills={bills} />}
    </div>
  );
};

export default UnpaidBills;
