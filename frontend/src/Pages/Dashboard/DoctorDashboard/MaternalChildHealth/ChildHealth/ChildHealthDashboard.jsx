import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NeonatalCare from "./NeonatalCare";
import GrowthMonitoring from "./GrowthMonitoring";
import DevelopmentAssessment from "./DevelopmentAssessment";
import Immunization from "./Immunization";
import NutritionAssessment from "./NutritionAssessment";
import IMNCIEncounter from "./IMNCIEncounter";

const TABS = [
  { key: "neonatal", label: "Neonatal", icon: "bi-moon-stars" },
  { key: "growth", label: "Growth", icon: "bi-graph-up" },
  { key: "development", label: "Development", icon: "bi-puzzle" },
  { key: "immunization", label: "Immunization", icon: "bi-syringe" },
  { key: "nutrition", label: "Nutrition", icon: "bi-apple" },
  { key: "imnci", label: "IMNCI", icon: "bi-clipboard2-pulse" },
];

export default function ChildHealthDashboard() {
  const { patientId, visitId } = useParams();
  const navigate = useNavigate();
  const base = `/doctor/maternal/patient/${patientId}/${visitId}`;
  const [tab, setTab] = useState("neonatal");
  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <button type="button" onClick={() => navigate(base)} className="text-sm text-slate-500 hover:text-sky-600"><i className="bi bi-arrow-left" /> Dashboard</button>
      <div className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2"><i className="bi bi-emoji-smile text-sky-600" /> Child Health</h2>
        <p className="text-xs text-slate-500 mt-1">Patient ID {patientId} · Visit {visitId}. Use the <strong>child</strong> patient ID when opening newborn records.</p>
        <div className="flex flex-wrap gap-1 mt-3">
          {TABS.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${tab === t.key ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              <i className={`bi ${t.icon} me-1`} />{t.label}
            </button>
          ))}
        </div>
      </div>
      {tab === "neonatal" && <NeonatalCare />}
      {tab === "growth" && <GrowthMonitoring />}
      {tab === "development" && <DevelopmentAssessment />}
      {tab === "immunization" && <Immunization />}
      {tab === "nutrition" && <NutritionAssessment />}
      {tab === "imnci" && <IMNCIEncounter />}
    </div>
  );
}
