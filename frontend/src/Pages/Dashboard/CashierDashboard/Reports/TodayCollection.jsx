import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import cashierApi from "../Services/cashierApi";
import SummaryCards from "../Components/SummaryCards";
import TodayCollectionTable from "../Components/TodayCollectionTable";
import LoadingSpinner from "../Shared/LoadingSpinner";
import EmptyState from "../Shared/EmptyState";
import ErrorMessage from "../Shared/ErrorMessage";

const TodayCollection = () => {
  const { setPageTitle } = useOutletContext() || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setPageTitle?.("Today Collection");
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await cashierApi.todayCollection();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load collection");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <SummaryCards
        totalCollected={data?.totalCollected}
        totalTransactions={data?.totalTransactions}
        cashTotal={data?.cashTotal}
        telebirrTotal={data?.telebirrTotal}
      />
      {data?.payments?.length > 0 ? (
        <TodayCollectionTable payments={data.payments} />
      ) : (
        <EmptyState
          icon="bi-cash-stack"
          title="No payments today"
          message="Collections will appear here as you process payments."
        />
      )}
    </div>
  );
};

export default TodayCollection;
