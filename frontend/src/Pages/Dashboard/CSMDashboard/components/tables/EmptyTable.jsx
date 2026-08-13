import React from "react";

const EmptyTable = ({ message = "No data found." }) => (
  <div className="text-center py-8 text-gray-500">
    <p>{message}</p>
  </div>
);

export default EmptyTable;