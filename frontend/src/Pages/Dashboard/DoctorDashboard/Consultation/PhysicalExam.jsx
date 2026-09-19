import { useState } from "react";
import ClinicalRecordAccordion from "../Components/ClinicalRecordAccordion";
import API from "../../../../Config/API";

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

export default function PhysicalExam({ primaryConsultationId, visitConsultations = [], onReload }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const flash = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000); };
  const openCreate = () => {
    if (!primaryConsultationId) return;
    setForm({ consultationID: primaryConsultationId });
    setModal({ mode: "create" });
  };
  const closeModal = () => { setModal(null); setForm({}); };
  const submit = async (e) => {
    e.preventDefault();
    if (!form.consultationID) { alert("Start a consultation first."); return; }
    setSaving(true);
    try {
      await API.post(`/api/doctor/consultation/${form.consultationID}/physical-examination`, {
        examinationArea: form.examinationArea || "",
        findings: form.findings || "",
        notes: form.notes || null,
      });
      closeModal(); flash("Saved successfully."); if (onReload) await onReload();
    } catch (err) { alert(err.response?.data?.message || "Save failed."); }
    finally { setSaving(false); }
  };
  const records = visitConsultations.flatMap((c) => c.physicalExaminations || []);
  return (
    <div className="space-y-3">
      {message && <span className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{message}</span>}
      <div className="flex justify-end">
        <button type="button" disabled={!primaryConsultationId} onClick={openCreate} className="text-sm text-indigo-600 disabled:opacity-40">+ Add finding</button>
      </div>
      {visitConsultations.length === 0 ? (
        <p className="p-5 text-sm text-slate-500 bg-white border rounded-lg">Create a consultation first.</p>
      ) : (
        <ClinicalRecordAccordion title="Physical Examination" records={records} idKey="physicalExaminationID" excludeKeys={["consultationID"]} />
      )}
      {modal && (
        <Modal title="Add physical examination" onClose={closeModal}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Examination area"><input className={inputCls} value={form.examinationArea || ""} onChange={(e) => setForm({ ...form, examinationArea: e.target.value })} required /></Field>
            <Field label="Findings"><textarea className={inputCls} rows={3} value={form.findings || ""} onChange={(e) => setForm({ ...form, findings: e.target.value })} required /></Field>
            <Field label="Notes"><textarea className={inputCls} rows={2} value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={closeModal} className="px-4 py-2 text-sm rounded-lg border">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
