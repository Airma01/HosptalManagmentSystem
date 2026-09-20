import { Fragment, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
import MCHContextHeader from "../shared/MCHContextHeader";
import MCHModuleNav from "../shared/MCHModuleNav";
import { Field, fmtDate } from "../shared/Field";

const inputCls =
  "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

export default function ANCQueue() {
  const navigate = useNavigate();
  const [mchAccessAllowed, setMchAccessAllowed] = useState(null); // null = checking

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await canWriteMaternalChildHealth();
      if (cancelled) return;
      if (!ok) {
        navigate("/doctor", { replace: true });
        setMchAccessAllowed(false);
      } else {
        setMchAccessAllowed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const { patientId, visitId } = useParams();
  const [searchParams] = useSearchParams();
  
  const base = `/doctor/maternal/patient/${patientId}/${visitId}`;
  const api = `/api/doctor/patient/${patientId}/maternal-child`;
  const preselected = searchParams.get("pregnancyId") || "";

  const [rows, setRows] = useState([]);
  const [pregnancies, setPregnancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [detailCache, setDetailCache] = useState({});
  const [detailLoading, setDetailLoading] = useState(null);

  const [form, setForm] = useState({
    pregnancyID: preselected,
    patientVisitID: visitId || "",
    gestationalAgeWeeks: "",
    chiefComplaint: "",
    maternalCondition: "",
    fetalCondition: "",
    fetalHeartRate: "",
    fundalHeight: "",
    edema: "",
    counselingProvided: "",
    treatmentPlan: "",
    notes: "",
  });

  const [canWrite, setCanWrite] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await canWriteMaternalChildHealth();
      if (!cancelled) setCanWrite(ok);
    })();
    return () => { cancelled = true; };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ancRes, pregRes] = await Promise.all([
        API.get(`${api}/anc`),
        API.get(`${api}/pregnancies`),
      ]);
      let list = Array.isArray(ancRes.data) ? ancRes.data : [];
      if (preselected) {
        list = list.filter((r) => String(r.pregnancyID) === String(preselected));
      }
      setRows(list);
      setPregnancies(Array.isArray(pregRes.data) ? pregRes.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load ANC records.");
    } finally {
      setLoading(false);
    }
  }, [api, preselected]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (preselected) setForm((f) => ({ ...f, pregnancyID: preselected }));
  }, [preselected]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleExpand = async (ancVisitId) => {
    if (expandedId === ancVisitId) { setExpandedId(null); return; }
    setExpandedId(ancVisitId);
    if (detailCache[ancVisitId]) return;
    setDetailLoading(ancVisitId);
    try {
      const res = await API.get(`${api}/anc/${ancVisitId}`);
      setDetailCache((c) => ({ ...c, [ancVisitId]: res.data }));
    } catch {
      setDetailCache((c) => ({ ...c, [ancVisitId]: null }));
    } finally {
      setDetailLoading(null);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.pregnancyID) { setFormError("Select a pregnancy."); return; }
    setSaving(true);
    setFormError("");
    try {
      const body = {
        pregnancyID: Number(form.pregnancyID),
        patientVisitID: Number(form.patientVisitID || visitId),
        gestationalAgeWeeks: form.gestationalAgeWeeks === "" ? null : Number(form.gestationalAgeWeeks),
        chiefComplaint: form.chiefComplaint || null,
        maternalCondition: form.maternalCondition || null,
        fetalCondition: form.fetalCondition || null,
        fetalHeartRate: form.fetalHeartRate || null,
        fundalHeight: form.fundalHeight || null,
        edema: form.edema || null,
        counselingProvided: form.counselingProvided || null,
        treatmentPlan: form.treatmentPlan || null,
        notes: form.notes || null,
      };
      await API.post(`${api}/anc`, body);
      setShowForm(false);
      setForm((f) => ({
        ...f,
        gestationalAgeWeeks: "", chiefComplaint: "", maternalCondition: "",
        fetalCondition: "", fetalHeartRate: "", fundalHeight: "", edema: "",
        counselingProvided: "", treatmentPlan: "", notes: "",
      }));
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create ANC visit.");
    } finally {
      setSaving(false);
    }
  };

  const detail = (id) => detailCache[id];

  if (mchAccessAllowed !== true) {
    return (
      <div className="p-6 text-slate-500 text-sm flex items-center gap-2">
        <i className="bi bi-arrow-repeat animate-spin" />
        Checking access…
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto px-2 sm:px-0">
      <MCHModuleNav patientId={patientId} visitId={visitId} pregnancyId={preselected} />
      <MCHContextHeader
        patientId={patientId}
        visitId={visitId}
        pregnancyId={preselected || undefined}
        moduleTitle="ANC Visits"
        moduleIcon="bi-clipboard2-pulse"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Antenatal care history for this patient
          {preselected ? ` · Pregnancy #${preselected}` : ""}.
        </p>
        {canWrite && (
          <button type="button" onClick={() => setShowForm(true)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-700">
            <i className="bi bi-plus-lg me-1" /> Create ANC Visit
          </button>
        )}
      </div>

      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
          Loading ANC records...
        </div>
      )}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}
      {!loading && rows.length === 0 && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <i className="bi bi-clipboard2 text-3xl text-slate-300 mb-2 block" />
          <p className="text-slate-600 text-sm mb-3">
            No ANC records found{preselected ? ` for Pregnancy #${preselected}` : ""}.
          </p>
          {canWrite && (
            <button type="button" onClick={() => setShowForm(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium">
              <i className="bi bi-plus-lg me-1" /> Create ANC Visit
            </button>
          )}
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Visit #</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Pregnancy</th>
                  <th className="px-4 py-3 font-medium">Gestational Age</th>
                  <th className="px-4 py-3 font-medium">Chief Complaint</th>
                  <th className="px-4 py-3 font-medium">Maternal / Fetal</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <Fragment key={r.ancVisitID}>
                    <tr className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-medium text-slate-800">#{r.ancVisitID}</td>
                      <td className="px-4 py-3">{fmtDate(r.visitDate, true)}</td>
                      <td className="px-4 py-3">#{r.pregnancyID}</td>
                      <td className="px-4 py-3">{r.gestationalAgeWeeks != null ? `${r.gestationalAgeWeeks} weeks` : "—"}</td>
                      <td className="px-4 py-3 max-w-[10rem] truncate">{r.chiefComplaint || "—"}</td>
                      <td className="px-4 py-3 max-w-[10rem] truncate text-slate-600">
                        {[r.maternalCondition, r.fetalCondition].filter(Boolean).join(" · ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                        <button type="button" onClick={() => toggleExpand(r.ancVisitID)}
                          className="text-rose-600 text-xs font-medium hover:underline">
                          {expandedId === r.ancVisitID ? "Collapse" : "Expand"}
                        </button>
                        <Link
                          to={`${base}/anc/${r.ancVisitID}${preselected ? `?pregnancyId=${preselected}` : ""}`}
                          className="text-slate-500 text-xs font-medium hover:text-rose-600">
                          Details
                        </Link>
                      </td>
                    </tr>
                    {expandedId === r.ancVisitID && (
                      <tr>
                        <td colSpan={7} className="bg-slate-50/50 px-4 py-4">
                          {detailLoading === r.ancVisitID && (
                            <p className="text-sm text-slate-500">Loading details...</p>
                          )}
                          {detail(r.ancVisitID) && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                              <div className="col-span-full text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Visit Information</div>
                              <Field label="Visit Date" value={fmtDate(detail(r.ancVisitID).visitDate, true)} />
                              <Field label="Gestational Age" value={detail(r.ancVisitID).gestationalAgeWeeks} unit="weeks" />
                              <Field label="Patient Visit ID" value={`#${detail(r.ancVisitID).patientVisitID}`} />
                              <Field label="Pregnancy ID" value={`#${detail(r.ancVisitID).pregnancyID}`} />
                              <div className="col-span-full text-xs font-semibold text-slate-500 uppercase tracking-wide mt-2 mb-1">Clinical Findings</div>
                              <Field label="Chief Complaint" value={detail(r.ancVisitID).chiefComplaint} />
                              <Field label="Maternal Condition" value={detail(r.ancVisitID).maternalCondition} />
                              <Field label="Fetal Condition" value={detail(r.ancVisitID).fetalCondition} />
                              <Field label="Fetal Heart Rate" value={detail(r.ancVisitID).fetalHeartRate} />
                              <Field label="Fundal Height" value={detail(r.ancVisitID).fundalHeight} />
                              <Field label="Edema" value={detail(r.ancVisitID).edema} />
                              <div className="col-span-full text-xs font-semibold text-slate-500 uppercase tracking-wide mt-2 mb-1">Assessment & Plan</div>
                              <Field label="Counseling Provided" value={detail(r.ancVisitID).counselingProvided} className="col-span-2" />
                              <Field label="Treatment Plan" value={detail(r.ancVisitID).treatmentPlan} className="col-span-2" />
                              <Field label="Notes" value={detail(r.ancVisitID).notes} className="col-span-2" />
                            </div>
                          )}
                          {detail(r.ancVisitID) === null && detailLoading !== r.ancVisitID && (
                            <p className="text-sm text-red-600">Unable to load visit details.</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {canWrite && showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">New ANC Visit</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <form onSubmit={submit} className="p-5 space-y-3">
              {formError && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</div>}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Pregnancy *</label>
                <select required className={inputCls} value={form.pregnancyID} onChange={(e) => set("pregnancyID", e.target.value)}>
                  <option value="">Select pregnancy...</option>
                  {pregnancies.map((p) => (
                    <option key={p.pregnancyID} value={p.pregnancyID}>
                      #{p.pregnancyID} · {p.status ?? "—"} · LMP {p.lastMenstrualPeriod ? new Date(p.lastMenstrualPeriod).toLocaleDateString() : "—"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Patient Visit ID *</label>
                <input required className={inputCls} value={form.patientVisitID} onChange={(e) => set("patientVisitID", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Gestational Age (weeks)</label>
                  <input type="number" min={0} className={inputCls} value={form.gestationalAgeWeeks} onChange={(e) => set("gestationalAgeWeeks", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Fetal Heart Rate</label>
                  <input className={inputCls} value={form.fetalHeartRate} onChange={(e) => set("fetalHeartRate", e.target.value)} placeholder="e.g. 140 bpm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Chief Complaint</label>
                <input className={inputCls} value={form.chiefComplaint} onChange={(e) => set("chiefComplaint", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Maternal Condition</label>
                <input className={inputCls} value={form.maternalCondition} onChange={(e) => set("maternalCondition", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Fetal Condition</label>
                <input className={inputCls} value={form.fetalCondition} onChange={(e) => set("fetalCondition", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Fundal Height</label>
                  <input className={inputCls} value={form.fundalHeight} onChange={(e) => set("fundalHeight", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Edema</label>
                  <input className={inputCls} value={form.edema} onChange={(e) => set("edema", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Counseling Provided</label>
                <input className={inputCls} value={form.counselingProvided} onChange={(e) => set("counselingProvided", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Treatment Plan</label>
                <textarea rows={2} className={inputCls} value={form.treatmentPlan} onChange={(e) => set("treatmentPlan", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                <textarea rows={2} className={inputCls} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="px-3 py-2 rounded-lg bg-rose-600 text-white text-sm disabled:opacity-60">
                  {saving ? "Saving..." : "Save ANC Visit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
