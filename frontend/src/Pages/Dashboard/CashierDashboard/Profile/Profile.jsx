import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import cashierApi from "../Services/cashierApi";
import LoadingSpinner from "../Shared/LoadingSpinner";

const Profile = () => {
  const { setPageTitle } = useOutletContext() || {};
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageTitle?.("Profile");
    cashierApi
      .authMe()
      .then((res) => setUser(res.data))
      .catch(() => {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(stored);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-md bg-white rounded-xl border shadow-sm p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl">
          <i className="bi bi-person-fill"></i>
        </div>
        <div>
          <h2 className="text-lg font-bold">{user?.fullName || user?.FullName}</h2>
          <p className="text-sm text-gray-500">{user?.role || "Cashier"}</p>
        </div>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-500">Username</span>
          <span className="font-medium">{user?.username}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-500">Cashier ID</span>
          <span className="font-medium">{user?.cashierID || user?.CashierID}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-500">User ID</span>
          <span className="font-medium">{user?.userID || user?.UserID}</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
