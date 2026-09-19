import { useEffect, useState } from "react";
import API from "../../../../Config/API";

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="text-slate-600 font-medium">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
const emptyLabRow = () => ({ laboratoryTestTypeID: "", status: "Requested" });

export default function Laboratory({ primaryConsultationId, laboratoryTests = [], onReload }) {
  const [labTestTypes, setLabTestTypes] = useState([]);
  const [labItems, setLabItems] = useState([emptyLabRow()]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const l = await API.get("/api/doctor/lookups/laboratory-test-types");
        setLabTestTypes(l.data || []);
      } catch { /* optional */ }
    })();
  }, []);

  const flash = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000); };

  const submitLaboratory = async (e) => {
    e.preventDefault();
    if (!primaryConsultationId) { alert("Start a consultation first."); return; }
    const tests = labItems
      .filter((r) => r.laboratoryTestTypeID)
      .map((r) => ({
        laboratoryTestTypeID: Number(r.laboratoryTestTypeID),
        status: r.status || "Requested",
      }));
    if (tests.length === 0) { alert("Add at least one laboratory test."); return; }
    setSaving(true);
    try {
      await API.post(`/api/doctor/consultation/${primaryConsultationId}/laboratory-tests`, { tests });
      setLabItems([emptyLabRow()]);
      flash("Laboratory tests requested.");
      if (onReload) await onReload();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to request laboratory tests.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {message && <span className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{message}</span>}
      <div className="bg-white border rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold text-slate-800">Laboratory Tests</h3>
          <p className="text-xs text-slate-400 mt-1">Existing requests and results for this patient</p>
        </div>
        {laboratoryTests.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No laboratory tests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">ID</th>
                  <th className="text-left px-4 py-2 font-medium">Section</th>
                  <th className="text-left px-4 py-2 font-medium">Test</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-left px-4 py-2 font-medium">Consultation</th>
                  <th className="text-left px-4 py-2 font-medium">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {laboratoryTests.map((t) => {
                  const results = t.results || [];
                  const latest = results[0];
                  return (
                    <tr key={t.testID}>
                      <td className="px-4 py-2">{t.testID}</td>
                      <td className="px-4 py-2">{t.sectionName || "—"}</td>
                      <td className="px-4 py-2">{t.testName || "—"}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          t.status === "Completed" ? "bg-emerald-50 text-emerald-700"
                          : t.status === "Urgent" || t.status === "STAT" ? "bg-red-50 text-red-700"
                          : "bg-slate-100 text-slate-600"
                        }`}>{t.status || "—"}</span>
                      </td>
                      <td className="px-4 py-2">{t.requestDate ? new Date(t.requestDate).toLocaleString() : "—"}</td>
                      <td className="px-4 py-2">#{t.consultationID}</td>
                      <td className="px-4 py-2 text-xs max-w-xs">
                        {latest ? (
                          <div>
                            <div className="font-medium text-slate-800">{latest.resultDescription || "—"}</div>
                            <div className="text-slate-400 mt-0.5">
                              {latest.resultDate ? new Date(latest.resultDate).toLocaleString() : ""}
                              {latest.technicianName ? ` · ${latest.technicianName}` : ""}
                            </div>
                            {results.length > 1 && <div className="text-indigo-600 mt-1">+{results.length - 1} more result(s)</div>}
                          </div>
                        ) : (
                          <span className="text-slate-400">No result yet</span>
                        )}
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
          <h3 className="font-semibold text-slate-800">Request Laboratory Tests</h3>
          <p className="text-xs text-slate-400 mt-1">Consultation #{primaryConsultationId || "—"}</p>
        </div>
        <form onSubmit={submitLaboratory} className="p-5 space-y-4">
          {!primaryConsultationId && <p className="text-amber-600 text-sm">Create a consultation first.</p>}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Tests</span>
              <button type="button" onClick={() => setLabItems([...labItems, emptyLabRow()])} className="text-xs text-indigo-600" disabled={!primaryConsultationId}>+ Add test</button>
            </div>
            {labItems.map((row, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 border border-slate-100 rounded-lg">
                <Field label="Test type">
                  <select className={inputCls} value={row.laboratoryTestTypeID} onChange={(e) => { const next = [...labItems]; next[idx] = { ...next[idx], laboratoryTestTypeID: e.target.value }; setLabItems(next); }} required>
                    <option value="">Select test type</option>
                    {labTestTypes.map((t) => (
                      <option key={t.laboratoryTestTypeID} value={t.laboratoryTestTypeID}>
                        {t.sectionName ? `${t.sectionName} — ` : ""}{t.testName}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Status / Priority">
                  <select className={inputCls} value={row.status} onChange={(e) => { const next = [...labItems]; next[idx] = { ...next[idx], status: e.target.value }; setLabItems(next); }}>
                    <option value="Requested">Requested</option>
                    <option value="Urgent">Urgent</option>
                    <option value="STAT">STAT</option>
                  </select>
                </Field>
                <div className="flex items-end">
                  <button type="button" onClick={() => setLabItems(labItems.filter((_, i) => i !== idx))} className="text-xs text-red-600 px-2 py-2" disabled={labItems.length === 1}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving || !primaryConsultationId} className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white disabled:opacity-50">
              {saving ? "Saving..." : "Submit laboratory request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
