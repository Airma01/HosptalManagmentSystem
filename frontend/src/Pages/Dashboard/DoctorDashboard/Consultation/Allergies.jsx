
import { useState } from "react";
import ClinicalRecordAccordion from "../Components/ClinicalRecordAccordion";
import API from "../../../../Config/API";

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${
          wide ? "max-w-2xl" : "max-w-lg"
        } max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="bi bi-x-lg" />
          </button>
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

const inputCls =
  "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function Allergies({ patientId, allergies = [], onReload }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [message, setMessage] = useState("");

  const flash = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const openCreate = () => {
    setForm({ isActive: true });
    setModal({ mode: "create" });
  };

  const openEdit = (record) => {
    setForm({ ...record });
    setModal({ mode: "edit", record });
  };

  const closeModal = () => {
    setModal(null);
    setForm({});
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        allergen: form.allergen || "",
        reaction: form.reaction || null,
        severity: form.severity || null,
        isActive: form.isActive ?? true,
        onsetDate: form.onsetDate || null,
        notes: form.notes || null,
      };
      if (modal.mode === "create") {
        await API.post(`/api/doctor/patient/${patientId}/allergies`, body);
      } else {
        await API.put(
          `/api/doctor/patient/${patientId}/allergies/${modal.record.allergyID}`,
          body
        );
      }
      closeModal();
      flash("Saved successfully.");
      if (onReload) await onReload();
    } catch (err) {
      alert(err.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    try {
      await API.delete(`/api/doctor/patient/${patientId}/allergies/${confirmDelete}`);
      setConfirmDelete(null);
      flash("Deleted.");
      if (onReload) await onReload();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <div className="space-y-3">
      {message && (
        <span className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          {message}
        </span>
      )}
      <div className="flex justify-end">
        <button type="button" onClick={openCreate} className="text-sm text-indigo-600">
          + Add
        </button>
      </div>
      <ClinicalRecordAccordion
        title="Allergies"
        records={allergies}
        idKey="allergyID"
        onEdit={openEdit}
        onDelete={(id) => setConfirmDelete(id)}
        excludeKeys={["patientID"]}
      />

      {modal && (
        <Modal title={modal.mode === "create" ? "Add allergy" : "Edit allergy"} onClose={closeModal}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Allergen">
              <input
                className={inputCls}
                value={form.allergen || ""}
                onChange={(e) => setForm({ ...form, allergen: e.target.value })}
                required
              />
            </Field>
            <Field label="Reaction">
              <input
                className={inputCls}
                value={form.reaction || ""}
                onChange={(e) => setForm({ ...form, reaction: e.target.value })}
              />
            </Field>
            <Field label="Severity">
              <select
                className={inputCls}
                value={form.severity || ""}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
              >
                <option value="">—</option>
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </Field>
            <Field label="Active">
              <select
                className={inputCls}
                value={form.isActive === false ? "false" : "true"}
                onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </Field>
            <Field label="Notes">
              <textarea
                className={inputCls}
                rows={2}
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={closeModal} className="px-4 py-2 text-sm rounded-lg border">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Confirm delete" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-slate-600 mb-4">Are you sure you want to delete this record?</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm rounded-lg border">
              Cancel
            </button>
            <button type="button" onClick={doDelete} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white">
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
