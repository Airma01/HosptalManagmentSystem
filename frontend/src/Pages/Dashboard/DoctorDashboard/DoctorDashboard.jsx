import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthenticatedUser } from "../../../utils/getAuthenticatedUser";

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    getAuthenticatedUser().then(setDoctor);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">
          Welcome, {doctor?.fullName || "Doctor"}
        </h2>
        <p className="text-slate-500 mt-1">
          {doctor?.role || "Doctor"}
          {doctor?.departmentName ? ` · ${doctor.departmentName}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
            <i className="bi bi-clipboard2-pulse text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Consultation</h3>
          <p className="text-slate-500 text-sm mt-2 flex-1">
            View your department triage queue and open patient consultations
            (history, examination, diagnosis, and related clinical records).
          </p>
          <Link
            to="/doctor/consultation/triage"
            className="mt-5 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
          >
            Open Consultation
            <i className="bi bi-arrow-right" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
            <i className="bi bi-heart-pulse text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Adult Medical Care</h3>
          <p className="text-slate-500 text-sm mt-2 flex-1">
            Manage longitudinal adult care records: asthma, diabetes, HIV,
            hepatitis, hypertension, mental health, and tuberculosis.
          </p>
          <Link
            to="/doctor/adult/triage"
            className="mt-5 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
          >
            Open Adult Care
            <i className="bi bi-arrow-right" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
            <i className="bi bi-gender-female text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Maternal &amp; Child Health</h3>
          <p className="text-slate-500 text-sm mt-2 flex-1">
            Pregnancy, ANC, risk, labor, delivery, PNC, family planning, and child health modules.
          </p>
          <Link
            to="/doctor/maternal/triage"
            className="mt-5 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition"
          >
            Open Maternal &amp; Child
            <i className="bi bi-arrow-right" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
            <i className="bi bi-arrow-left-right text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Referrals</h3>
          <p className="text-slate-500 text-sm mt-2 flex-1">
            Review incoming referrals to your department, open patient details,
            select an existing visit, and continue in clinical modules.
          </p>
          <Link
            to="/doctor/referrals"
            className="mt-5 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition"
          >
            View Referrals
            <i className="bi bi-arrow-right" />
          </Link>
        </div>

      </div>
    </div>
  );
}
