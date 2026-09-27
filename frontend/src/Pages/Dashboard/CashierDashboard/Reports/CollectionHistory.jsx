import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import TodayCollection from "./TodayCollection";

/** Placeholder – same as today for now; extend with date filters later */
const CollectionHistory = () => {
  const { setPageTitle } = useOutletContext() || {};
  useEffect(() => {
    setPageTitle?.("Collection History");
  }, []);
  return <TodayCollection />;
};

export default CollectionHistory;
