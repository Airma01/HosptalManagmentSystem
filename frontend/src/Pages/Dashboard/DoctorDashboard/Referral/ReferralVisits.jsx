import { useEffect, useState } from "react";
import { getPatientVisits, getVisitTriage } from "../Services/referralApi";
import ReferralVisitTable from "../Components/ReferralVisitTable";

/**
 * Loads existing patient visits + triage for a selected visit.
 * Does NOT create visits. PatientID comes from the referral detail.
 */
export default function ReferralVisits({
  patientId,
  linkedVisitId,
  selectedVisitId,
  onSelectVisit,
}) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [triages, setTriages] = useState([]);
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageError, setTriageError] = useState("");

  useEffect(() => {
    if (patientId == null) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getPatientVisits(patientId);
        if (cancelled) return;
        const data = Array.isArray(res.data) ? res.data : [];
        setVisits(data);

        // Prefer linked referral visit if present in the list
        if (linkedVisitId != null && data.some((v) => v.visitID === linkedVisitId)) {
          onSelectVisit?.(data.find((v) => v.visitID === linkedVisitId));
        }
      } catch (err) {
        if (cancelled) return;
        const status = err.response?.status;
        if (status === 401) setError("Unauthorized. Please log in again.");
        else if (status === 403) setError("You are not authorized to view visits for this patient.");
        else if (status === 404) setError("Patient not found.");
        else setError(err.response?.data?.message || "Unable to load patient visits.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patientId, linkedVisitId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedVisitId == null) {
      setTriages([]);
      setTriageError("");
      return;
    }
    let cancelled = false;
    (async () => {
      setTriageLoading(true);
      setTriageError("");
      try {
        const res = await getVisitTriage(selectedVisitId);
        if (cancelled) return;
        setTriages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (cancelled) return;
        const status = err.response?.status;
        if (status === 401) setTriageError("Unauthorized. Please log in again.");
        else if (status === 403) setTriageError("You are not authorized to view triage for this visit.");
        else if (status === 404) setTriageError("Visit not found.");
        else setTriageError(err.response?.data?.message || "Unable to load triage.");
      } finally {
        if (!cancelled) setTriageLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedVisitId]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <ReferralVisitTable
        visits={visits}
        selectedVisitId={selectedVisitId}
        onSelect={onSelectVisit}
        loading={loading}
      />

      {/* Triage / vital signs for selected visit */}
      {selectedVisitId != null && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <i className="bi bi-activity text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-700">
              Triage (Visit {selectedVisitId})
            </h3>
          </div>
          <div className="p-4">
            {triageLoading && (
              <div className="text-center py-6">
                <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500 mt-2">Loading triage…</p>
              </div>
            )}
            {!triageLoading && triageError && (
              <p className="text-sm text-rose-600">{triageError}</p>
            )}
            {!triageLoading && !triageError && triages.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                No triage record available for this visit.
              </p>
            )}
            {!triageLoading &&
              triages.map((t) => (
                <div
                  key={t.triageId}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-sm mb-3 last:mb-0"
                >
                  <Vital label="Temperature" value={t.temprature} unit="°C" />
                  <Vital label="Blood Pressure" value={t.bloodPressure} />
                  <Vital label="Heart Rate" value={t.heartRate} unit="bpm" />
                  <Vital label="Resp. Rate" value={t.respiratotyRate} />
                  <Vital label="Weight" value={t.weight} unit="kg" />
                  <Vital label="Department" value={t.clinicalDepartmentName} />
                  {t.notes ? (
                    <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                      <p className="text-xs text-slate-400">Notes</p>
                      <p className="text-slate-700">{t.notes}</p>
                    </div>
                  ) : null}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Vital({ label, value, unit }) {
  if (value == null || value === "") {
    return (
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="font-medium text-slate-400">—</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-medium text-slate-800">
        {value}
        {unit ? <span className="text-slate-400 text-xs ml-1">{unit}</span> : null}
      </p>
    </div>
  );
}
