
import { useCallback, useEffect, useMemo, useState } from "react";
import {useParams, useSearchParams, useNavigate} from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
import MCHContextHeader from "../shared/MCHContextHeader";
import MCHModuleNav from "../shared/MCHModuleNav";
import { Field, fmtDate, StatusBadge } from "../shared/Field";

const inputCls =
  "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";

const API_BASE = API.defaults.baseURL || "http://localhost:5241";

/** Build absolute URL for radiology result images from ImagePath / ImageName. */
function buildRadiologyImageUrl(res) {
  if (!res) return null;
  const path = res.imagePath || res.ImagePath;
  const name = res.imageName || res.ImageName;
  if (path) {
    if (String(path).startsWith("http")) return path;
    if (String(path).startsWith("/")) return `${API_BASE}${path}`;
    return `${API_BASE}/uploads/radiology/${path}`;
  }
  if (name) {
    return `${API_BASE}/uploads/radiology/${name}`;
  }
  return null;
}

/**
 * Pregnancy ultrasound / imaging:
 * - Request via existing Radiology types → hospital RadiologyRequest
 * - View results + images returned by radiographer
 * - Optional pregnancy-scoped findings documentation
 */
export default function PregnancyUltrasound() {
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
  const [sp] = useSearchParams();
  const api = `/api/doctor/patient/${patientId}/maternal-child`;

  const [pregnancies, setPregnancies] = useState([]);
  const [pregnancyId, setPregnancyId] = useState(sp.get("pregnancyId") || "");
  const [rows, setRows] = useState([]);
  const [radRequests, setRadRequests] = useState([]);
  const [radTypes, setRadTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRequest, setShowRequest] = useState(false);
  const [showFindings, setShowFindings] = useState(false);
  const [viewResult, setViewResult] = useState(null); // radiology request for modal
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");
  const [canWrite, setCanWrite] = useState(false);
  const [expandedFindingId, setExpandedFindingId] = useState(null);

  const [reqForm, setReqForm] = useState({
    departmentId: "",
    radiologyTestTypeID: "",
    clinicalIndication: "",
  });
  const [findingsForm, setFindingsForm] = useState({
    gestationalAgeWeeks: "",
    fetalNumber: "",
    fetalPresentation: "",
    placentaLocation: "",
    amnioticFluid: "",
    fetalHeartRate: "",
    estimatedFetalWeight: "",
    findings: "",
    impression: "",
    notes: "",
  });

  useEffect(() => {
    canWriteMaternalChildHealth().then(setCanWrite);
  }, []);

  useEffect(() => {
    API.get(`${api}/pregnancies`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setPregnancies(list);
        if (!pregnancyId && list.length) setPregnancyId(String(list[0].pregnancyID));
      })
      .catch(() => {});
  }, [api, pregnancyId]);

  useEffect(() => {
    API.get("/api/doctor/lookups/radiology-test-types")
      .then((res) => setRadTypes(Array.isArray(res.data) ? res.data : []))
      .catch(() => setRadTypes([]));
  }, []);

  const departments = useMemo(() => {
    const map = new Map();
    radTypes.forEach((t) => {
      const id = t.radiologyDepartmentID ?? t.departmentID ?? t.departmentName ?? "other";
      const name = t.departmentName || `Department ${id}`;
      if (!map.has(String(id))) map.set(String(id), { id: String(id), name });
    });
    return Array.from(map.values());
  }, [radTypes]);

  const filteredTypes = useMemo(() => {
    if (!reqForm.departmentId) return radTypes;
    return radTypes.filter((t) => {
      const id = String(t.radiologyDepartmentID ?? t.departmentID ?? t.departmentName ?? "other");
      return id === reqForm.departmentId;
    });
  }, [radTypes, reqForm.departmentId]);

  const load = useCallback(async () => {
    if (!pregnancyId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [usRes, visitRes] = await Promise.all([
        API.get(`${api}/pregnancies/${pregnancyId}/ultrasounds`),
        visitId
          ? API.get(`/api/doctor/patient/${patientId}/visit/${visitId}`).catch(() => null)
          : Promise.resolve(null),
      ]);
      setRows(Array.isArray(usRes.data) ? usRes.data : []);
      const reqs = Array.isArray(visitRes?.data?.radiologyRequests)
        ? visitRes.data.radiologyRequests
        : [];
      setRadRequests(reqs);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load ultrasound records.");
    } finally {
      setLoading(false);
    }
  }, [api, pregnancyId, patientId, visitId]);

  useEffect(() => {
    load();
  }, [load]);

  const submitRequest = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (!reqForm.radiologyTestTypeID) {
        setFormError("Select a radiology test type.");
        setSaving(false);
        return;
      }
      await API.post(`${api}/ultrasounds`, {
        pregnancyID: Number(pregnancyId),
        notes: reqForm.clinicalIndication || null,
        visitID: visitId ? Number(visitId) : null,
        radiologyTestTypeID: Number(reqForm.radiologyTestTypeID),
        clinicalIndication: reqForm.clinicalIndication || null,
      });
      setShowRequest(false);
      setReqForm({ departmentId: "", radiologyTestTypeID: "", clinicalIndication: "" });
      setMessage("Imaging request sent to Radiology department.");
      setTimeout(() => setMessage(""), 3000);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create imaging request.");
    } finally {
      setSaving(false);
    }
  };

  const submitFindings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await API.post(`${api}/ultrasounds`, {
        pregnancyID: Number(pregnancyId),
        gestationalAgeWeeks: findingsForm.gestationalAgeWeeks
          ? Number(findingsForm.gestationalAgeWeeks)
          : null,
        fetalNumber: findingsForm.fetalNumber || null,
        fetalPresentation: findingsForm.fetalPresentation || null,
        placentaLocation: findingsForm.placentaLocation || null,
        amnioticFluid: findingsForm.amnioticFluid || null,
        fetalHeartRate: findingsForm.fetalHeartRate || null,
        estimatedFetalWeight: findingsForm.estimatedFetalWeight || null,
        findings: findingsForm.findings || null,
        impression: findingsForm.impression || null,
        notes: findingsForm.notes || null,
      });
      setShowFindings(false);
      setMessage("Ultrasound findings saved for this pregnancy.");
      setTimeout(() => setMessage(""), 3000);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save findings.");
    } finally {
      setSaving(false);
    }
  };

  if (mchAccessAllowed !== true) {
    return (
      <div className="p-6 text-slate-500 text-sm flex items-center gap-2">
        <i className="bi bi-arrow-repeat animate-spin" />
        Checking access…
      </div>
    );
  }

  return (
    <div className="space-y-4">
       <MCHModuleNav patientId={patientId} visitId={visitId} pregnancyId={pregnancyId} />
      <MCHContextHeader
        patientId={patientId}
        visitId={visitId}
        pregnancyId={pregnancyId}
        moduleTitle="Pregnancy Ultrasound / Imaging"
        moduleIcon="bi-radioactive"
      />
     

      <div className="bg-white border rounded-xl shadow-sm p-4 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-[200px]">
            <label className="block text-xs text-slate-500 font-medium mb-1">Pregnancy</label>
            <select
              className={inputCls}
              value={pregnancyId}
              onChange={(e) => setPregnancyId(e.target.value)}
            >
              <option value="">Select pregnancy</option>
              {pregnancies.map((p) => (
                <option key={p.pregnancyID} value={p.pregnancyID}>
                  Pregnancy #{p.pregnancyID}
                  {p.status ? ` · ${p.status}` : ""}
                </option>
              ))}
            </select>
          </div>
          {canWrite && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowRequest(true)}
                disabled={!pregnancyId}
                className="px-3 py-2 text-sm rounded-lg bg-rose-600 text-white disabled:opacity-50"
              >
                + Imaging request (Radiology)
              </button>
              <button
                type="button"
                onClick={() => setShowFindings(true)}
                disabled={!pregnancyId}
                className="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-700 disabled:opacity-50"
              >
                + Document findings
              </button>
              <button
                type="button"
                onClick={load}
                className="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-600"
                title="Refresh results"
              >
                <i className="bi bi-arrow-clockwise" /> Refresh
              </button>
            </div>
          )}
        </div>

        {message && (
          <p className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">{message}</p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {loading && <p className="text-sm text-slate-500">Loading…</p>}

        {/* Hospital radiology requests + results with images */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-800">
            Radiology requests &amp; results (this patient / visit)
          </h4>
          <p className="text-xs text-slate-400">
            Results and images are entered by Radiology staff. Images are served from the hospital
            uploads folder.
          </p>

          {!loading && radRequests.length === 0 && (
            <p className="text-sm text-slate-500">
              No hospital radiology requests yet. Create an imaging request so Radiology can upload
              results and images.
            </p>
          )}

          {radRequests.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">ID</th>
                    <th className="text-left px-3 py-2 font-medium">Test</th>
                    <th className="text-left px-3 py-2 font-medium">Date</th>
                    <th className="text-left px-3 py-2 font-medium">Status</th>
                    <th className="text-left px-3 py-2 font-medium">Result</th>
                    <th className="text-left px-3 py-2 font-medium">Image</th>
                    <th className="text-left px-3 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {radRequests.map((r) => {
                    const results = r.results || r.Results || [];
                    const latest = results[0];
                    const imageUrl = buildRadiologyImageUrl(latest);
                    return (
                      <tr key={r.radiologyRequestID || r.RadiologyRequestID}>
                        <td className="px-3 py-2">
                          #{r.radiologyRequestID || r.RadiologyRequestID}
                        </td>
                        <td className="px-3 py-2">{r.testName || r.TestName || "—"}</td>
                        <td className="px-3 py-2">
                          {r.requestDate || r.RequestDate
                            ? fmtDate(r.requestDate || r.RequestDate, true)
                            : "—"}
                        </td>
                        <td className="px-3 py-2">
                          <StatusBadge value={r.status || r.Status} />
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600 max-w-[200px]">
                          {latest ? (
                            <span className="line-clamp-2">
                              {latest.resultDescription ||
                                latest.ResultDescription ||
                                "—"}
                            </span>
                          ) : (
                            <span className="text-slate-400">No result yet</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {imageUrl ? (
                            <a
                              href={imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block"
                            >
                              <img
                                src={imageUrl}
                                alt="Radiology"
                                className="h-12 w-16 object-cover rounded border border-slate-200 bg-slate-50"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => setViewResult(r)}
                            className="text-xs text-indigo-600 hover:underline font-medium"
                          >
                            View full result
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Pregnancy-scoped clinical findings — accordion cards */}
<div className="space-y-2 pt-3 border-t">
  <h4 className="text-sm font-semibold text-slate-800">Documented findings</h4>
  {!loading && rows.length === 0 && (
    <p className="text-sm text-slate-500">No findings documented yet.</p>
  )}
  <div className="space-y-2">
    {rows.map((r) => {
      const summary = [
        r.gestationalAgeWeeks != null ? `GA ${r.gestationalAgeWeeks}w` : null,
        r.fetalNumber || null,
        r.fetalPresentation || null,
      ]
        .filter(Boolean)
        .join(" · ");
      const open = expandedFindingId === r.pregnancyUltrasoundID;
      return (
        <div
          key={r.pregnancyUltrasoundID}
          className="rounded-lg border border-slate-200 bg-white overflow-hidden"
        >
          <button
            type="button"
            onClick={() =>
              setExpandedFindingId(open ? null : r.pregnancyUltrasoundID)
            }
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-slate-50 transition"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {summary || `Finding #${r.pregnancyUltrasoundID}`}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {fmtDate(r.examinationDate, true) || "—"}
                {r.impression ? ` · ${r.impression}` : ""}
              </p>
            </div>
            <i
              className={`bi bi-chevron-down text-xs text-slate-400 shrink-0 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-200 ${
              open ? "max-h-96 border-t border-slate-100" : "max-h-0"
            }`}
          >
            <div className="px-3 py-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              <div>
                <span className="text-slate-400">GA weeks</span>
                <p className="text-slate-800 font-medium">
                  {r.gestationalAgeWeeks ?? "—"}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Fetal number</span>
                <p className="text-slate-800 font-medium">{r.fetalNumber || "—"}</p>
              </div>
              <div>
                <span className="text-slate-400">Presentation</span>
                <p className="text-slate-800 font-medium">
                  {r.fetalPresentation || "—"}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Placenta</span>
                <p className="text-slate-800 font-medium">
                  {r.placentaLocation || "—"}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Amniotic fluid</span>
                <p className="text-slate-800 font-medium">{r.amnioticFluid || "—"}</p>
              </div>
              <div>
                <span className="text-slate-400">FHR</span>
                <p className="text-slate-800 font-medium">{r.fetalHeartRate || "—"}</p>
              </div>
              <div>
                <span className="text-slate-400">Est. weight</span>
                <p className="text-slate-800 font-medium">
                  {r.estimatedFetalWeight || "—"}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">Findings</span>
                <p className="text-slate-800 whitespace-pre-wrap">{r.findings || "—"}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">Impression</span>
                <p className="text-slate-800 whitespace-pre-wrap">{r.impression || "—"}</p>
              </div>
              {r.notes && (
                <div className="col-span-2">
                  <span className="text-slate-400">Notes</span>
                  <p className="text-slate-800 whitespace-pre-wrap">{r.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    })}
  </div>
</div>
      </div>

      {/* Full result modal with image */}
      {viewResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold text-slate-800">
                Radiology result — {viewResult.testName || viewResult.TestName || "Request"}
              </h3>
              <button
                type="button"
                onClick={() => setViewResult(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 rounded-lg p-3 text-sm grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">Status:</span>{" "}
                  <strong>{viewResult.status || viewResult.Status || "—"}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Request date:</span>{" "}
                  {viewResult.requestDate || viewResult.RequestDate
                    ? fmtDate(viewResult.requestDate || viewResult.RequestDate, true)
                    : "—"}
                </div>
                <div>
                  <span className="text-slate-500">Request ID:</span> #
                  {viewResult.radiologyRequestID || viewResult.RadiologyRequestID}
                </div>
                <div>
                  <span className="text-slate-500">Results:</span>{" "}
                  {(viewResult.results || viewResult.Results || []).length}
                </div>
              </div>

              {(viewResult.results || viewResult.Results || []).length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">
                  No results recorded yet. Radiology staff must complete the exam and upload the
                  image/report.
                </p>
              ) : (
                <div className="space-y-4">
                  {(viewResult.results || viewResult.Results || []).map((res, idx) => {
                    const imageUrl = buildRadiologyImageUrl(res);
                    return (
                      <div
                        key={res.radiologyResultID || res.RadiologyResultID || idx}
                        className="border border-slate-200 rounded-xl p-4 space-y-3"
                      >
                        <div>
                          <p className="text-xs text-slate-400">
                            Result #{res.radiologyResultID || res.RadiologyResultID}
                          </p>
                          <p className="font-medium text-slate-800 mt-0.5">
                            {res.radiologyTechnicianName ||
                              res.RadiologyTechnicianName ||
                              "Technician"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {res.resultDate || res.ResultDate
                              ? fmtDate(res.resultDate || res.ResultDate, true)
                              : "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">
                            Report / Description
                          </p>
                          <p className="text-sm text-slate-800 whitespace-pre-wrap">
                            {res.resultDescription || res.ResultDescription || "—"}
                          </p>
                        </div>

                        {imageUrl ? (
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">Image</p>
                            <div className="space-y-2">
                              <img
                                src={imageUrl}
                                alt="Radiology result"
                                className="max-h-80 w-full rounded-lg border border-slate-200 object-contain bg-slate-50"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  const next = e.target.nextSibling;
                                  if (next) next.classList.remove("hidden");
                                }}
                              />
                              <p className="hidden text-xs text-red-500">
                                Image could not be loaded.{" "}
                                <a
                                  href={imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline"
                                >
                                  Open in new tab
                                </a>
                                <span className="block mt-1 text-slate-400 break-all">
                                  URL: {imageUrl}
                                </span>
                              </p>
                              <a
                                href={imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                              >
                                <i className="bi bi-box-arrow-up-right" /> Open full image
                              </a>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">
                            No image attached to this result.
                            {(res.imagePath || res.ImagePath || res.imageName || res.ImageName) && (
                              <span className="block mt-1 break-all">
                                Stored path:{" "}
                                {res.imagePath || res.ImagePath || res.imageName || res.ImageName}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setViewResult(null)}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {canWrite && showRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form
            onSubmit={submitRequest}
            className="bg-white rounded-xl w-full max-w-md p-5 space-y-3 shadow-xl"
          >
            <h3 className="font-semibold">Imaging request (Radiology)</h3>
            <p className="text-xs text-slate-400">
              Creates a hospital RadiologyRequest. Radiology staff upload the image and report.
            </p>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div>
              <label className="block text-xs font-medium mb-1">Category / Department *</label>
              <select
                className={inputCls}
                value={reqForm.departmentId}
                onChange={(e) =>
                  setReqForm((f) => ({
                    ...f,
                    departmentId: e.target.value,
                    radiologyTestTypeID: "",
                  }))
                }
                required
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Imaging type *</label>
              <select
                className={inputCls}
                value={reqForm.radiologyTestTypeID}
                onChange={(e) =>
                  setReqForm((f) => ({ ...f, radiologyTestTypeID: e.target.value }))
                }
                required
              >
                <option value="">Select type</option>
                {filteredTypes.map((t) => (
                  <option key={t.radiologyTestTypeID} value={t.radiologyTestTypeID}>
                    {t.testName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Clinical indication</label>
              <textarea
                className={inputCls}
                rows={2}
                value={reqForm.clinicalIndication}
                onChange={(e) =>
                  setReqForm((f) => ({ ...f, clinicalIndication: e.target.value }))
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRequest(false)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-3 py-2 bg-rose-600 text-white rounded-lg text-sm disabled:opacity-60"
              >
                {saving ? "Saving..." : "Create request"}
              </button>
            </div>
          </form>
        </div>
      )}

      {canWrite && showFindings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form
            onSubmit={submitFindings}
            className="bg-white rounded-xl w-full max-w-md p-4 space-y-3 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-semibold text-slate-800 text-sm">Document findings</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="grid grid-cols-2 gap-2">
              {[
                ["gestationalAgeWeeks", "GA weeks"],
                ["fetalNumber", "Fetal number"],
                ["fetalPresentation", "Presentation"],
                ["placentaLocation", "Placenta"],
                ["amnioticFluid", "Amniotic fluid"],
                ["fetalHeartRate", "FHR"],
                ["estimatedFetalWeight", "Est. weight"],
              ].map(([k, label]) => (
                <div key={k} className={k === "estimatedFetalWeight" ? "col-span-2" : ""}>
                  <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
                    {label}
                  </label>
                  <input
                    className={inputCls}
                    value={findingsForm[k]}
                    onChange={(e) =>
                      setFindingsForm((f) => ({ ...f, [k]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
                Impression / findings
              </label>
              <textarea
                className={inputCls}
                rows={2}
                value={findingsForm.impression || findingsForm.findings}
                onChange={(e) =>
                  setFindingsForm((f) => ({
                    ...f,
                    impression: e.target.value,
                    findings: e.target.value,
                  }))
                }
                placeholder="Brief clinical summary"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowFindings(false)}
                className="px-3 py-1.5 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-sm disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}