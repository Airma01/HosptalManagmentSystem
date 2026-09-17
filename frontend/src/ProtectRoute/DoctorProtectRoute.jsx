import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import API from "../Config/API";

const DoctorProtectRoute = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const res = await API.get("/Hospital/doctor/DoctorAuth/auth_me");
        const data = res.data;
        // Backend returns role "Doctor" plus doctorID / departmentID claims
        if (!cancelled) {
          const ok =
            data?.role === "Doctor" &&
            (data?.doctorID != null || data?.DoctorID != null);
          setAuthenticated(!!ok);
          if (ok) {
            localStorage.setItem("user", JSON.stringify(data));
            localStorage.setItem("role", "Doctor");
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
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return authenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/Bishoftu/login" replace />
  );
};

export default DoctorProtectRoute;
