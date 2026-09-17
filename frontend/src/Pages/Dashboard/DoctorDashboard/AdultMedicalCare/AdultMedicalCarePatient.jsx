import { useCallback, useEffect, useState } from "react";
import ClinicalRecordAccordion from "../Components/ClinicalRecordAccordion";
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
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

function Section({ title, children }) {
  return (
    <div className="space-y-3 pt-2 border-t border-slate-100 first:border-0 first:pt-0">
      {title && (
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 pt-1">
          {title}
        </h4>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function Field({ label, required, children, className = "" }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="text-slate-600 font-medium">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Text({ f, set, name, label, area, required, className }) {
  const Comp = area ? "textarea" : "input";
  return (
    <Field label={label} required={required} className={className || (area ? "sm:col-span-2" : "")}>
      <Comp
        className={inputCls + (area ? " min-h-[72px]" : "")}
        value={f[name] ?? ""}
        onChange={(e) => set({ ...f, [name]: e.target.value })}
        required={required}
        rows={area ? 3 : undefined}
      />
    </Field>
  );
}

function DateField({ f, set, name, label, required }) {
  return (
    <Field label={label} required={required}>
      <input
        type="date"
        className={inputCls}
        value={f[name] || ""}
        onChange={(e) => set({ ...f, [name]: e.target.value })}
        required={required}
      />
    </Field>
  );
}

function NumberField({ f, set, name, label, step = "any", required }) {
  return (
    <Field label={label} required={required}>
      <input
        type="number"
        step={step}
        className={inputCls}
        value={f[name] ?? ""}
        onChange={(e) => set({ ...f, [name]: e.target.value })}
        required={required}
      />
    </Field>
  );
}

function SelectField({ f, set, name, label, options, required }) {
  return (
    <Field label={label} required={required}>
      <select
        className={inputCls}
        value={f[name] ?? ""}
        onChange={(e) => set({ ...f, [name]: e.target.value })}
        required={required}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
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
  return {};
}

function toDateInput(value) {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function defaultCreateForm(careKey) {
  const today = new Date().toISOString().slice(0, 10);
  const base = { active: true };
  if (careKey === "hiv") {
    return { ...base, enrollmentDate: today };
  }
  if (careKey === "mental-health") {
    return { ...base, assessmentDate: today };
  }
  if (careKey === "diabetes") {
    return { ...base, diagnosisDate: today, diabetesType: "Type2" };
  }
  return { ...base, diagnosisDate: today };
}

export default function AdultMedicalCarePatient() {
  const { patientId, visitId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState("asthma");
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
  const patient = data?.patient || {};

  const openCreate = () => {
    setForm(defaultCreateForm(active));
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
      <div className="p-6 text-slate-500 text-sm">Loading adult medical care…</div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 space-y-3">
        <p className="text-red-600 text-sm">{error || "Unable to load patient."}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-emerald-700 underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          <i className="bi bi-arrow-left mr-1" />
          Back
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

        <div className="lg:col-span-9 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Showing complete clinical data for {careMeta.label}
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white"
            >
              + Add record
            </button>
          </div>
          <ClinicalRecordAccordion
            title={careMeta.label}
            records={rows}
            idKey={careMeta.idKey}
            onEdit={openEdit}
            onDelete={(id) => setConfirmDelete(id)}
            excludeKeys={["patientID", "recordedByUserID", "managedByUserID", "assessedByUserID"]}
          />
        </div>
      </div>

      {modal && (
        <Modal
          title={`${modal.mode === "create" ? "Add" : "Edit"} ${careMeta.label}`}
          onClose={() => setModal(null)}
        >
          <form onSubmit={submit} className="space-y-4">
            {/* —— ASTHMA —— */}
            {active === "asthma" && (
              <>
                <Section title="Diagnosis">
                  <DateField f={form} set={setForm} name="diagnosisDate" label="Diagnosis date" required />
                  <Text f={form} set={setForm} name="asthmaSeverity" label="Asthma severity" />
                  <Text f={form} set={setForm} name="asthmaControlStatus" label="Control status" />
                  <Text f={form} set={setForm} name="treatmentStatus" label="Treatment status" />
                </Section>
                <Section title="Clinical details">
                  <Text f={form} set={setForm} name="symptoms" label="Symptoms" area />
                  <Text f={form} set={setForm} name="triggers" label="Triggers" area />
                  <Text f={form} set={setForm} name="allergies" label="Allergies" area />
                  <Text f={form} set={setForm} name="exacerbationHistory" label="Exacerbation history" area />
                  <Text f={form} set={setForm} name="hospitalizationHistory" label="Hospitalization history" area />
                </Section>
                <Section title="Management">
                  <Text f={form} set={setForm} name="managementPlan" label="Management plan" area />
                  <Text f={form} set={setForm} name="inhalerTechniqueEducation" label="Inhaler technique education" area />
                </Section>
                <Section title="Follow-up">
                  <DateField f={form} set={setForm} name="lastFollowUpDate" label="Last follow-up date" />
                  <DateField f={form} set={setForm} name="nextFollowUpDate" label="Next follow-up date" />
                </Section>
              </>
            )}

            {/* —— DIABETES —— */}
            {active === "diabetes" && (
              <>
                <Section title="Diagnosis">
                  <DateField f={form} set={setForm} name="diagnosisDate" label="Diagnosis date" required />
                  <SelectField
                    f={form}
                    set={setForm}
                    name="diabetesType"
                    label="Diabetes type"
                    required
                    options={[
                      { value: "Type1", label: "Type 1" },
                      { value: "Type2", label: "Type 2" },
                      { value: "Gestational", label: "Gestational" },
                      { value: "Other", label: "Other" },
                    ]}
                  />
                  <Text f={form} set={setForm} name="diagnosisMethod" label="Diagnosis method" />
                  <Text f={form} set={setForm} name="treatmentStatus" label="Treatment status" />
                </Section>
                <Section title="Measurements">
                  <NumberField f={form} set={setForm} name="lastFastingBloodGlucose" label="Last fasting blood glucose" step="0.01" />
                  <NumberField f={form} set={setForm} name="lastRandomBloodGlucose" label="Last random blood glucose" step="0.01" />
                  <NumberField f={form} set={setForm} name="lastHbA1c" label="Last HbA1c" step="0.01" />
                </Section>
                <Section title="Clinical details">
                  <Text f={form} set={setForm} name="symptoms" label="Symptoms" area />
                  <Text f={form} set={setForm} name="complications" label="Complications" area />
                  <Text f={form} set={setForm} name="riskFactors" label="Risk factors" area />
                </Section>
                <Section title="Management">
                  <Text f={form} set={setForm} name="managementPlan" label="Management plan" area />
                  <Text f={form} set={setForm} name="lifestyleAdvice" label="Lifestyle advice" area />
                </Section>
                <Section title="Follow-up">
                  <DateField f={form} set={setForm} name="lastFollowUpDate" label="Last follow-up date" />
                  <DateField f={form} set={setForm} name="nextFollowUpDate" label="Next follow-up date" />
                </Section>
              </>
            )}

            {/* —— HIV —— */}
            {active === "hiv" && (
              <>
                <Section title="Enrollment & diagnosis">
                  <DateField f={form} set={setForm} name="enrollmentDate" label="Enrollment date" />
                  <DateField f={form} set={setForm} name="diagnosisDate" label="Diagnosis date" />
                  <Text f={form} set={setForm} name="careStatus" label="Care status" />
                  <Text f={form} set={setForm} name="clinicalStage" label="Clinical stage" />
                </Section>
                <Section title="Treatment">
                  <Text f={form} set={setForm} name="treatmentStatus" label="Treatment status" />
                  <DateField f={form} set={setForm} name="treatmentStartDate" label="Treatment start date" />
                  <Text f={form} set={setForm} name="adherenceStatus" label="Adherence status" />
                  <Text f={form} set={setForm} name="treatmentResponse" label="Treatment response" />
                </Section>
                <Section title="Clinical details">
                  <Text f={form} set={setForm} name="opportunisticConditions" label="Opportunistic conditions" area />
                  <Text f={form} set={setForm} name="complications" label="Complications" area />
                  <Text f={form} set={setForm} name="counselingProvided" label="Counseling provided" area />
                  <Text f={form} set={setForm} name="followUpPlan" label="Follow-up plan" area />
                </Section>
                <Section title="Follow-up & outcome">
                  <DateField f={form} set={setForm} name="lastFollowUpDate" label="Last follow-up date" />
                  <DateField f={form} set={setForm} name="nextFollowUpDate" label="Next follow-up date" />
                  <Text f={form} set={setForm} name="outcome" label="Outcome" />
                </Section>
              </>
            )}

            {/* —— HEPATITIS —— */}
            {active === "hepatitis" && (
              <>
                <Section title="Diagnosis">
                  <DateField f={form} set={setForm} name="diagnosisDate" label="Diagnosis date" required />
                  <Text f={form} set={setForm} name="hepatitisType" label="Hepatitis type" />
                  <Text f={form} set={setForm} name="diagnosticMethod" label="Diagnostic method" />
                  <Text f={form} set={setForm} name="diseaseStatus" label="Disease status" />
                </Section>
                <Section title="Clinical details">
                  <Text f={form} set={setForm} name="symptoms" label="Symptoms" area />
                  <Text f={form} set={setForm} name="liverCondition" label="Liver condition" area />
                  <Text f={form} set={setForm} name="complications" label="Complications" area />
                </Section>
                <Section title="Treatment & monitoring">
                  <Text f={form} set={setForm} name="treatmentPlan" label="Treatment plan" area />
                  <Text f={form} set={setForm} name="treatmentStatus" label="Treatment status" />
                  <Text f={form} set={setForm} name="laboratoryMonitoringPlan" label="Laboratory monitoring plan" area />
                </Section>
                <Section title="Follow-up & outcome">
                  <DateField f={form} set={setForm} name="lastFollowUpDate" label="Last follow-up date" />
                  <DateField f={form} set={setForm} name="nextFollowUpDate" label="Next follow-up date" />
                  <Text f={form} set={setForm} name="outcome" label="Outcome" />
                </Section>
              </>
            )}

            {/* —— HYPERTENSION —— */}
            {active === "hypertension" && (
              <>
                <Section title="Diagnosis">
                  <DateField f={form} set={setForm} name="diagnosisDate" label="Diagnosis date" required />
                  <Text f={form} set={setForm} name="hypertensionType" label="Hypertension type" />
                  <Text f={form} set={setForm} name="diagnosisMethod" label="Diagnosis method" />
                  <Text f={form} set={setForm} name="targetBloodPressure" label="Target blood pressure" />
                </Section>
                <Section title="Risk & complications">
                  <Text f={form} set={setForm} name="riskFactors" label="Risk factors" area />
                  <Text f={form} set={setForm} name="complications" label="Complications" area />
                  <Text f={form} set={setForm} name="cardiovascularRisk" label="Cardiovascular risk" />
                </Section>
                <Section title="Management">
                  <Text f={form} set={setForm} name="managementPlan" label="Management plan" area />
                  <Text f={form} set={setForm} name="lifestyleAdvice" label="Lifestyle advice" area />
                  <Text f={form} set={setForm} name="treatmentStatus" label="Treatment status" />
                </Section>
                <Section title="Follow-up">
                  <DateField f={form} set={setForm} name="lastFollowUpDate" label="Last follow-up date" />
                  <DateField f={form} set={setForm} name="nextFollowUpDate" label="Next follow-up date" />
                </Section>
              </>
            )}

            {/* —— MENTAL HEALTH —— */}
            {active === "mental-health" && (
              <>
                <Section title="Assessment">
                  <DateField f={form} set={setForm} name="assessmentDate" label="Assessment date" />
                  <Text f={form} set={setForm} name="presentingConcern" label="Presenting concern" area />
                  <Text f={form} set={setForm} name="mentalHealthDiagnosis" label="Mental health diagnosis" />
                  <Text f={form} set={setForm} name="symptoms" label="Symptoms" area />
                </Section>
                <Section title="Examination & risk">
                  <Text f={form} set={setForm} name="mentalStatusExamination" label="Mental status examination" area />
                  <Text f={form} set={setForm} name="psychosocialFactors" label="Psychosocial factors" area />
                  <Text f={form} set={setForm} name="riskAssessment" label="Risk assessment" area />
                  <Text f={form} set={setForm} name="safetyPlan" label="Safety plan" area />
                </Section>
                <Section title="Treatment & follow-up">
                  <Text f={form} set={setForm} name="treatmentPlan" label="Treatment plan" area />
                  <Text f={form} set={setForm} name="counselingProvided" label="Counseling provided" area />
                  <Text f={form} set={setForm} name="referralRequired" label="Referral required" />
                  <Text f={form} set={setForm} name="followUpPlan" label="Follow-up plan" area />
                  <DateField f={form} set={setForm} name="nextFollowUpDate" label="Next follow-up date" />
                </Section>
              </>
            )}

            {/* —— TUBERCULOSIS —— */}
            {active === "tuberculosis" && (
              <>
                <Section title="Diagnosis">
                  <DateField f={form} set={setForm} name="diagnosisDate" label="Diagnosis date" required />
                  <Text f={form} set={setForm} name="tbType" label="TB type" />
                  <Text f={form} set={setForm} name="siteOfTB" label="Site of TB" />
                  <Text f={form} set={setForm} name="diagnosticMethod" label="Diagnostic method" />
                  <Text f={form} set={setForm} name="drugResistanceStatus" label="Drug resistance status" />
                </Section>
                <Section title="Clinical details">
                  <Text f={form} set={setForm} name="symptoms" label="Symptoms" area />
                  <Text f={form} set={setForm} name="complications" label="Complications" area />
                  <Text f={form} set={setForm} name="contactTracingStatus" label="Contact tracing status" />
                </Section>
                <Section title="Treatment">
                  <DateField f={form} set={setForm} name="treatmentStartDate" label="Treatment start date" />
                  <DateField f={form} set={setForm} name="expectedTreatmentEndDate" label="Expected treatment end date" />
                  <DateField f={form} set={setForm} name="actualTreatmentEndDate" label="Actual treatment end date" />
                  <Text f={form} set={setForm} name="treatmentRegimen" label="Treatment regimen" area />
                  <Text f={form} set={setForm} name="treatmentStatus" label="Treatment status" />
                  <Text f={form} set={setForm} name="adherenceStatus" label="Adherence status" />
                  <Text f={form} set={setForm} name="treatmentResponse" label="Treatment response" />
                </Section>
                <Section title="Follow-up & outcome">
                  <DateField f={form} set={setForm} name="lastFollowUpDate" label="Last follow-up date" />
                  <DateField f={form} set={setForm} name="nextFollowUpDate" label="Next follow-up date" />
                  <Text f={form} set={setForm} name="outcome" label="Outcome" />
                </Section>
              </>
            )}

            <Section title="Notes & status">
              <Text f={form} set={setForm} name="notes" label="Notes" area />
              <label className="flex items-center gap-2 text-sm sm:col-span-2 pt-1">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  checked={form.active !== false}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                <span className="text-slate-600 font-medium">Active</span>
              </label>
            </Section>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50"
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