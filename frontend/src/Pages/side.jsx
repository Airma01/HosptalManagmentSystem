import React, { useState } from "react";
import slideImage from "../assets/a7395e40-2054-4147-8314-728e940a8063.jpg";
import AdminNav from "./Admin/AdminNav";

const SideN = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [currentPage, setCurrentPage] = useState("Overview");
    
    const menuItems = [
        { menu: "Overview", icon: "bi-house-door" },
        { menu: "Doctor", icon: "bi-person-plus" },
        { menu: "Nurse", icon: "bi-heart-pulse" },
        { menu: "Pharmacist", icon: "bi-capsule" }
    ];
    
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    
    const renderContent = () => {
        // ... your render content function
    };
    
    return(
        <div>
            <div className="flex">
               <AdminNav/>
                
                {/* Main Content */}
                <div className="flex-1 mx-3 bg-gray-100 min-h-screen p-4">
                    <div className="bg-white rounded-lg shadow">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SideN;