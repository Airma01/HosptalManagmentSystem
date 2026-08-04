import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import API from "../Config/API";

const NurseProtectRoute = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await API.get("/Hospital/nurse/NurseAuth/auth_me");
        // response.data contains { fullName, UserID, NurseID, role }
        setUser(response.data);
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

  return authenticated ? <Outlet /> : <Navigate to="/Bishoftu/login" replace />;
};

export default NurseProtectRoute;