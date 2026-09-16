import { useCallback, useEffect, useState } from "react";
import API from "../../../../../Config/API";

/**
 * Consistent patient + visit + pregnancy context header for all MCH module pages.
 * Uses route patientId/visitId and optional pregnancyId (query or prop).
 * Reuses existing patient/pregnancy APIs — no duplicate models.
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

  const apiBase = `/api/doctor/patient/${patientId}/maternal-child`;

  const load = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const tasks = [API.get("/api/doctor/triage")];
      if (pregnancyId) {
        tasks.push(API.get(`${apiBase}/pregnancies/${pregnancyId}`).catch(() => null));
      } else {
        tasks.push(API.get(`${apiBase}/pregnancies`).catch(() => ({ data: [] })));
      }
      const [triageRes, pregRes] = await Promise.all(tasks);

      const queue = Array.isArray(triageRes?.data) ? triageRes.data : [];
      const match = queue.find(
        (t) => String(t.patientID) === String(patientId) && String(t.visitID) === String(visitId)
      );
      if (match) {
        setPatient({
          patientID: match.patientID,
          patientName: match.patientName || "—",
          mrn: match.mrn || match.MRN || null,
          gender: match.gender || match.sex || null,
          age: match.age ?? null,
          visitID: match.visitID,
          visitDate: match.visitDate,
          visitType: match.visitType,
          visitStatus: match.visitStatus,
        });
      } else {
        setPatient({
          patientID: patientId,
          patientName: `Patient #${patientId}`,
          visitID: visitId,
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
            patientName: p.patient.fullName || p.patient.patientName || prev?.patientName,
            mrn: p.patient.mrn || p.patient.MRN || prev?.mrn,
            gender: p.patient.gender || p.patient.sex || prev?.gender,
            age: p.patient.age ?? prev?.age,
          }));
        }
      } else if (Array.isArray(pregRes?.data) && pregRes.data.length) {
        const active = pregRes.data.find((x) => x.status === 0 || x.status === "Active") || pregRes.data[0];
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
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100 px-4 py-2.5 flex items-center gap-2">
          <i className="bi bi-person-badge text-rose-600" />
          <span className="text-sm font-semibold text-slate-800">Patient Information</span>
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
