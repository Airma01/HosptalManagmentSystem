import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../../../Config/API";

const CARE_TYPES = [
  { key: "asthma", label: "Asthma", listKey: "asthmaManagement", idKey: "asthmaManagementID" },
  { key: "diabetes", label: "Diabetes", listKey: "diabetesManagement", idKey: "diabetesManagementID" },
  { key: "hiv", label: "HIV Care", listKey: "hivCare", idKey: "hivCareID" },
  { key: "hepatitis", label: "Hepatitis", listKey: "hepatitisManagement", idKey: "hepatitisManagementID" },
  { key: "hypertension", label: "Hypertension", listKey: "hypertensionManagement", idKey: "hypertensionManagementID" },
  { key: "mental-health", label: "Mental Health", listKey: "mentalHealthCare", idKey: "mentalHealthCareID" },
  { key: "tuberculosis", label: "Tuberculosis", listKey: "tuberculosisManagement", idKey: "tuberculosisManagementID" },
];

const inputCls =
  "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/** Build create/update body from form based on care type — only real model fields. */
function buildBody(careKey, form) {
  if (careKey === "asthma") {
    return {
      diagnosisDate: form.diagnosisDate,
      asthmaSeverity: form.asthmaSeverity || null,
      asthmaControlStatus: form.asthmaControlStatus || null,
      symptoms: form.symptoms || null,
      triggers: form.triggers || null,
      allergies: form.allergies || null,
      exacerbationHistory: form.exacerbationHistory || null,
      hospitalizationHistory: form.hospitalizationHistory || null,
      managementPlan: form.managementPlan || null,
      inhalerTechniqueEducation: form.inhalerTechniqueEducation || null,
      treatmentStatus: form.treatmentStatus || null,
      lastFollowUpDate: form.lastFollowUpDate || null,
      nextFollowUpDate: form.nextFollowUpDate || null,
      active: form.active ?? true,
      notes: form.notes || null,
    };
  }
  if (careKey === "diabetes") {
    return {
      diagnosisDate: form.diagnosisDate,
      diabetesType: form.diabetesType || "Type2",
      diagnosisMethod: form.diagnosisMethod || null,
      lastFastingBloodGlucose: form.lastFastingBloodGlucose
        ? Number(form.lastFastingBloodGlucose)
        : null,
      lastRandomBloodGlucose: form.lastRandomBloodGlucose
        ? Number(form.lastRandomBloodGlucose)
        : null,
      lastHbA1c: form.lastHbA1c ? Number(form.lastHbA1c) : null,
      symptoms: form.symptoms || null,
      complications: form.complications || null,
      riskFactors: form.riskFactors || null,
      managementPlan: form.managementPlan || null,
      lifestyleAdvice: form.lifestyleAdvice || null,
      treatmentStatus: form.treatmentStatus || null,
      lastFollowUpDate: form.lastFollowUpDate || null,
      nextFollowUpDate: form.nextFollowUpDate || null,
      active: form.active ?? true,
      notes: form.notes || null,
    };
  }
  if (careKey === "hiv") {
    return {
      enrollmentDate: form.enrollmentDate || null,
      diagnosisDate: form.diagnosisDate || null,
      careStatus: form.careStatus || null,
      clinicalStage: form.clinicalStage || null,
      treatmentStatus: form.treatmentStatus || null,
      treatmentStartDate: form.treatmentStartDate || null,
      adherenceStatus: form.adherenceStatus || null,
      treatmentResponse: form.treatmentResponse || null,
      opportunisticConditions: form.opportunisticConditions || null,
      complications: form.complications || null,
      counselingProvided: form.counselingProvided || null,
      followUpPlan: form.followUpPlan || null,
      lastFollowUpDate: form.lastFollowUpDate || null,
      nextFollowUpDate: form.nextFollowUpDate || null,
      outcome: form.outcome || null,
      active: form.active ?? true,
      notes: form.notes || null,
    };
  }
  if (careKey === "hepatitis") {
    return {
      diagnosisDate: form.diagnosisDate,
      hepatitisType: form.hepatitisType || null,
      diagnosticMethod: form.diagnosticMethod || null,
      diseaseStatus: form.diseaseStatus || null,
      symptoms: form.symptoms || null,
      liverCondition: form.liverCondition || null,
      complications: form.complications || null,
      treatmentPlan: form.treatmentPlan || null,
      treatmentStatus: form.treatmentStatus || null,
      laboratoryMonitoringPlan: form.laboratoryMonitoringPlan || null,
      lastFollowUpDate: form.lastFollowUpDate || null,
      nextFollowUpDate: form.nextFollowUpDate || null,
      outcome: form.outcome || null,
      active: form.active ?? true,
      notes: form.notes || null,
    };
  }
  if (careKey === "hypertension") {
    return {
      diagnosisDate: form.diagnosisDate,
      hypertensionType: form.hypertensionType || null,
      diagnosisMethod: form.diagnosisMethod || null,
      riskFactors: form.riskFactors || null,
      targetBloodPressure: form.targetBloodPressure || null,
      complications: form.complications || null,
      cardiovascularRisk: form.cardiovascularRisk || null,
      managementPlan: form.managementPlan || null,
      lifestyleAdvice: form.lifestyleAdvice || null,
      treatmentStatus: form.treatmentStatus || null,
      lastFollowUpDate: form.lastFollowUpDate || null,
      nextFollowUpDate: form.nextFollowUpDate || null,
      active: form.active ?? true,
      notes: form.notes || null,
    };
  }
  if (careKey === "mental-health") {
    return {
      assessmentDate: form.assessmentDate || null,
      presentingConcern: form.presentingConcern || null,
      mentalHealthDiagnosis: form.mentalHealthDiagnosis || null,
      symptoms: form.symptoms || null,
      mentalStatusExamination: form.mentalStatusExamination || null,
      psychosocialFactors: form.psychosocialFactors || null,
      riskAssessment: form.riskAssessment || null,
      safetyPlan: form.safetyPlan || null,
      treatmentPlan: form.treatmentPlan || null,
      counselingProvided: form.counselingProvided || null,
      referralRequired: form.referralRequired || null,
      followUpPlan: form.followUpPlan || null,
      nextFollowUpDate: form.nextFollowUpDate || null,
      active: form.active ?? true,
      notes: form.notes || null,
    };
  }
  if (careKey === "tuberculosis") {
    return {
      diagnosisDate: form.diagnosisDate,
      tbType: form.tbType || null,
      siteOfTB: form.siteOfTB || null,
      diagnosticMethod: form.diagnosticMethod || null,
      symptoms: form.symptoms || null,
      drugResistanceStatus: form.drugResistanceStatus || null,
      treatmentStartDate: form.treatmentStartDate || null,
      expectedTreatmentEndDate: form.expectedTreatmentEndDate || null,
      actualTreatmentEndDate: form.actualTreatmentEndDate || null,
      treatmentRegimen: form.treatmentRegimen || null,
      treatmentStatus: form.treatmentStatus || null,
      adherenceStatus: form.adherenceStatus || null,
      treatmentResponse: form.treatmentResponse || null,
      complications: form.complications || null,
      contactTracingStatus: form.contactTracingStatus || null,
      lastFollowUpDate: form.lastFollowUpDate || null,
      nextFollowUpDate: form.nextFollowUpDate || null,
      outcome: form.outcome || null,
      active: form.active ?? true,
      notes: form.notes || null,
    };
  }
  return form;
}

function toDateInput(v) {
  if (!v) return "";
  try {
    return new Date(v).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export default function AdultMedicalCarePatient() {
  const { patientId, visitId } = useParams();
  const navigate = useNavigate();
  const [active, setActive] = useState("asthma");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`/api/doctor/patient/${patientId}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load adult medical care.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    load();
  }, [load]);

  const careMeta = CARE_TYPES.find((c) => c.key === active);
  const rows = data?.[careMeta?.listKey] || [];

  const openCreate = () => {
    setForm({
      diagnosisDate: new Date().toISOString().slice(0, 10),
      active: true,
      diabetesType: "Type2",
    });
    setModal({ mode: "create" });
  };

  const openEdit = (record) => {
    setForm({
      ...record,
      diagnosisDate: toDateInput(record.diagnosisDate),
      enrollmentDate: toDateInput(record.enrollmentDate),
      assessmentDate: toDateInput(record.assessmentDate),
      treatmentStartDate: toDateInput(record.treatmentStartDate),
      lastFollowUpDate: toDateInput(record.lastFollowUpDate),
      nextFollowUpDate: toDateInput(record.nextFollowUpDate),
      expectedTreatmentEndDate: toDateInput(record.expectedTreatmentEndDate),
      actualTreatmentEndDate: toDateInput(record.actualTreatmentEndDate),
    });
    setModal({ mode: "edit", record });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = buildBody(active, form);
      if (modal.mode === "create") {
        await API.post(
          `/api/doctor/patient/${patientId}/adult-medical-care/${active}`,
          body
        );
      } else {
        const id = modal.record[careMeta.idKey];
        await API.put(
          `/api/doctor/patient/${patientId}/adult-medical-care/${active}/${id}`,
          body
        );
      }
      setModal(null);
      setMessage("Saved.");
      setTimeout(() => setMessage(""), 2500);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    try {
      await API.delete(
        `/api/doctor/patient/${patientId}/adult-medical-care/${active}/${confirmDelete}`
      );
      setConfirmDelete(null);
      setMessage("Deleted.");
      setTimeout(() => setMessage(""), 2500);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    }
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-xl p-10 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => navigate("/doctor/adult/triage")}
          className="text-sm text-emerald-600"
        >
          ← Back
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error || "Patient not found."}
        </div>
      </div>
    );
  }

  const patient = data.patient || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          type="button"
          onClick={() => navigate("/doctor/adult/triage")}
          className="text-sm text-emerald-600 hover:underline"
        >
          ← Back to adult care queue
        </button>
        {message && (
          <span className="text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
            {message}
          </span>
        )}
      </div>

      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800">
          {patient.firstName} {patient.lastName}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Patient ID: {patient.patientID}
          {patient.mrn ? ` · MRN ${patient.mrn}` : ""}
          {patient.gender ? ` · ${patient.gender}` : ""}
          {visitId ? ` · Visit ${visitId}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3">
          <div className="bg-white border rounded-xl p-2 shadow-sm sticky top-20">
            {CARE_TYPES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setActive(c.key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  active === c.key
                    ? "bg-emerald-50 text-emerald-800 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {c.label}
                <span className="ml-2 text-xs text-slate-400">
                  ({(data[c.listKey] || []).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-9">
          <div className="bg-white border rounded-xl shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-semibold text-slate-800">{careMeta.label}</h3>
              <button
                type="button"
                onClick={openCreate}
                className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white"
              >
                + Add record
              </button>
            </div>
            {rows.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No records.</p>
            ) : (
              <div className="divide-y">
                {rows.map((r) => (
                  <div key={r[careMeta.idKey]} className="p-4 text-sm">
                    <div className="flex justify-between gap-2">
                      <p className="font-medium text-slate-800">
                        #{r[careMeta.idKey]}
                        {r.active === false && (
                          <span className="ml-2 text-xs text-slate-400">Inactive</span>
                        )}
                      </p>
                      <div className="space-x-2">
                        <button
                          type="button"
                          className="text-emerald-700 text-xs"
                          onClick={() => openEdit(r)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-red-600 text-xs"
                          onClick={() => setConfirmDelete(r[careMeta.idKey])}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <pre className="mt-2 text-xs text-slate-500 whitespace-pre-wrap font-sans">
                      {summarizeRecord(active, r)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {modal && (
        <Modal
          title={`${modal.mode === "create" ? "Add" : "Edit"} ${careMeta.label}`}
          onClose={() => setModal(null)}
        >
          <form onSubmit={submit} className="space-y-3">
            {active !== "mental-health" && active !== "hiv" && (
              <label className="block text-sm">
                <span className="text-slate-600 font-medium">Diagnosis date</span>
                <input
                  type="date"
                  className={inputCls + " mt-1"}
                  value={form.diagnosisDate || ""}
                  onChange={(e) => setForm({ ...form, diagnosisDate: e.target.value })}
                  required={active !== "hiv"}
                />
              </label>
            )}
            {active === "diabetes" && (
              <label className="block text-sm">
                <span className="text-slate-600 font-medium">Diabetes type</span>
                <select
                  className={inputCls + " mt-1"}
                  value={form.diabetesType || "Type2"}
                  onChange={(e) => setForm({ ...form, diabetesType: e.target.value })}
                >
                  <option value="Type1">Type1</option>
                  <option value="Type2">Type2</option>
                  <option value="Gestational">Gestational</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            )}
            {active === "asthma" && (
              <>
                <Text f={form} set={setForm} name="asthmaSeverity" label="Severity" />
                <Text f={form} set={setForm} name="asthmaControlStatus" label="Control status" />
                <Text f={form} set={setForm} name="symptoms" label="Symptoms" />
                <Text f={form} set={setForm} name="triggers" label="Triggers" />
                <Text f={form} set={setForm} name="managementPlan" label="Management plan" />
                <Text f={form} set={setForm} name="treatmentStatus" label="Treatment status" />
              </>
            )}
            {active === "diabetes" && (
              <>
                <Text f={form} set={setForm} name="lastHbA1c" label="Last HbA1c" />
                <Text
                  f={form}
                  set={setForm}
                  name="lastFastingBloodGlucose"
                  label="Last fasting glucose"
                />
                <Text f={form} set={setForm} name="symptoms" label="Symptoms" />
                <Text f={form} set={setForm} name="complications" label="Complications" />
                <Text f={form} set={setForm} name="managementPlan" label="Management plan" />
                <Text f={form} set={setForm} name="treatmentStatus" label="Treatment status" />
              </>
            )}
            {active === "hiv" && (
              <>
                <Text f={form} set={setForm} name="careStatus" label="Care status" />
                <Text f={form} set={setForm} name="clinicalStage" label="Clinical stage" />
                <Text f={form} set={setForm} name="treatmentStatus" label="Treatment status" />
                <Text f={form} set={setForm} name="adherenceStatus" label="Adherence" />
                <Text f={form} set={setForm} name="followUpPlan" label="Follow-up plan" />
              </>
            )}
            {active === "hepatitis" && (
              <>
                <Text f={form} set={setForm} name="hepatitisType" label="Hepatitis type" />
                <Text f={form} set={setForm} name="diseaseStatus" label="Disease status" />
                <Text f={form} set={setForm} name="liverCondition" label="Liver condition" />
                <Text f={form} set={setForm} name="treatmentPlan" label="Treatment plan" />
                <Text f={form} set={setForm} name="treatmentStatus" label="Treatment status" />
              </>
            )}
            {active === "hypertension" && (
              <>
                <Text f={form} set={setForm} name="hypertensionType" label="Type" />
                <Text f={form} set={setForm} name="targetBloodPressure" label="Target BP" />
                <Text f={form} set={setForm} name="riskFactors" label="Risk factors" />
                <Text f={form} set={setForm} name="managementPlan" label="Management plan" />
                <Text f={form} set={setForm} name="treatmentStatus" label="Treatment status" />
              </>
            )}
            {active === "mental-health" && (
              <>
                <Text f={form} set={setForm} name="presentingConcern" label="Presenting concern" />
                <Text
                  f={form}
                  set={setForm}
                  name="mentalHealthDiagnosis"
                  label="Diagnosis"
                />
                <Text f={form} set={setForm} name="symptoms" label="Symptoms" />
                <Text f={form} set={setForm} name="riskAssessment" label="Risk assessment" />
                <Text f={form} set={setForm} name="treatmentPlan" label="Treatment plan" />
                <Text f={form} set={setForm} name="followUpPlan" label="Follow-up plan" />
              </>
            )}
            {active === "tuberculosis" && (
              <>
                <Text f={form} set={setForm} name="tbType" label="TB type" />
                <Text f={form} set={setForm} name="siteOfTB" label="Site of TB" />
                <Text f={form} set={setForm} name="treatmentRegimen" label="Regimen" />
                <Text f={form} set={setForm} name="treatmentStatus" label="Treatment status" />
                <Text f={form} set={setForm} name="adherenceStatus" label="Adherence" />
                <Text f={form} set={setForm} name="outcome" label="Outcome" />
              </>
            )}
            <Text f={form} set={setForm} name="notes" label="Notes" area />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active !== false}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Active
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmDelete != null && (
        <Modal title="Confirm delete" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-slate-600 mb-4">Delete this record permanently?</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(null)}
              className="px-4 py-2 text-sm border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={doDelete}
              className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Text({ f, set, name, label, area }) {
  const Comp = area ? "textarea" : "input";
  return (
    <label className="block text-sm">
      <span className="text-slate-600 font-medium">{label}</span>
      <Comp
        className={inputCls + " mt-1"}
        value={f[name] ?? ""}
        onChange={(e) => set({ ...f, [name]: e.target.value })}
      />
    </label>
  );
}

function summarizeRecord(key, r) {
  const parts = [];
  if (r.diagnosisDate) parts.push(`Diagnosed: ${new Date(r.diagnosisDate).toLocaleDateString()}`);
  if (r.diabetesType) parts.push(`Type: ${r.diabetesType}`);
  if (r.asthmaSeverity) parts.push(`Severity: ${r.asthmaSeverity}`);
  if (r.hepatitisType) parts.push(`Type: ${r.hepatitisType}`);
  if (r.hypertensionType) parts.push(`Type: ${r.hypertensionType}`);
  if (r.tbType) parts.push(`TB: ${r.tbType}`);
  if (r.clinicalStage) parts.push(`Stage: ${r.clinicalStage}`);
  if (r.mentalHealthDiagnosis) parts.push(r.mentalHealthDiagnosis);
  if (r.treatmentStatus) parts.push(`Tx: ${r.treatmentStatus}`);
  if (r.symptoms) parts.push(`Symptoms: ${r.symptoms}`);
  if (r.notes) parts.push(`Notes: ${r.notes}`);
  return parts.join("\n") || "—";
}
