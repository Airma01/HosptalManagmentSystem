import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../../../Config/API";
import { canAccessConsultation } from "../../../../utils/canAccessConsultation";
import Allergies from "./Allergies";
import MedicalHistory from "./MedicalHistory";
import FamilyHistory from "./FamilyHistory";
import SocialHistory from "./SocialHistory";
import Consultation from "./Consultation";
import PhysicalExam from "./PhysicalExam";
import Diagnosis from "./Diagnosis";
import ProblemList from "./ProblemList";
import Prescription from "./Prescription";
import Laboratory from "./Laboratory";
import Radiology from "./Radiology";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: "bi-person-vcard" },
  { id: "allergies", label: "Allergies", icon: "bi-exclamation-triangle" },
  { id: "medicalHistory", label: "Medical History", icon: "bi-journal-medical" },
  { id: "familyHistory", label: "Family History", icon: "bi-people" },
  { id: "socialHistory", label: "Social History", icon: "bi-house-heart" },
  { id: "consultation", label: "Consultation", icon: "bi-clipboard2-pulse" },
  { id: "physicalExam", label: "Physical Exam", icon: "bi-body-text" },
  { id: "diagnosis", label: "Diagnosis", icon: "bi-file-medical" },
  { id: "problemList", label: "Problem List", icon: "bi-list-check" },
  { id: "prescription", label: "Prescription", icon: "bi-prescription2" },
  { id: "laboratory", label: "Laboratory", icon: "bi-droplet" },
  { id: "radiology", label: "Radiology", icon: "bi-radioactive" },
];

export default function ConsultationPatient() {
  const { patientId, visitId } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState("overview");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [accessAllowed, setAccessAllowed] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await canAccessConsultation();
      if (cancelled) return;
      if (!ok) {
        navigate("/doctor", { replace: true });
        setAccessAllowed(false);
      } else {
        setAccessAllowed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`/api/doctor/patient/${patientId}/visit/${visitId}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load patient visit.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [patientId, visitId]);

  useEffect(() => {
    if (accessAllowed === true) {
      load();
    }
  }, [accessAllowed, load]);

  const flash = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const normalizeStatus = (s) => {
    if (!s) return "";
    const t = String(s).trim();
    if (/^triaged$/i.test(t) || /^in\s*progress$/i.test(t)) return "Progress";
    if (/^completed$/i.test(t)) return "Complete";
    return t;
  };

  const startConsultation = async () => {
    setActionLoading(true);
    try {
      const res = await API.put(
        `/api/doctor/patient/${patientId}/visit/${visitId}/start-consultation`
      );
      flash(res.data?.message || "Consultation started.");
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start consultation.");
    } finally {
      setActionLoading(false);
    }
  };

  const finishConsultation = async () => {
    if (!window.confirm("Finish this consultation and mark the visit as Complete?")) return;
    setActionLoading(true);
    try {
      const res = await API.put(
        `/api/doctor/patient/${patientId}/visit/${visitId}/complete`
      );
      flash(res.data?.message || "Visit completed.");
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to complete visit.");
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadgeClass = (status) => {
    const n = normalizeStatus(status);
    if (n === "Scheduled") return "bg-blue-100 text-blue-800";
    if (n === "Progress") return "bg-amber-100 text-amber-800";
    if (n === "OnConsultation") return "bg-indigo-100 text-indigo-800";
    if (n === "Complete") return "bg-emerald-100 text-emerald-800";
    return "bg-slate-100 text-slate-700";
  };

  if (accessAllowed !== true || loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-500 gap-2">
        <i className="bi bi-arrow-repeat animate-spin" />
        {accessAllowed !== true ? "Checking access…" : "Loading patient data..."}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <p className="text-red-600 mb-4">{error || "Patient data not found."}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm rounded-lg bg-slate-100 hover:bg-slate-200"
        >
          Go back
        </button>
      </div>
    );
  }

  const patient = data.patient || {};
  const visit = data.currentVisit || {};
  const triage = data.currentTriage;

  // ALL consultations for this patient (every VisitID) from backend
  const consultations = data.previousConsultations || [];

  // Current visit only — for lab / radiology / prescription
  const visitConsultations = consultations.filter(
    (c) => String(c.visitID) === String(visitId)
  );
  const primaryConsultationId = visitConsultations[0]?.consultationID || null;

  // Full history for Consultation tab
  const allConsultations = consultations;

  const laboratoryTests = data.laboratoryTests || [];
  const radiologyRequests = data.radiologyRequests || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
        >
          <i className="bi bi-arrow-left" /> Back to queue
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          {message && (
            <span className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              {message}
            </span>
          )}
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(
              visit.status
            )}`}
          >
            Visit Status: {normalizeStatus(visit.status) || visit.status || "—"}
          </span>
          {["Scheduled", "Progress"].includes(normalizeStatus(visit.status)) && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={startConsultation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              <i className="bi bi-play-fill" />
              Start Consultation
            </button>
          )}
          {normalizeStatus(visit.status) === "OnConsultation" && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={finishConsultation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              <i className="bi bi-check2-circle" />
              Finish Consultation
            </button>
          )}
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-1 bg-white border rounded-xl p-2 shadow-sm">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition ${
              section === s.id
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <i className={`bi ${s.icon}`} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[320px]">
        {section === "overview" && (
          <div className="bg-white border rounded-xl shadow-sm p-5 space-y-3 text-sm">
            <div className="bg-white border rounded-xl shadow-sm p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    {patient.firstName} {patient.lastName}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    MRN: <strong>{patient.mrn || "—"}</strong> · {patient.gender || "—"} · DOB:{" "}
                    {patient.dateOfBirth
                      ? new Date(patient.dateOfBirth).toLocaleDateString()
                      : "—"}
                  </p>
                  <p className="text-sm text-slate-500">
                    Phone: {patient.phone || "—"} · {patient.address || "—"}
                  </p>
                </div>
                <div className="text-sm text-right">
                  <p>
                    Visit #{visit.visitID} · {visit.visitType || "—"} ·{" "}
                    <span
                      className={`font-medium px-2 py-0.5 rounded-full text-xs ${statusBadgeClass(
                        visit.status
                      )}`}
                    >
                      {normalizeStatus(visit.status) || visit.status || "—"}
                    </span>
                  </p>
                  <p className="text-slate-500">
                    {visit.visitDate ? new Date(visit.visitDate).toLocaleString() : "—"}
                  </p>
                </div>
              </div>
              {triage && (
                <div className="mt-4 pt-4 border-t grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-sm">
                  <div>
                    <span className="text-slate-400 block text-xs">Temp</span>
                    {triage.temprature ?? "—"} °C
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">BP</span>
                    {triage.bloodPressure ?? "—"}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">HR</span>
                    {triage.heartRate ?? "—"}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">RR</span>
                    {triage.respiratotyRate ?? "—"}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Weight</span>
                    {triage.weight ?? "—"} kg
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Notes</span>
                    {triage.notes || "—"}
                  </div>
                </div>
              )}
            </div>
            <p>
              Consultations (this visit): <strong>{visitConsultations.length}</strong>
              {" · "}
              All visits: <strong>{consultations.length}</strong>
            </p>
            <p>
              Allergies: <strong>{(data.allergies || []).length}</strong> · Problems:{" "}
              <strong>{(data.problemList || []).length}</strong>
            </p>
            <p>
              Lab tests: <strong>{laboratoryTests.length}</strong> · Radiology:{" "}
              <strong>{radiologyRequests.length}</strong>
            </p>
            {!primaryConsultationId && (
              <p className="text-amber-600">
                Start a consultation before ordering prescription, lab, or radiology.
              </p>
            )}
          </div>
        )}

        {section === "allergies" && (
          <Allergies
            patientId={patientId}
            allergies={data.allergies || []}
            onReload={load}
          />
        )}

        {section === "medicalHistory" && (
          <MedicalHistory
            patientId={patientId}
            medicalHistory={data.medicalHistory || []}
            onReload={load}
          />
        )}

        {section === "familyHistory" && (
          <FamilyHistory
            patientId={patientId}
            familyMedicalHistory={data.familyMedicalHistory || []}
            onReload={load}
          />
        )}

        {section === "socialHistory" && (
          <SocialHistory
            patientId={patientId}
            socialHistory={data.socialHistory || []}
            onReload={load}
          />
        )}

        {section === "consultation" && (
          <Consultation
            patientId={patientId}
            visitId={visitId}
            consultations={allConsultations}
            currentVisitConsultations={visitConsultations}
            onReload={load}
          />
        )}

        {section === "physicalExam" && (
          <PhysicalExam
            primaryConsultationId={primaryConsultationId}
            visitConsultations={visitConsultations}
            onReload={load}
          />
        )}

        {section === "diagnosis" && (
          <Diagnosis
            primaryConsultationId={primaryConsultationId}
            visitConsultations={visitConsultations}
            onReload={load}
          />
        )}

        {section === "problemList" && (
          <ProblemList
            patientId={patientId}
            problemList={data.problemList || []}
            onReload={load}
          />
        )}

        {section === "prescription" && (
          <Prescription
            primaryConsultationId={primaryConsultationId}
            latestPrescription={data.latestPrescription}
            onReload={load}
          />
        )}

        {section === "laboratory" && (
          <Laboratory
            primaryConsultationId={primaryConsultationId}
            laboratoryTests={laboratoryTests}
            onReload={load}
          />
        )}

        {section === "radiology" && (
          <Radiology
            primaryConsultationId={primaryConsultationId}
            radiologyRequests={radiologyRequests}
            onReload={load}
          />
        )}
      </div>
    </div>
  );
}