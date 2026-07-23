import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import API from "../Config/API";

const AdminAuthRouter = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await API.get("/hospital/Admin_auth/me");
        setAuthenticated(true);
      } catch {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <h1>Loading...</h1>;

  return authenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/admin/login" replace />
  );
};

export default AdminAuthRouter;