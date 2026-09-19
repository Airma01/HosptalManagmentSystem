import { useEffect, useState } from "react";
import API from "../../../../Config/API";

const API_BASE = API.defaults.baseURL || "http://localhost:5241";

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className={`bg-white rounded-xl shadow-xl w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><i className="bi bi-x-lg" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="text-slate-600 font-medium">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
const emptyRadRow = () => ({ radiologyTestTypeID: "", status: "Requested" });

function buildRadiologyImageUrl(res) {
  if (!res) return null;
  if (res.imagePath) {
    if (res.imagePath.startsWith("http")) return res.imagePath;
    if (res.imagePath.startsWith("/")) return `${API_BASE}${res.imagePath}`;
    return `${API_BASE}/uploads/radiology/${res.imagePath}`;
  }
  if (res.imageName) {
    return `${API_BASE}/uploads/radiology/${res.imageName}`;
  }
  return null;
}

export default function Radiology({ primaryConsultationId, radiologyRequests = [], onReload }) {
  const [radTestTypes, setRadTestTypes] = useState([]);
  const [radItems, setRadItems] = useState([emptyRadRow()]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [modal, setModal] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await API.get("/api/doctor/lookups/radiology-test-types");
        setRadTestTypes(r.data || []);
      } catch { /* optional */ }
    })();
  }, []);

  const flash = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000); };

  const submitRadiology = async (e) => {
    e.preventDefault();
    if (!primaryConsultationId) { alert("Start a consultation first."); return; }
    const requests = radItems
      .filter((r) => r.radiologyTestTypeID)
      .map((r) => ({
        radiologyTestTypeID: Number(r.radiologyTestTypeID),
        status: "Requested",
      }));
    if (requests.length === 0) { alert("Add at least one radiology test."); return; }
    setSaving(true);
    try {
      await API.post(`/api/doctor/consultation/${primaryConsultationId}/radiology-requests`, { requests });
      setRadItems([emptyRadRow()]);
      flash("Radiology requests created.");
      if (onReload) await onReload();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create radiology requests.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {message && <span className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{message}</span>}
      <div className="bg-white border rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold text-slate-800">Radiology Requests</h3>
          <p className="text-xs text-slate-400 mt-1">Existing requests and results for this patient</p>
        </div>
        {radiologyRequests.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No radiology requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">ID</th>
                  <th className="text-left px-4 py-2 font-medium">Test</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-left px-4 py-2 font-medium">Consultation</th>
                  <th className="text-left px-4 py-2 font-medium">Result</th>
                  <th className="text-left px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {radiologyRequests.map((r) => {
                  const results = r.results || [];
                  const latest = results[0];
                  return (
                    <tr key={r.radiologyRequestID}>
                      <td className="px-4 py-2">{r.radiologyRequestID}</td>
                      <td className="px-4 py-2">{r.testName || "—"}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.status === "Completed" ? "bg-emerald-50 text-emerald-700"
                          : r.status === "InProgress" ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                        }`}>{r.status || "—"}</span>
                      </td>
                      <td className="px-4 py-2">{r.requestDate ? new Date(r.requestDate).toLocaleString() : "—"}</td>
                      <td className="px-4 py-2">#{r.consultationID}</td>
                      <td className="px-4 py-2 text-xs max-w-xs">
                        {latest ? (
                          <div>
                            <div className="font-medium text-slate-800 line-clamp-2">{latest.resultDescription || "—"}</div>
                            <div className="text-slate-400 mt-0.5">{latest.resultDate ? new Date(latest.resultDate).toLocaleString() : ""}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">No result yet</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <button type="button" onClick={() => setModal({ type: "radiologyResults", request: r })} className="text-xs text-indigo-600 hover:underline font-medium">
                          View Results
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

      <div className="bg-white border rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold text-slate-800">Request Radiology</h3>
          <p className="text-xs text-slate-400 mt-1">Consultation #{primaryConsultationId || "—"}</p>
        </div>
        <form onSubmit={submitRadiology} className="p-5 space-y-4">
          {!primaryConsultationId && <p className="text-amber-600 text-sm">Create a consultation first.</p>}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Tests</span>
              <button type="button" onClick={() => setRadItems([...radItems, emptyRadRow()])} className="text-xs text-indigo-600" disabled={!primaryConsultationId}>+ Add test</button>
            </div>
            {radItems.map((row, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 border border-slate-100 rounded-lg">
                <Field label="Radiology test">
                  <select className={inputCls} value={row.radiologyTestTypeID} onChange={(e) => { const next = [...radItems]; next[idx] = { ...next[idx], radiologyTestTypeID: e.target.value }; setRadItems(next); }} required>
                    <option value="">Select radiology test</option>
                    {radTestTypes.map((t) => (
                      <option key={t.radiologyTestTypeID} value={t.radiologyTestTypeID}>
                        {t.testName}{t.departmentName ? ` (${t.departmentName})` : ""}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select className={inputCls} value={row.status} onChange={(e) => { const next = [...radItems]; next[idx] = { ...next[idx], status: e.target.value }; setRadItems(next); }}>
                    <option value="Requested">Requested</option>
                  </select>
                </Field>
                <div className="flex items-end">
                  <button type="button" onClick={() => setRadItems(radItems.filter((_, i) => i !== idx))} className="text-xs text-red-600 px-2 py-2" disabled={radItems.length === 1}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving || !primaryConsultationId} className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white disabled:opacity-50">
              {saving ? "Saving..." : "Submit radiology request"}
            </button>
          </div>
        </form>
      </div>

      {modal?.type === "radiologyResults" && (
        <Modal title={`Radiology results — ${modal.request?.testName || "Request"}`} onClose={() => setModal(null)} wide>
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-3 text-sm grid grid-cols-2 gap-2">
              <div><span className="text-slate-500">Status:</span> <strong>{modal.request?.status || "—"}</strong></div>
              <div>
                <span className="text-slate-500">Request date:</span>{" "}
                {modal.request?.requestDate ? new Date(modal.request.requestDate).toLocaleString() : "—"}
              </div>
              <div><span className="text-slate-500">Consultation:</span> #{modal.request?.consultationID}</div>
              <div><span className="text-slate-500">Results count:</span> {(modal.request?.results || []).length}</div>
            </div>
            {(modal.request?.results || []).length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No results recorded yet for this request.</p>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {(modal.request.results || []).map((res, idx) => {
                  const imageUrl = buildRadiologyImageUrl(res);
                  return (
                    <div key={res.radiologyResultID || idx} className="border border-slate-200 rounded-xl p-4 space-y-3">
                      <div>
                        <p className="text-xs text-slate-400">Result #{res.radiologyResultID}</p>
                        <p className="font-medium text-slate-800 mt-0.5">{res.radiologyTechnicianName || "Technician"}</p>
                        <p className="text-xs text-slate-500">{res.resultDate ? new Date(res.resultDate).toLocaleString() : "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Report / Description</p>
                        <p className="text-sm text-slate-800 whitespace-pre-wrap">{res.resultDescription || "—"}</p>
                      </div>
                      {imageUrl ? (
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Image</p>
                          <div className="space-y-2">
                            <img
                              src={imageUrl}
                              alt="Radiology result"
                              className="max-h-64 rounded-lg border border-slate-200 object-contain bg-slate-50"
                              onError={(e) => {
                                e.target.style.display = "none";
                                if (e.target.nextSibling) e.target.nextSibling.classList.remove("hidden");
                              }}
                            />
                            <p className="hidden text-xs text-red-500">
                              Image could not be loaded.{" "}
                              <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="underline">Open image in new tab</a>
                            </p>
                            <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                              <i className="bi bi-box-arrow-up-right" /> Open full image
                            </a>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">No image attached.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50">Close</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
