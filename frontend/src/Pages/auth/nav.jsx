import React, { useState } from "react";
import navBG from "../../assets/gray-blue-bg.jpg";
import bg from "../../assets/a7395e40-2054-4147-8314-728e940a8063.jpg"

export const Nav = () => {
    const [isOpen,setIsOpen] = useState(true);
    const [currentPage,setCurrentPage] = useState("Overview");
    const navItems = [
        {icon:"bi bi-view-list",navName:"Overview"},
        {icon:"bi bi-heart-pulse-fill",navName:"Doctor"},
        {icon:"bi bi-clipboard2-pulse-fill",navName:"Nurse"},
        {icon:"bi bi-person-raised-hand",navName:"Patient"},
        {icon:"bi bi-capsule-pill",navName:"Pharmacy"},
        

    ]
   const [doctorNav,setDoctorNav] = useState("Read");
   const doctorNavItem = [
    {navName:"Read",icon:""},
    {navName:"AddDoctor",icon:""},
    {navName:"Update",icon:""},
    {navName:"About",icon:""}
   ]
    const renderPage = () => {
        
        switch(currentPage){
            case "Overview":
                return(<div>OverView Page Welcome
                    <div className="grid grid-cols-4 gap-6">
                        <div>
                        <form action="">
                            <div>
                                <label htmlFor="" className="block mb-2 text-gray-500">First Name</label>
                                <input type="text" className="w-full px-4 py-2 border rounded-lg focus:outline-none transition duration-200 border-gray-300 focus:ring-blue-400 pl-10" name="" id="" placeholder="Enter FirstName "/>
                                </div>
                        </form>
                        </div>
                    </div>
                </div>);
            case "Doctor":
                return(<div>This Is Doctor Page
                     <div className="items-center justify-center bg-gradient-to-r from-blue-100 via-green-200 to-purple-300">
                        <ul className="flex gap-10 my-5 border-b items-center justify-center ">
                            {
                                doctorNavItem.map((item,idx) => {
                                    return(
                                    <li key={idx}><button type="button" className="w-30 hover:text-red-500">{item.navName}</button></li>
                                   )
                                })
                            }
                            
                            
                        </ul>
                     </div>
                </div>)
            case "Nurse":
                return(<div> Wellcome To Nurse Page</div>)
        }
    }
     const setRendringPage = (page) => {
        setCurrentPage(page);
    }
    const handleH = () =>{
        setIsOpen(!isOpen)
       
    }
    return(
        <div>
            <div className="flex gap-10">
                <div className={`relative sticky top-0 h-screen bg-gray-200/30 ${isOpen==true?'w-60':'w-15'} bg-center bg-cover`} style={{backgroundImage:`url(${navBG})`}}>
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-blue-100/10 to-green-100/20 backdrop-blur-sm"></div>
                <div className="relative z-10">
                {
                    isOpen ==true?<div className="flex items-center justify-between h-13 bg-blue-500/30">
                    <h1 className="text-xl font-bold">Admin</h1>
                    <button type="button" className="text-2xl font-bold hover:text-gray-800" onClick={handleH} ><i className="bi bi-list"></i></button>
                </div>:<div className="flex items-center justify-center h-13 bg-blue/30">
                    <button type="button" className="text-2xl font-bold hover:text-gray-800" onClick={handleH} ><i className="bi bi-list"></i></button>
                </div>
                }
                <div className="flex-1 mt-18 ml-2">
                    <u className="pt-2 space-y-1">
                        {
                            navItems.map((item,idx)=>{
                                if(isOpen){
                                    return(
                                        <li className="flex gap-4 text-lg hover:bg-gray-500/30  rounded my-2 bg-blue-200/50 h-8" key={idx}>
                                        <div className="bg-gray-800/100 w-10 flex items-center justify-center"><i className={`${item.icon} text-blue-500 font-bold`}></i></div>
                                        <button type="button" className="flex items-left justify-left w-58" onClick={()=>setRendringPage(item.navName)}>{item.navName}</button>
                                        </li>
                                    )
                                }
                               else{
                                return(
                                    <li className="flex gap-2 text-lg hover:bg-gray-500/30 w-12 rounded-full my-2 bg-gray-800 items-center justify-center" key={idx}>          
                                        <button type="button" onClick={()=>setRendringPage(item.navName)} className="text-2xl"><i className={`${item.icon} text-blue-500 font-bold`}></i></button>
                                        </li>
                                )
                               }
                            })
                        }
                       
                        
                    </u>
                </div>
                </div>
                </div>
                <div className="flex-1">
                    {renderPage()}
                </div>
            </div>
        </div>
    )
}