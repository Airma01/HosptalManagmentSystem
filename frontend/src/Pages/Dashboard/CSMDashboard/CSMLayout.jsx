import React from "react";
import { Outlet } from "react-router-dom";
import CSMSidebar from "./Components/CSMSidebar";

const CSMLayout = () => {
  return (
    <div className="flex">
      <CSMSidebar />
      <main className="flex-1 bg-gray-100 min-h-screen">
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CSMLayout;