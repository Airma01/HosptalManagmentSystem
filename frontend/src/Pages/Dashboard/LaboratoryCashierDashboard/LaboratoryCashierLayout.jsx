import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import LabCashierSidebar from "./Components/LabCashierSidebar";
import LabCashierHeader from "./Components/LabCashierHeader";

const LaboratoryCashierLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [pageTitle, setPageTitle] = useState("Dashboard");

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    setUserName(u.fullName || u.FullName || "Lab Cashier");
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <LabCashierSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} userName={userName} />
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <LabCashierHeader title={pageTitle} onMenuClick={() => setSidebarOpen(true)} userName={userName} />
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet context={{ setPageTitle }} />
        </div>
      </main>
    </div>
  );
};

export default LaboratoryCashierLayout;
