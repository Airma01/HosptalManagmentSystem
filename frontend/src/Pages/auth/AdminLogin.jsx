import React, { useState } from "react";
import axios from "axios";

const AdminLogin = () => {
  const [user, setUser] = useState({
    username: "",
    Password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const Login = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // With HttpOnly cookies, the token is automatically sent with requests
      // and stored in the browser's cookie jar
      const response = await axios.post(
        "http://localhost:5241/Hospital/Admin_auth/login",
        user,
        {
          withCredentials: true, // IMPORTANT: This sends/receives cookies
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      console.log("Login successful:", user.username);
      
      // Since the token is in an HttpOnly cookie, we don't need to store it in localStorage
      // The browser will automatically include it in future requests
      
      // You can check if login was successful by looking at the response
      if (response.status === 200) {
        // Redirect to dashboard or home page
        window.location.href = "/dashboard"; // or use react-router navigate
      }

    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                      error.response?.data || 
                      error.message || 
                      "Login failed";
      
      setError(errorMsg);
      console.error("Login error:", errorMsg);
      
      // Clear password field on error (optional)
      setUser(prev => ({ ...prev, Password: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: "400px", 
      margin: "50px auto", 
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Admin Login</h2>
      
      {error && (
        <div style={{
          backgroundColor: "#f8d7da",
          color: "#721c24",
          padding: "10px",
          borderRadius: "4px",
          marginBottom: "15px",
          border: "1px solid #f5c6cb"
        }}>
          {error}
        </div>
      )}

      <form onSubmit={Login}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Username
          </label>
          <input
            type="text"
            placeholder="Enter username"
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            required
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter password"
            value={user.Password}
            onChange={(e) => setUser({ ...user, Password: e.target.value })}
            required
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: isLoading ? "#6c757d" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            transition: "background-color 0.2s"
          }}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;