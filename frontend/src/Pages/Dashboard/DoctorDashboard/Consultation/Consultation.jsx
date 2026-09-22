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
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
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

export default function Consultation({
  patientId,
  visitId,
  consultations = [],
  currentVisitConsultations = [],
  onReload,
}) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const flash = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const openCreate = () => {
    setForm({});
    setModal({ mode: "create" });
  };

  const closeModal = () => {
    setModal(null);
    setForm({});
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post(
        `/api/doctor/patient/${patientId}/visit/${visitId}/consultation`,
        {
          chiefComplaint: form.chiefComplaint || "",
          historyOfPresentIllness: form.historyOfPresentIllness || "",
          assessment: form.assessment || null,
          treatmentPlan: form.treatmentPlan || null,
          clinicalNotes: form.clinicalNotes || null,
        }
      );
      closeModal();
      flash("Saved successfully.");
      if (onReload) await onReload();
    } catch (err) {
      alert(err.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  // History from other visits only
  const previous = (consultations || []).filter(
    (c) => String(c.visitID) !== String(visitId)
  );

  // Group previous by VisitID
  const byVisit = previous.reduce((acc, c) => {
    const key = String(c.visitID ?? "unknown");
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {message && (
        <span className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          {message}
        </span>
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm text-slate-500">
          Showing <strong>{consultations.length}</strong> consultation(s) across
          all visits
          {currentVisitConsultations?.length > 0 && (
            <>
              {" "}
              · <strong>{currentVisitConsultations.length}</strong> on this visit
            </>
          )}
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="text-sm text-indigo-600"
        >
          + New consultation
        </button>
      </div>

      {/* This visit */}
      {currentVisitConsultations?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            This visit (#{visitId})
          </h4>
          <ClinicalRecordAccordion
            title="Consultation"
            records={currentVisitConsultations}
            idKey="consultationID"
            excludeKeys={["doctorID", "physicalExaminations", "diagnoses"]}
          />
        </div>
      )}

      {/* Previous visits */}
      {previous.length === 0 ? (
        !currentVisitConsultations?.length && (
          <p className="text-sm text-slate-400">No consultation history yet.</p>
        )
      ) : (
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Previous visits
          </h4>
          {Object.entries(byVisit).map(([vid, records]) => (
            <div
              key={vid}
              className="border border-slate-200 rounded-xl p-3 bg-slate-50/50"
            >
              <p className="text-sm font-medium text-slate-700 mb-2">
                Visit #{vid}
                <span className="text-slate-400 font-normal ml-2">
                  {records[0]?.consultationDate
                    ? new Date(records[0].consultationDate).toLocaleString()
                    : ""}
                </span>
              </p>
              <ClinicalRecordAccordion
                title="Consultation"
                records={records}
                idKey="consultationID"
                excludeKeys={["doctorID", "physicalExaminations", "diagnoses"]}
              />
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title="New consultation" onClose={closeModal} wide>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Chief complaint">
              <textarea
                className={inputCls}
                rows={2}
                value={form.chiefComplaint || ""}
                onChange={(e) =>
                  setForm({ ...form, chiefComplaint: e.target.value })
                }
                required
              />
            </Field>
            <Field label="History of present illness">
              <textarea
                className={inputCls}
                rows={3}
                value={form.historyOfPresentIllness || ""}
                onChange={(e) =>
                  setForm({ ...form, historyOfPresentIllness: e.target.value })
                }
              />
            </Field>
            <Field label="Assessment">
              <textarea
                className={inputCls}
                rows={2}
                value={form.assessment || ""}
                onChange={(e) =>
                  setForm({ ...form, assessment: e.target.value })
                }
              />
            </Field>
            <Field label="Treatment plan">
              <textarea
                className={inputCls}
                rows={2}
                value={form.treatmentPlan || ""}
                onChange={(e) =>
                  setForm({ ...form, treatmentPlan: e.target.value })
                }
              />
            </Field>
            <Field label="Clinical notes">
              <textarea
                className={inputCls}
                rows={2}
                value={form.clinicalNotes || ""}
                onChange={(e) =>
                  setForm({ ...form, clinicalNotes: e.target.value })
                }
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm rounded-lg border"
              >
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
    </div>
  );
}