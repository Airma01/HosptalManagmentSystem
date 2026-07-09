import React, { useState } from "react";
import slideImage from "../assets/a7395e40-2054-4147-8314-728e940a8063.jpg";

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
                {/* Sidebar */}
                <div 
                    className={`w-64 h-screen relative transition-all duration-300 ${!isOpen ? 'w-20' : ''}`}
                    style={{
                        backgroundImage: `url(${slideImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    {/* Gradient Overlay - with lower opacity to show image */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/30 to-pink-500/20 backdrop-blur-sm"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col">
                        <h1 className={`text-center text-white my-2 font-bold ${isOpen ? 'text-lg' : 'text-sm'}`}>
                            {isOpen ? "Welcome To Admin" : "👑"}
                        </h1>
                        
                        <div className={`flex ${isOpen ? 'gap-10' : 'gap-2'} my-1 mx-1`}>
                            <div className={`p-1 bg-blue-500/80 text-center rounded hover:bg-blue-500/100 cursor-pointer backdrop-blur-sm ${isOpen ? 'flex-1' : 'w-full'}`}>
                                <i className={`bi bi-speedometer2 ${isOpen ? 'mr-2' : ''}`}></i>
                                {isOpen && "Dashboard"}
                            </div>
                            <div className={`p-1 bg-red-500/80 text-center rounded hover:bg-red-500/100 cursor-pointer backdrop-blur-sm ${isOpen ? 'flex-1' : 'w-full'}`}>
                                <i className={`bi bi-box-arrow-right ${isOpen ? 'mr-2' : ''}`}></i>
                                {isOpen && "Logout"}
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => setIsOpen(!isOpen)}
                            className="absolute bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-lg hover:bg-white transition-all z-20"
                            style={{
                                right: '-12px',
                                top: '50%',
                                transform: 'translateY(-50%)'
                            }}
                        >
                            <i className={`bi ${isOpen ? 'bi-chevron-left' : 'bi-chevron-right'}`}></i>
                        </button>
                        
                        <div className="flex-1">
                            <ul className="mt-2 px-2">
                                {menuItems.map((item, idx) => (
                                    <li key={idx} className="mb-1">
                                        <button 
                                            type="button"
                                            onClick={() => handlePageChange(item.menu)}
                                            className={`w-full p-2 rounded transition-all flex items-center gap-2 backdrop-blur-sm ${
                                                currentPage === item.menu 
                                                    ? 'bg-yellow-400/90 text-black font-bold' 
                                                    : 'bg-white/20 text-white hover:bg-white/30'
                                            }`}
                                        >
                                            <i className={`bi ${item.icon} ${isOpen ? 'text-lg' : 'text-2xl mx-auto'}`}></i>
                                            {isOpen && <span>{item.menu}</span>}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                
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