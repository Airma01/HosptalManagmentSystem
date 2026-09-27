import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import API from "../Config/API";

const RadiologyCashierProtectRoute = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const res = await API.get(
          "/Hospital/RadiologyCashier/RadiologyCashierAuth/auth_me"
        );
        const data = res.data;
        if (!cancelled) {
          const ok = data?.role === "RadiologyCashier";
          setAuthenticated(!!ok);
          if (ok) {
            localStorage.setItem("user", JSON.stringify(data));
            localStorage.setItem("role", "RadiologyCashier");
          }
        }
      } catch {
        if (!cancelled) setAuthenticated(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return authenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/Bishoftu/login" replace />
  );
};

export default RadiologyCashierProtectRoute;