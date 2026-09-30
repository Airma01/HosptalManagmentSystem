
using System.Text;
using HospitalSys.Data;
using HospitalSys.Models.AI;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Services.AI
{
    /// <summary>
    /// Assembles authorized clinical context from existing AppDbContext entities.
    /// Does not invent data. Does not change schema. Reuses visit/department access rules.
    /// </summary>
    public class ClinicalContextService : IClinicalContextService
    {
        private readonly AppDbContext _db;
        private readonly ILogger<ClinicalContextService> _logger;

        public ClinicalContextService(AppDbContext db, ILogger<ClinicalContextService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<AIClinicalContext?> BuildContextAsync(
            int doctorId, int departmentId, int patientId, int visitId, string module, CancellationToken ct = default)
        {
            var access = await ValidateAccessAsync(patientId, visitId, departmentId, ct);
            if (access == null) return null;
            if (access.Value.Forbidden)
                throw new UnauthorizedAccessException("Doctor is not authorized to access this patient/visit.");

            var patient = access.Value.Visit!.Patient!;
            var sb = new StringBuilder();
            AppendPatientHeader(sb, patient, access.Value.Visit);
            await AppendCoreClinicalAsync(sb, patientId, visitId, ct);

            var normalized = NormalizeModule(module);
            switch (normalized)
            {
                case "AdultMedicalCare":
                    await AppendAdultMedicalCareAsync(sb, patientId, ct);
                    break;
                case "MaternalHealth":
                    await AppendMaternalHealthAsync(sb, patientId, ct);
                    break;
                case "ChildHealth":
                    await AppendChildHealthAsync(sb, patientId, ct);
                    break;
                default:
                    await AppendConsultationDetailsAsync(sb, visitId, ct);
                    break;
            }

            return new AIClinicalContext
            {
                PatientId = patientId,
                VisitId = visitId,
                Module = normalized,
                PatientLabel = BuildPatientLabel(patient),
                ContextText = sb.ToString()
            };
        }

        public async Task<AIClinicalContext?> BuildLabContextAsync(
            int doctorId, int departmentId, int patientId, int visitId,
            IEnumerable<int>? laboratoryResultIds, CancellationToken ct = default)
        {
            var access = await ValidateAccessAsync(patientId, visitId, departmentId, ct);
            if (access == null) return null;
            if (access.Value.Forbidden)
                throw new UnauthorizedAccessException("Doctor is not authorized to access this patient/visit.");

            var patient = access.Value.Visit!.Patient!;
            var sb = new StringBuilder();
            AppendPatientHeader(sb, patient, access.Value.Visit);

            var resultIds = laboratoryResultIds?.ToList();
            var query = _db.LaboratoryResults.AsNoTracking()
                .Include(r => r.LaboratoryTest)!.ThenInclude(t => t!.LaboratoryTestType)
                .Where(r => r.LaboratoryTest != null && r.LaboratoryTest.PatientID == patientId);

            if (resultIds != null && resultIds.Count > 0)
                query = query.Where(r => resultIds.Contains(r.ResultID));
            else
                query = query.OrderByDescending(r => r.ResultDate).Take(30);

            var results = await query.ToListAsync(ct);
            sb.AppendLine("LABORATORY RESULTS:");
            if (results.Count == 0)
                sb.AppendLine("  (No laboratory results available in authorized scope.)");
            else
            {
                foreach (var r in results)
                {
                    var testName = r.LaboratoryTest?.LaboratoryTestType?.TestName ?? $"TestID {r.TestID}";
                    var normal = r.LaboratoryTest?.LaboratoryTestType?.NormalRange;
                    sb.AppendLine($"  - ResultID {r.ResultID}: {testName}");
                    sb.AppendLine($"    Date: {r.ResultDate:yyyy-MM-dd HH:mm}");
                    sb.AppendLine($"    Result: {r.ResultDescription}");
                    if (normal.HasValue) sb.AppendLine($"    Type NormalRange field: {normal}");
                    if (!string.IsNullOrWhiteSpace(r.TechnicianName)) sb.AppendLine($"    Technician: {r.TechnicianName}");
                }
            }

            var allergies = await _db.Allergies.AsNoTracking().Where(a => a.PatientID == patientId).Take(20).ToListAsync(ct);
            if (allergies.Count > 0)
            {
                sb.AppendLine("ALLERGIES:");
                foreach (var a in allergies)
                    sb.AppendLine($"  - {a.Allergen}: {a.Reaction} ({a.Severity}) Active={a.IsActive}");
            }

            return new AIClinicalContext
            {
                PatientId = patientId,
                VisitId = visitId,
                Module = "Laboratory",
                PatientLabel = BuildPatientLabel(patient),
                ContextText = sb.ToString()
            };
        }

        private async Task<(Models.PatientManagment.PatientVisit? Visit, bool Forbidden)?> ValidateAccessAsync(
            int patientId, int visitId, int departmentId, CancellationToken ct)
        {
            var visit = await _db.PatientVisits.AsNoTracking()
                .Include(v => v.Patient)
                .Include(v => v.Triage)
                .FirstOrDefaultAsync(v => v.VisitID == visitId && v.PatientID == patientId, ct);

            if (visit == null) return null;

            bool inDepartment = visit.Triage != null &&
                                visit.Triage.Any(t => t.ClinicalDepartmentID == departmentId);

            if (!inDepartment)
            {
                inDepartment = await _db.Triages.AsNoTracking()
                    .AnyAsync(t => t.PatientVisit != null &&
                                   t.PatientVisit.PatientID == patientId &&
                                   t.ClinicalDepartmentID == departmentId, ct);
            }

            return (visit, !inDepartment);
        }

        private static string NormalizeModule(string module)
        {
            if (string.IsNullOrWhiteSpace(module)) return "Consultation";
            var m = module.Trim();
            if (m.Equals("AdultMedicalCare", StringComparison.OrdinalIgnoreCase) || m.Equals("Adult", StringComparison.OrdinalIgnoreCase))
                return "AdultMedicalCare";
            if (m.Equals("MaternalHealth", StringComparison.OrdinalIgnoreCase) || m.Equals("Maternal", StringComparison.OrdinalIgnoreCase) ||
                m.Equals("MaternalChildHealth", StringComparison.OrdinalIgnoreCase))
                return "MaternalHealth";
            if (m.Equals("ChildHealth", StringComparison.OrdinalIgnoreCase) || m.Equals("Child", StringComparison.OrdinalIgnoreCase))
                return "ChildHealth";
            return "Consultation";
        }

        private static string BuildPatientLabel(Models.PatientManagment.Patient p)
        {
            var age = p.DateOfBirth == default ? "?" :
                ((int)((DateTime.UtcNow - p.DateOfBirth).TotalDays / 365.25)).ToString();
            var name = $"{p.FirstName} {p.LastName}".Trim();
            if (string.IsNullOrWhiteSpace(name)) name = "Name not recorded";
            return $"{name}, MRN {p.MRN}, {p.Gender}, Age ~{age}y";
        }

        private static void AppendPatientHeader(StringBuilder sb, Models.PatientManagment.Patient p, Models.PatientManagment.PatientVisit visit)
        {
            var name = $"{p.FirstName} {p.LastName}".Trim();
            if (string.IsNullOrWhiteSpace(name)) name = "(name not recorded)";
            sb.AppendLine($"PATIENT NAME: {name}");
            sb.AppendLine($"PATIENT: MRN={p.MRN}, Gender={p.Gender}, DOB={p.DateOfBirth:yyyy-MM-dd}");
            sb.AppendLine($"VISIT: VisitID={visit.VisitID}, Date={visit.VisitDate:yyyy-MM-dd}, Type={visit.VisitType}, Status={visit.Status}");
            sb.AppendLine();
        }

        private async Task AppendTriageVitalsAsync(StringBuilder sb, int visitId, CancellationToken ct)
        {
            var triages = await _db.Triages.AsNoTracking()
                .Where(t => t.VisitID == visitId)
                .OrderByDescending(t => t.TriageId)
                .Take(5)
                .ToListAsync(ct);

            sb.AppendLine("TRIAGE VITAL SIGNS:");
            if (triages.Count == 0)
            {
                sb.AppendLine("  (no triage vitals recorded for this visit)");
            }
            else
            {
                foreach (var t in triages)
                {
                    sb.AppendLine($"  - TriageID={t.TriageId}:");
                    sb.AppendLine($"    Temperature={t.Temprature}");
                    sb.AppendLine($"    BloodPressure={t.BloodPressure}");
                    sb.AppendLine($"    HeartRate={t.HeartRate}");
                    sb.AppendLine($"    RespiratoryRate={t.RespiratotyRate}");
                    sb.AppendLine($"    Weight={t.Weight}");
                    if (!string.IsNullOrWhiteSpace(t.Notes))
                        sb.AppendLine($"    Notes={t.Notes}");
                }
            }
            sb.AppendLine();
        }

        private async Task AppendCoreClinicalAsync(StringBuilder sb, int patientId, int visitId, CancellationToken ct)
        {
            await AppendTriageVitalsAsync(sb, visitId, ct);

            var allergies = await _db.Allergies.AsNoTracking().Where(a => a.PatientID == patientId).Take(30).ToListAsync(ct);
            sb.AppendLine("ALLERGIES:");
            if (allergies.Count == 0) sb.AppendLine("  (none recorded)");
            else foreach (var a in allergies)
                sb.AppendLine($"  - {a.Allergen}: {a.Reaction} / Severity: {a.Severity} / Active={a.IsActive}");

            var histories = await _db.MedicalHistories.AsNoTracking()
                .Where(h => h.PatientID == patientId).Take(20).ToListAsync(ct);
            sb.AppendLine("MEDICAL HISTORY:");
            if (histories.Count == 0) sb.AppendLine("  (none recorded)");
            else foreach (var h in histories)
                sb.AppendLine($"  - {h.ConditionName}: Status={h.Status}, Treatment={h.Treatment}, Notes={h.Notes}, Diagnosed={h.DiagnosedDate:yyyy-MM-dd}");

            var family = await _db.FamilyMedicalHistories.AsNoTracking().Where(f => f.PatientID == patientId).Take(15).ToListAsync(ct);
            if (family.Count > 0)
            {
                sb.AppendLine("FAMILY MEDICAL HISTORY:");
                foreach (var f in family)
                    sb.AppendLine($"  - Relation/Condition recorded (FamilyMedicalHistoryID={f.FamilyMedicalHistoryID}) Notes={f.Notes}");
            }

            var social = await _db.SocialHistories.AsNoTracking().Where(s => s.PatientID == patientId).Take(5).ToListAsync(ct);
            if (social.Count > 0)
            {
                sb.AppendLine("SOCIAL HISTORY:");
                foreach (var s in social)
                    sb.AppendLine($"  - Smoking={s.SmokingStatus}, Alcohol={s.AlcoholUse}, Occupation={s.Occupation}, Notes={s.Notes}");
            }

            var problems = await _db.ProblemLists.AsNoTracking().Where(p => p.PatientID == patientId).Take(20).ToListAsync(ct);
            sb.AppendLine("PROBLEM LIST:");
            if (problems.Count == 0) sb.AppendLine("  (none recorded)");
            else foreach (var p in problems)
                sb.AppendLine($"  - {p.ProblemName} ({p.Code}): Status={p.Status} Notes={p.Notes}");

            var diagnoses = await _db.Diagnoses.AsNoTracking()
                .Include(d => d.Consultation)
                .Where(d => d.Consultation != null && d.Consultation.VisitID == visitId)
                .Take(20).ToListAsync(ct);
            if (diagnoses.Count == 0)
            {
                diagnoses = await _db.Diagnoses.AsNoTracking()
                    .Include(d => d.Consultation)!.ThenInclude(c => c!.PatientVisit)
                    .Where(d => d.Consultation != null && d.Consultation.PatientVisit != null &&
                                d.Consultation.PatientVisit.PatientID == patientId)
                    .Take(15).ToListAsync(ct);
            }
            sb.AppendLine("DIAGNOSES:");
            if (diagnoses.Count == 0) sb.AppendLine("  (none recorded)");
            else foreach (var d in diagnoses)
                sb.AppendLine($"  - {d.Code} {d.Description} ({d.CodingSystem}) Primary={d.IsPrimary} Type={d.DiagnosisType}");

            var rx = await _db.Prescriptions.AsNoTracking()
                .Include(p => p.PrescriptionDetail)
                .Where(p => p.PatientID == patientId)
                .OrderByDescending(p => p.PrescriptionDate)
                .Take(10).ToListAsync(ct);
            sb.AppendLine("RECENT PRESCRIPTIONS:");
            if (rx.Count == 0) sb.AppendLine("  (none recorded)");
            else foreach (var p in rx)
            {
                sb.AppendLine($"  - Rx {p.PrescriptionID} on {p.PrescriptionDate:yyyy-MM-dd}");
                if (p.PrescriptionDetail != null)
                    foreach (var det in p.PrescriptionDetail.Take(10))
                        sb.AppendLine($"      • DetailID={det.PrescriptionDetailID}, MedicineID={det.MedicineID}");
            }

            var labs = await _db.LaboratoryResults.AsNoTracking()
                .Include(r => r.LaboratoryTest)!.ThenInclude(t => t!.LaboratoryTestType)
                .Where(r => r.LaboratoryTest != null && r.LaboratoryTest.PatientID == patientId)
                .OrderByDescending(r => r.ResultDate)
                .Take(15).ToListAsync(ct);
            sb.AppendLine("RECENT LAB RESULTS:");
            if (labs.Count == 0) sb.AppendLine("  (none recorded)");
            else foreach (var r in labs)
            {
                var name = r.LaboratoryTest?.LaboratoryTestType?.TestName ?? $"Test {r.TestID}";
                sb.AppendLine($"  - {name} ({r.ResultDate:yyyy-MM-dd}): {r.ResultDescription}");
            }
            sb.AppendLine();
        }

        private async Task AppendConsultationDetailsAsync(StringBuilder sb, int visitId, CancellationToken ct)
        {
            var consultations = await _db.Consultations.AsNoTracking()
                .Where(c => c.VisitID == visitId)
                .OrderByDescending(c => c.ConsultationDate)
                .Take(5).ToListAsync(ct);

            sb.AppendLine("CONSULTATION RECORDS:");
            if (consultations.Count == 0)
            {
                sb.AppendLine("  (no consultation for this visit yet)");
                return;
            }

            foreach (var c in consultations)
            {
                sb.AppendLine($"  ConsultationID={c.ConsultationID}, Date={c.ConsultationDate:yyyy-MM-dd}, DoctorID={c.DoctorID}");
                sb.AppendLine($"    ChiefComplaint: {c.ChiefComplaint}");
                sb.AppendLine($"    HPI: {c.HistoryOfPresentIllness}");
                if (!string.IsNullOrWhiteSpace(c.Assessment)) sb.AppendLine($"    Assessment: {c.Assessment}");
                if (!string.IsNullOrWhiteSpace(c.TreatmentPlan)) sb.AppendLine($"    TreatmentPlan: {c.TreatmentPlan}");
            }

            var exam = await _db.PhysicalExaminations.AsNoTracking()
                .Include(e => e.Consultation)
                .Where(e => e.Consultation != null && e.Consultation.VisitID == visitId)
                .Take(5).ToListAsync(ct);
            if (exam.Count > 0)
            {
                sb.AppendLine("PHYSICAL EXAMINATION:");
                foreach (var e in exam)
                    sb.AppendLine($"  - Exam record linked to ConsultationID={e.ConsultationID}");
            }
        }

        private async Task AppendAdultMedicalCareAsync(StringBuilder sb, int patientId, CancellationToken ct)
        {
            sb.AppendLine("ADULT MEDICAL CARE MODULE:");

            var asthma = await _db.AsthmaManagements.AsNoTracking().Where(x => x.PatientID == patientId).Take(10).ToListAsync(ct);
            sb.AppendLine("Asthma:");
            if (asthma.Count == 0) sb.AppendLine("  (none)");
            else foreach (var x in asthma)
                sb.AppendLine($"  - {x.DiagnosisDate:yyyy-MM-dd}: Severity={x.AsthmaSeverity}, Control={x.AsthmaControlStatus}, Status={x.TreatmentStatus}, Notes={x.Notes}");

            var dm = await _db.DiabetesManagements.AsNoTracking().Where(x => x.PatientID == patientId).Take(10).ToListAsync(ct);
            sb.AppendLine("Diabetes:");
            if (dm.Count == 0) sb.AppendLine("  (none)");
            else foreach (var x in dm)
                sb.AppendLine($"  - {x.DiagnosisDate:yyyy-MM-dd}: HbA1c={x.LastHbA1c}, FBG={x.LastFastingBloodGlucose}, Status={x.TreatmentStatus}, Notes={x.Notes}");

            var ht = await _db.HypertensionManagements.AsNoTracking().Where(x => x.PatientID == patientId).Take(10).ToListAsync(ct);
            sb.AppendLine("Hypertension:");
            if (ht.Count == 0) sb.AppendLine("  (none)");
            else foreach (var x in ht)
                sb.AppendLine($"  - {x.DiagnosisDate:yyyy-MM-dd}: Type={x.HypertensionType}, TargetBP={x.TargetBloodPressure}, Status={x.TreatmentStatus}, Notes={x.Notes}");

            var hiv = await _db.HIVCares.AsNoTracking().Where(x => x.PatientID == patientId).Take(10).ToListAsync(ct);
            sb.AppendLine("HIV Care:");
            if (hiv.Count == 0) sb.AppendLine("  (none)");
            else foreach (var x in hiv)
                sb.AppendLine($"  - Enrolled={x.EnrollmentDate:yyyy-MM-dd}: CareStatus={x.CareStatus}, Stage={x.ClinicalStage}, Treatment={x.TreatmentStatus}");

            var hep = await _db.HepatitisManagements.AsNoTracking().Where(x => x.PatientID == patientId).Take(10).ToListAsync(ct);
            sb.AppendLine("Hepatitis:");
            if (hep.Count == 0) sb.AppendLine("  (none)");
            else foreach (var x in hep)
                sb.AppendLine($"  - Record HepatitisManagementID={x.HepatitisManagementID}, PatientID={x.PatientID}");

            var tb = await _db.TuberculosisManagements.AsNoTracking().Where(x => x.PatientID == patientId).Take(10).ToListAsync(ct);
            sb.AppendLine("Tuberculosis:");
            if (tb.Count == 0) sb.AppendLine("  (none)");
            else foreach (var x in tb)
                sb.AppendLine($"  - Record TuberculosisManagementID={x.TuberculosisManagementID}, PatientID={x.PatientID}");

            var mh = await _db.MentalHealthCares.AsNoTracking().Where(x => x.PatientID == patientId).Take(10).ToListAsync(ct);
            sb.AppendLine("Mental Health:");
            if (mh.Count == 0) sb.AppendLine("  (none)");
            else foreach (var x in mh)
                sb.AppendLine($"  - Record MentalHealthCareID={x.MentalHealthCareID}, PatientID={x.PatientID}");
        }

        private async Task AppendMaternalHealthAsync(StringBuilder sb, int patientId, CancellationToken ct)
        {
            sb.AppendLine("MATERNAL HEALTH MODULE:");

            // Linked via PregnancyID (not PatientID) for risk, high-risk, delivery, labor, etc.
            var pregnancyIds = await _db.Pregnancies.AsNoTracking()
                .Where(p => p.PatientID == patientId)
                .Select(p => p.PregnancyID)
                .ToListAsync(ct);

            var pregnancies = await _db.Pregnancies.AsNoTracking()
                .Where(p => p.PatientID == patientId)
                .OrderByDescending(p => p.RegistrationDate)
                .Take(5).ToListAsync(ct);
            sb.AppendLine("PREGNANCIES:");
            if (pregnancies.Count == 0) sb.AppendLine("  (none)");
            else foreach (var p in pregnancies)
                sb.AppendLine($"  - PregnancyID={p.PregnancyID}, LMP={p.LastMenstrualPeriod:yyyy-MM-dd}, EDD={p.ExpectedDeliveryDate:yyyy-MM-dd}, G{p.Gravida}P{p.Para}, Status={p.Status}");

            var anc = await _db.ANCVisits.AsNoTracking()
                .Include(a => a.PatientVisit)
                .Where(a => a.PatientVisit != null && a.PatientVisit.PatientID == patientId)
                .OrderByDescending(a => a.VisitDate)
                .Take(10).ToListAsync(ct);
            sb.AppendLine("ANC VISITS:");
            if (anc.Count == 0) sb.AppendLine("  (none)");
            else foreach (var a in anc)
                sb.AppendLine($"  - {a.VisitDate:yyyy-MM-dd}: GA weeks={a.GestationalAgeWeeks}, Complaint={a.ChiefComplaint}, Maternal={a.MaternalCondition}, Fetal={a.FetalCondition}, Notes={a.Notes}");

            if (pregnancyIds.Count > 0)
            {
                var risk = await _db.PregnancyRiskAssessments.AsNoTracking()
                    .Where(r => pregnancyIds.Contains(r.PregnancyID))
                    .OrderByDescending(r => r.AssessmentDate)
                    .Take(10).ToListAsync(ct);
                if (risk.Count > 0)
                {
                    sb.AppendLine("RISK ASSESSMENTS:");
                    foreach (var r in risk)
                        sb.AppendLine($"  - {r.AssessmentDate:yyyy-MM-dd}: HighRisk={r.IsHighRisk}, Category={r.RiskCategory}, Factor={r.RiskFactor}, Action={r.ActionTaken}, Notes={r.Notes}");
                }

                var highRisk = await _db.HighRiskPregnancies.AsNoTracking()
                    .Where(h => pregnancyIds.Contains(h.PregnancyID))
                    .Take(5).ToListAsync(ct);
                if (highRisk.Count > 0)
                {
                    sb.AppendLine("HIGH-RISK PREGNANCY:");
                    foreach (var h in highRisk)
                        sb.AppendLine($"  - {h.IdentificationDate:yyyy-MM-dd}: Level={h.RiskLevel}, Reason={h.RiskReason}, Plan={h.ManagementPlan}, Active={h.Active}");
                }

                var labor = await _db.LaborRecords.AsNoTracking()
                    .Where(l => pregnancyIds.Contains(l.PregnancyID))
                    .OrderByDescending(l => l.AdmissionDate)
                    .Take(3).ToListAsync(ct);
                if (labor.Count > 0)
                {
                    sb.AppendLine("LABOR RECORDS:");
                    foreach (var l in labor)
                        sb.AppendLine($"  - Admission={l.AdmissionDate:yyyy-MM-dd}: Progress={l.LaborProgress}, Management={l.LaborManagement}, Notes={l.Notes}");
                }

                var deliveries = await _db.Deliveries.AsNoTracking()
                    .Where(d => pregnancyIds.Contains(d.PregnancyID))
                    .OrderByDescending(d => d.DeliveryDate)
                    .Take(3).ToListAsync(ct);
                if (deliveries.Count > 0)
                {
                    sb.AppendLine("DELIVERIES:");
                    foreach (var d in deliveries)
                        sb.AppendLine($"  - {d.DeliveryDate:yyyy-MM-dd}: Mode={d.DeliveryMode}, Location={d.DeliveryLocation}, Maternal={d.MaternalCondition}, Notes={d.DeliveryNotes}");
                }
            }

            var pnc = await _db.PNCVisits.AsNoTracking()
                .Include(p => p.PatientVisit)
                .Where(p => p.PatientVisit != null && p.PatientVisit.PatientID == patientId)
                .OrderByDescending(p => p.VisitDate)
                .Take(5).ToListAsync(ct);
            if (pnc.Count > 0)
            {
                sb.AppendLine("PNC VISITS:");
                foreach (var p in pnc)
                    sb.AppendLine($"  - {p.VisitDate:yyyy-MM-dd}: DaysAfterDelivery={p.DaysAfterDelivery}, Maternal={p.MaternalCondition}, BF={p.BreastfeedingStatus}, Notes={p.Notes}");
            }

            var fp = await _db.FamilyPlannings.AsNoTracking()
                .Where(f => f.PatientID == patientId)
                .OrderByDescending(f => f.VisitDate)
                .Take(5).ToListAsync(ct);
            if (fp.Count > 0)
            {
                sb.AppendLine("FAMILY PLANNING:");
                foreach (var f in fp)
                    sb.AppendLine($"  - {f.VisitDate:yyyy-MM-dd}: Method={f.Method}, Type={f.MethodType}, Notes={f.Notes}");
            }
        }

        private async Task AppendChildHealthAsync(StringBuilder sb, int patientId, CancellationToken ct)
        {
            sb.AppendLine("CHILD HEALTH MODULE:");

            var growth = await _db.GrowthMonitorings.AsNoTracking()
                .Where(g => g.PatientID == patientId)
                .OrderByDescending(g => g.MeasurementDate)
                .Take(10).ToListAsync(ct);
            sb.AppendLine("GROWTH MONITORING:");
            if (growth.Count == 0) sb.AppendLine("  (none)");
            else foreach (var g in growth)
                sb.AppendLine($"  - {g.MeasurementDate:yyyy-MM-dd}: Wt={g.WeightKg}kg, Ht={g.HeightCm}cm, MUAC={g.MUACCm}, Status={g.GrowthStatus}, Interp={g.GrowthInterpretation}");

            var dev = await _db.DevelopmentAssessments.AsNoTracking().Where(d => d.PatientID == patientId).Take(5).ToListAsync(ct);
            if (dev.Count > 0)
            {
                sb.AppendLine("DEVELOPMENT ASSESSMENT:");
                foreach (var d in dev)
                    sb.AppendLine($"  - DevelopmentAssessmentID={d.DevelopmentAssessmentID}");
            }

            var imm = await _db.Immunizations.AsNoTracking().Where(i => i.PatientID == patientId).Take(20).ToListAsync(ct);
            sb.AppendLine("IMMUNIZATIONS:");
            if (imm.Count == 0) sb.AppendLine("  (none)");
            else foreach (var i in imm)
                sb.AppendLine($"  - ImmunizationID={i.ImmunizationID}");

            var imnci = await _db.IMNCIEncounters.AsNoTracking().Where(e => e.PatientID == patientId).Take(5).ToListAsync(ct);
            if (imnci.Count > 0)
            {
                sb.AppendLine("IMNCI:");
                foreach (var e in imnci)
                    sb.AppendLine($"  - IMNCIEncounterID={e.IMNCIEncounterID}");
            }

            var neo = await _db.NeonatalCares.AsNoTracking().Where(n => n.PatientID == patientId).Take(5).ToListAsync(ct);
            if (neo.Count > 0)
            {
                sb.AppendLine("NEONATAL CARE:");
                foreach (var n in neo)
                    sb.AppendLine($"  - NeonatalCareID={n.NeonatalCareID}");
            }

            var nutr = await _db.NutritionAssessments.AsNoTracking().Where(n => n.PatientID == patientId).Take(5).ToListAsync(ct);
            if (nutr.Count > 0)
            {
                sb.AppendLine("NUTRITION:");
                foreach (var n in nutr)
                    sb.AppendLine($"  - NutritionAssessmentID={n.NutritionAssessmentID}");
            }
        }
    }
}