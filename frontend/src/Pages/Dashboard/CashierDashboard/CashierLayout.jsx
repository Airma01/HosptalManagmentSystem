import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import CashierSidebar from "./Components/CashierSidebar";
import CashierHeader from "./Components/CashierHeader";

const CashierLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [pageTitle, setPageTitle] = useState("Dashboard");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUserName(userData.fullName || userData.FullName || "Cashier");
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <CashierSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userName={userName}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <CashierHeader
          title={pageTitle}
          onMenuClick={() => setSidebarOpen(true)}
          userName={userName}
        />
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet context={{ setPageTitle }} />
        </div>
      </main>
    </div>
  );
};

export default CashierLayout;
