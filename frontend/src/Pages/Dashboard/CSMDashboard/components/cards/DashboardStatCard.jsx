import React from "react";

const DashboardStatCard = ({ title, value, icon, color = "blue", link = null }) => {
  const colorClasses = {
    blue: "bg-blue-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    cyan: "bg-cyan-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
  };

  const card = (
    <div className={`${colorClasses[color]} rounded-lg shadow-md p-4 text-white transition-transform hover:scale-105`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs uppercase tracking-wider opacity-80">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {icon && <i className={`bi ${icon} text-3xl opacity-80`}></i>}
      </div>
    </div>
  );

  if (link) {
    return <a href={link} className="block no-underline">{card}</a>;
  }
  return card;
};

export default DashboardStatCard;