import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../Config/API";

const PharmacistProtectRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await API.get("/Hospital/Pharmacist/PharmacistAuth/auth_me");
        if (res.data && res.data.role === "Pharmacist") {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Auth verification failed:", err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    verifyAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/Bishoftu/login" replace />;
};

export default PharmacistProtectRoute;