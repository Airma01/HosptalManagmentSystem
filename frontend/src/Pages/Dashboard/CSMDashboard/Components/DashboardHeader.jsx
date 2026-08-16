import React from "react";
import { BsBoxSeam, BsPerson } from "react-icons/bs";

const DashboardHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Central Store Manager Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of pharmacy inventory and requests
        </p>
      </div>
      <div className="flex items-center gap-3 mt-2 sm:mt-0">
        <span className="text-sm text-gray-600 flex items-center gap-1">
          <BsBoxSeam className="text-blue-600" />
          <span>CSM</span>
        </span>
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <BsPerson />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
