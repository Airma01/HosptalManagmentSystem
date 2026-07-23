// src/Pages/Admin/DashboardOverview.jsx
import React from 'react';

const DashboardOverview = () => {
    const stats = [
        { title: "Total Users", value: "1,234", icon: "bi-people-fill", color: "blue" },
        { title: "Departments", value: "12", icon: "bi-building-fill", color: "green" },
        { title: "Doctors", value: "45", icon: "bi-person-badge-fill", color: "purple" },
        { title: "Medicines", value: "567", icon: "bi-capsule-fill", color: "orange" },
        { title: "Pharmacies", value: "8", icon: "bi-shop-fill", color: "red" },
        { title: "Appointments", value: "89", icon: "bi-calendar-event-fill", color: "indigo" },
    ];

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className={`bg-white rounded-lg shadow-lg p-6 border-l-4 border-${stat.color}-500`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">{stat.title}</p>
                                <h3 className="text-2xl font-bold">{stat.value}</h3>
                            </div>
                            <i className={`bi ${stat.icon} text-3xl text-${stat.color}-500`}></i>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <p className="text-gray-600">Welcome to the Admin Dashboard. Use the sidebar to navigate through different sections.</p>
            </div>
        </div>
    );
};

export default DashboardOverview; // Make sure this line exists