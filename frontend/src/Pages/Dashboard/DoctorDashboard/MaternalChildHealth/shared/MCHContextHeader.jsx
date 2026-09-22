
import { useCallback, useEffect, useState } from "react";
import API from "../../../../../Config/API";

/**
 * Consistent patient + visit + pregnancy context header for all MCH module pages.
 * Uses route patientId/visitId and optional pregnancyId (query or prop).
 * Includes Complete Visit button → PatientVisit.Status = Complete.
 */
export default function MCHContextHeader({
  patientId,
  visitId,
  pregnancyId,
  moduleTitle,
  moduleIcon = "bi-heart-pulse",
}) {
  const [patient, setPatient] = useState(null);
  const [pregnancy, setPregnancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const apiBase = `/api/doctor/patient/${patientId}/maternal-child`;

  const load = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError("");
    try {
      const tasks = [
        API.get("/api/doctor/triage").catch(() => ({ data: [] })),
        // Authoritative visit status (works even if not on active queue)
        visitId
          ? API.get(`/api/doctor/patient/${patientId}/visit/${visitId}`).catch(() => null)
          : Promise.resolve(null),
      ];
      if (pregnancyId) {
        tasks.push(API.get(`${apiBase}/pregnancies/${pregnancyId}`).catch(() => null));
      } else {
        tasks.push(API.get(`${apiBase}/pregnancies`).catch(() => ({ data: [] })));
      }
      const [triageRes, visitRes, pregRes] = await Promise.all(tasks);

      const queue = Array.isArray(triageRes?.data) ? triageRes.data : [];
      const match = queue.find(
        (t) => String(t.patientID) === String(patientId) && String(t.visitID) === String(visitId)
      );

      const visitData = visitRes?.data;
      const currentVisit = visitData?.currentVisit || visitData?.CurrentVisit;
      const patientSummary = visitData?.patient || visitData?.Patient;

      const visitStatus =
        currentVisit?.status ||
        currentVisit?.Status ||
        match?.visitStatus ||
        null;

      if (match || patientSummary || currentVisit) {
        setPatient({
          patientID: match?.patientID || patientSummary?.patientID || patientId,
          patientName:
            match?.patientName ||
            (patientSummary
              ? `${patientSummary.firstName || ""} ${patientSummary.lastName || ""}`.trim()
              : null) ||
            `Patient #${patientId}`,
          mrn: match?.mrn || match?.MRN || patientSummary?.mrn || null,
          gender: match?.gender || match?.sex || patientSummary?.gender || null,
          age: match?.age ?? null,
          visitID: match?.visitID || currentVisit?.visitID || visitId,
          visitDate: match?.visitDate || currentVisit?.visitDate,
          visitType: match?.visitType || currentVisit?.visitType,
          visitStatus,
        });
      } else {
        setPatient({
          patientID: patientId,
          patientName: `Patient #${patientId}`,
          visitID: visitId,
          visitStatus: null,
        });
      }

      if (pregnancyId && pregRes?.data) {
        const p = pregRes.data;
        setPregnancy({
          pregnancyID: p.pregnancyID,
          lastMenstrualPeriod: p.lastMenstrualPeriod,
          expectedDeliveryDate: p.expectedDeliveryDate,
          gravida: p.gravida,
          para: p.para,
          abortions: p.abortions,
          livingChildren: p.livingChildren,
          status: p.status,
          registrationDate: p.registrationDate,
          notes: p.notes,
          patient: p.patient,
        });
        if (p.patient) {
          setPatient((prev) => ({
            ...prev,
            patientName:
              prev?.patientName && !String(prev.patientName).startsWith("Patient #")
                ? prev.patientName
                : `${p.patient.firstName || ""} ${p.patient.lastName || ""}`.trim() ||
                  prev?.patientName,
            mrn: prev?.mrn || p.patient.mrn || null,
            gender: prev?.gender || p.patient.gender || null,
          }));
        }
      } else if (Array.isArray(pregRes?.data) && pregRes.data.length) {
        const active =
          pregRes.data.find((x) => x.status === 0 || x.status === "Active") ||
          pregRes.data[0];
        setPregnancy({
          pregnancyID: active.pregnancyID,
          lastMenstrualPeriod: active.lastMenstrualPeriod,
          expectedDeliveryDate: active.expectedDeliveryDate,
          gravida: active.gravida,
          para: active.para,
          status: active.status,
        });
      } else {
        setPregnancy(null);
      }
    } catch {
      setPatient((prev) => prev || { patientID: patientId, visitID: visitId });
    } finally {
      setLoading(false);
    }
  }, [patientId, visitId, pregnancyId, apiBase]);

  useEffect(() => {
    load();
  }, [load]);

  const statusLabel = (s) => {
    if (s === 0 || s === "Active") return "Active";
    if (s === 1 || s === "Delivered") return "Delivered";
    if (typeof s === "string") return s;
    return s != null ? String(s) : "—";
  };

  const fmtDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const normalizeStatus = (status) => {
    if (!status) return "";
    const s = String(status).trim();
    if (/^triaged$/i.test(s) || /^in\s*progress$/i.test(s)) return "Progress";
    if (/^completed$/i.test(s)) return "Complete";
    return s;
  };

  const visitStatusBadge = (status) => {
    if (!status) return "bg-slate-100 text-slate-600";
    const s = normalizeStatus(status);
    if (/^scheduled$/i.test(s)) return "bg-blue-100 text-blue-800";
    if (/^progress$/i.test(s)) return "bg-amber-100 text-amber-800";
    if (/^onconsultation$/i.test(s)) return "bg-indigo-100 text-indigo-800";
    if (/^anc$/i.test(s)) return "bg-pink-100 text-pink-800";
    if (/^pnc$/i.test(s)) return "bg-purple-100 text-purple-800";
    if (/^childhealth$/i.test(s)) return "bg-cyan-100 text-cyan-800";
    if (/^complete/i.test(s)) return "bg-emerald-100 text-emerald-800";
    return "bg-slate-100 text-slate-700";
  };

  const canComplete = () => {
    const s = normalizeStatus(patient?.visitStatus);
    return ["OnConsultation", "ANC", "PNC", "ChildHealth", "Progress"].includes(s);
  };

  const completeVisit = async () => {
    if (!patientId || !visitId) return;
    if (!window.confirm("Mark this visit as Complete? The patient will leave the active queue.")) {
      return;
    }
    setActionLoading(true);
    setError("");
    try {
      const res = await API.put(
        `/api/doctor/patient/${patientId}/maternal-child/visit/${visitId}/complete`
      );
      const newStatus = res.data?.visitStatus || "Complete";
      setPatient((prev) => (prev ? { ...prev, visitStatus: newStatus } : prev));
      setMessage(res.data?.message || "Visit marked as Complete.");
      setTimeout(() => setMessage(""), 4000);
      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to complete visit. Status may need to be OnConsultation, ANC, or PNC first."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !patient) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 animate-pulse">
        <div className="h-4 bg-slate-100 rounded w-1/3 mb-2" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-4">
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-2.5 text-sm">
          <i className="bi bi-check-circle me-2" />
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm">
          <i className="bi bi-exclamation-triangle me-2" />
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100 px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <i className="bi bi-person-badge text-rose-600" />
            <span className="text-sm font-semibold text-slate-800">Patient Information</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${visitStatusBadge(
                patient?.visitStatus
              )}`}
            >
              Visit Status: {normalizeStatus(patient?.visitStatus) || patient?.visitStatus || "—"}
            </span>
            {canComplete() && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={completeVisit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                <i className="bi bi-check2-circle" />
                {actionLoading ? "Saving..." : "Complete Visit"}
              </button>
            )}
            {normalizeStatus(patient?.visitStatus) === "Complete" && (
              <span className="text-xs text-emerald-700 font-medium">Visit completed</span>
            )}
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Patient Name</div>
              <div className="font-medium text-slate-900 truncate">
                {patient?.patientName || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">MRN</div>
              <div className="font-medium text-slate-900">{patient?.mrn || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Gender</div>
              <div className="font-medium text-slate-900">{patient?.gender || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Age</div>
              <div className="font-medium text-slate-900">
                {patient?.age != null ? `${patient.age} yrs` : "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Visit</div>
              <div className="font-medium text-slate-900">#{visitId || patient?.visitID || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Pregnancy</div>
              <div className="font-medium text-slate-900">
                {pregnancyId || pregnancy?.pregnancyID
                  ? `#${pregnancyId || pregnancy.pregnancyID}`
                  : "—"}
              </div>
            </div>
          </div>

          {(pregnancy || pregnancyId) && (
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-sm">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">LMP</div>
                <div className="font-medium text-slate-800">
                  {fmtDate(pregnancy?.lastMenstrualPeriod)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">EDD</div>
                <div className="font-medium text-slate-800">
                  {fmtDate(pregnancy?.expectedDeliveryDate)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Gravida / Para</div>
                <div className="font-medium text-slate-800">
                  G{pregnancy?.gravida ?? "—"} / P{pregnancy?.para ?? "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Status</div>
                <div className="font-medium text-slate-800">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      statusLabel(pregnancy?.status) === "Active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {statusLabel(pregnancy?.status)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {moduleTitle && (
        <div className="flex items-center gap-2 px-1">
          <i className={`bi ${moduleIcon} text-rose-600 text-lg`} />
          <h1 className="text-lg font-semibold text-slate-900">{moduleTitle}</h1>
        </div>
      )}
    </div>
  );
}