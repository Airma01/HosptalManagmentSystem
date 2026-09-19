import { Outlet } from "react-router-dom";
import DoctorSidebar from "./DoctorSidebar";
import DoctorHeader from "./DoctorHeader";

/**
 * Doctor layout: horizontal top navbar + secondary header (page title / user) + content.
 * Full-width content (no left sidebar).
 */
export default function DoctorLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DoctorSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DoctorHeader />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
