import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  createReferral,
  getDepartments,
  searchPatients,
  getPatientVisitsForCreate,
} from "../Services/referralApi";
import { getAuthenticatedUser } from "../../../../utils/getAuthenticatedUser";

/**
 * Create referral with patient search (name / MRN / Fayda).
 * Optional query: ?patientId=&visitId=
 */
export default function CreateReferral() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const debounceRef = useRef(null);

  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [visits, setVisits] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(false);

  const [form, setForm] = useState({
    patientID: searchParams.get("patientId") || "",
    patientVisitID: searchParams.get("visitId") || "",
    receivingDepartmentID: "",
    referralReason: "",
    clinicalSummary: "",
    diagnosis: "",
    urgency: "",
    referralType: "",
    expectedArrivalDate: "",
    destinationFacility: "",
    notes: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingDepts(true);
      try {
        const [deptRes, authUser] = await Promise.all([
          getDepartments(),
          getAuthenticatedUser(),
        ]);
        if (cancelled) return;
        setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
        setUser(authUser);
      } catch (err) {
        if (cancelled) return;
        const status = err.response?.status;
        if (status === 401) setError("Unauthorized. Please log in again.");
        else if (status === 403) setError("You are not authorized to create referrals.");
        else if (status === 404)
          setError(
            "Departments API not found. Restart the backend after adding GET /api/referral/departments."
          );
        else setError(err.response?.data?.message || "Failed to load departments.");
      } finally {
        if (!cancelled) setLoadingDepts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const pid = searchParams.get("patientId");
    if (!pid) return;
    let cancelled = false;
    (async () => {
      setLoadingVisits(true);
      try {
        const res = await getPatientVisitsForCreate(pid);
        if (cancelled) return;
        setVisits(Array.isArray(res.data) ? res.data : []);
        setSelectedPatient({
          patientID: Number(pid),
          patientName: `Patient #${pid}`,
        });
      } catch {
        if (!cancelled) setVisits([]);
      } finally {
        if (!cancelled) setLoadingVisits(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = query.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchError("");
      setSearching(false);
      return;
    }

    setSearching(true);
    setSearchError("");
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchPatients(q);
        setSearchResults(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        const status = err.response?.status;
        if (status === 404)
          setSearchError("Patient search API not found. Restart the backend.");
        else setSearchError(err.response?.data?.message || "Search failed.");
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const selectPatient = async (p) => {
    const id = p.patientID ?? p.PatientID;
    setSelectedPatient(p);
    setForm((f) => ({ ...f, patientID: String(id), patientVisitID: "" }));
    setQuery("");
    setSearchResults([]);
    setLoadingVisits(true);
    try {
      const res = await getPatientVisitsForCreate(id);
      setVisits(Array.isArray(res.data) ? res.data : []);
    } catch {
      setVisits([]);
    } finally {
      setLoadingVisits(false);
    }
  };

  const clearPatient = () => {
    setSelectedPatient(null);
    setVisits([]);
    setForm((f) => ({ ...f, patientID: "", patientVisitID: "" }));
  };

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const myDeptId = user?.departmentID != null ? Number(user.departmentID) : null;

  const destinationOptions = departments.filter((d) => {
    const id = d.clinicalDepartmentID ?? d.ClinicalDepartmentID;
    return myDeptId == null || Number(id) !== myDeptId;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const patientID = Number(form.patientID);
    const patientVisitID = Number(form.patientVisitID);
    const receivingDepartmentID = Number(form.receivingDepartmentID);

    if (!patientID || patientID <= 0) {
      setError("Please search and select a patient.");
      return;
    }
    if (!patientVisitID || patientVisitID <= 0) {
      setError("Please select a visit.");
      return;
    }
    if (!receivingDepartmentID || receivingDepartmentID <= 0) {
      setError("Destination department is required.");
      return;
    }

    const payload = {
      patientID,
      patientVisitID,
      receivingDepartmentID,
      referralReason: form.referralReason || null,
      clinicalSummary: form.clinicalSummary || null,
      diagnosis: form.diagnosis || null,
      urgency: form.urgency || null,
      referralType: form.referralType || null,
      expectedArrivalDate: form.expectedArrivalDate
        ? new Date(form.expectedArrivalDate).toISOString()
        : null,
      destinationFacility: form.destinationFacility || null,
      notes: form.notes || null,
    };

    setSubmitting(true);
    try {
      const res = await createReferral(payload);
      const created = res.data;
      const id = created?.referralID ?? created?.ReferralID;
      setSuccess(
        id ? `Referral #${id} created successfully.` : "Referral created successfully."
      );
      if (id) setTimeout(() => navigate(`/doctor/referrals/${id}`), 800);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 401) setError("Unauthorized. Please log in again.");
      else if (status === 403) setError("You are not authorized to create this referral.");
      else if (status === 404) setError(msg || "Patient, visit, or department not found.");
      else if (status === 400) setError(msg || "Invalid referral data.");
      else setError(msg || "Unable to create referral.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400";

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-start gap-3">
        <Link
          to="/doctor/referrals"
          className="mt-1 inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition"
        >
          <i className="bi bi-arrow-left" />
        </Link>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Create Referral</h2>
          <p className="text-sm text-slate-500">
            Search a patient, select a visit, and refer to another department.
            {user?.departmentName ? (
              <span className="text-slate-600"> Source: {user.departmentName}</span>
            ) : null}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700 flex items-start gap-2">
          <i className="bi bi-exclamation-triangle mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700 flex items-start gap-2">
          <i className="bi bi-check-circle mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-5"
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Search patient (name, MRN, or Fayda number)
          </label>

          {selectedPatient ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3">
              <div className="min-w-0">
                <p className="font-medium text-slate-800 truncate">
                  {selectedPatient.patientName ||
                    `${selectedPatient.firstName || ""} ${selectedPatient.lastName || ""}`.trim() ||
                    `Patient #${selectedPatient.patientID}`}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  ID: {selectedPatient.patientID ?? selectedPatient.PatientID}
                  {selectedPatient.mrn ? ` · MRN: ${selectedPatient.mrn}` : ""}
                  {selectedPatient.faydaFIN ? ` · Fayda: ${selectedPatient.faydaFIN}` : ""}
                  {selectedPatient.phone ? ` · ${selectedPatient.phone}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={clearPatient}
                className="text-sm text-indigo-700 hover:underline shrink-0"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type name, MRN, or Fayda number…"
                className={`${inputCls} pl-9`}
                autoComplete="off"
              />
              {searching && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              )}

              {(searchResults.length > 0 ||
                searchError ||
                (query.trim().length >= 2 && !searching)) && (
                <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                  {searchError && (
                    <p className="px-3 py-2 text-sm text-rose-600">{searchError}</p>
                  )}
                  {!searchError && searchResults.length === 0 && !searching && (
                    <p className="px-3 py-2 text-sm text-slate-500">No patients found.</p>
                  )}
                  {searchResults.map((p) => {
                    const id = p.patientID ?? p.PatientID;
                    const name =
                      p.patientName ||
                      `${p.firstName || ""} ${p.lastName || ""}`.trim() ||
                      `Patient #${id}`;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => selectPatient(p)}
                        className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 border-b border-slate-50 last:border-0"
                      >
                        <p className="text-sm font-medium text-slate-800">{name}</p>
                        <p className="text-xs text-slate-500">
                          ID {id}
                          {p.mrn ? ` · MRN ${p.mrn}` : ""}
                          {p.faydaFIN ? ` · Fayda ${p.faydaFIN}` : ""}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {form.patientID && (
          <label className="block text-sm">
            <span className="text-slate-600 font-medium">Select visit *</span>
            <select
              required
              value={form.patientVisitID}
              onChange={(e) => setField("patientVisitID", e.target.value)}
              className={`${inputCls} mt-1 bg-white`}
              disabled={loadingVisits}
            >
              <option value="">
                {loadingVisits ? "Loading visits…" : "Select a visit"}
              </option>
              {visits.map((v) => {
                const vid = v.visitID ?? v.VisitID;
                const date = v.visitDate
                  ? new Date(v.visitDate).toLocaleString()
                  : "—";
                return (
                  <option key={vid} value={vid}>
                    Visit #{vid} · {date} · {v.visitType || "—"} · {v.status || "—"}
                  </option>
                );
              })}
            </select>
            {!loadingVisits && visits.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No visits found for this patient.
              </p>
            )}
          </label>
        )}

        <label className="block text-sm">
          <span className="text-slate-600 font-medium">Destination department *</span>
          <select
            required
            value={form.receivingDepartmentID}
            onChange={(e) => setField("receivingDepartmentID", e.target.value)}
            className={`${inputCls} mt-1 bg-white`}
            disabled={loadingDepts}
          >
            <option value="">
              {loadingDepts ? "Loading departments…" : "Select department"}
            </option>
            {destinationOptions.map((d) => {
              const id = d.clinicalDepartmentID ?? d.ClinicalDepartmentID;
              const name = d.departmentName ?? d.DepartmentName;
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              );
            })}
          </select>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="text-slate-600 font-medium">Urgency</span>
            <select
              value={form.urgency}
              onChange={(e) => setField("urgency", e.target.value)}
              className={`${inputCls} mt-1 bg-white`}
            >
              <option value="">Select urgency</option>
              <option value="Routine">Routine</option>
              <option value="Urgent">Urgent</option>
              <option value="Emergency">Emergency</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-slate-600 font-medium">Referral type</span>
            <input
              type="text"
              value={form.referralType}
              onChange={(e) => setField("referralType", e.target.value)}
              className={`${inputCls} mt-1`}
              placeholder="e.g. Internal, Specialist"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="text-slate-600 font-medium">Referral reason</span>
          <textarea
            rows={3}
            value={form.referralReason}
            onChange={(e) => setField("referralReason", e.target.value)}
            className={`${inputCls} mt-1`}
            placeholder="Why is this patient being referred?"
          />
        </label>

        <label className="block text-sm">
          <span className="text-slate-600 font-medium">Clinical summary</span>
          <textarea
            rows={3}
            value={form.clinicalSummary}
            onChange={(e) => setField("clinicalSummary", e.target.value)}
            className={`${inputCls} mt-1`}
          />
        </label>

        <label className="block text-sm">
          <span className="text-slate-600 font-medium">Diagnosis</span>
          <input
            type="text"
            value={form.diagnosis}
            onChange={(e) => setField("diagnosis", e.target.value)}
            className={`${inputCls} mt-1`}
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="text-slate-600 font-medium">Expected arrival</span>
            <input
              type="datetime-local"
              value={form.expectedArrivalDate}
              onChange={(e) => setField("expectedArrivalDate", e.target.value)}
              className={`${inputCls} mt-1`}
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600 font-medium">Destination facility</span>
            <input
              type="text"
              value={form.destinationFacility}
              onChange={(e) => setField("destinationFacility", e.target.value)}
              className={`${inputCls} mt-1`}
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="text-slate-600 font-medium">Notes</span>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            className={`${inputCls} mt-1`}
          />
        </label>

        <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-slate-100">
          <Link
            to="/doctor/referrals"
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || loadingDepts}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {submitting && (
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <i className="bi bi-send" />
            Create Referral
          </button>
        </div>
      </form>
    </div>
  );
}