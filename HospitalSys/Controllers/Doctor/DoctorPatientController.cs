using HospitalSys.Data;
using HospitalSys.Dto.DoctorDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers.Doctor
{
    [ApiController]
    [Route("api/doctor")]
    [Authorize(Roles = "Doctor")]
    public class DoctorPatientController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DoctorPatientController(AppDbContext context)
        {
            _context = context;
        }

        private int GetDoctorId()
        {
            var claim = User.FindFirst("DoctorID")?.Value;
            if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out int id))
                throw new UnauthorizedAccessException("Invalid doctor authentication");
            return id;
        }

        private int GetDepartmentId()
        {
            var claim = User.FindFirst("DepartmentID")?.Value;
            if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out int id))
                throw new UnauthorizedAccessException("Invalid department claim");
            return id;
        }

        private async Task<bool> PatientAccessibleAsync(int patientId, int departmentId)
        {
            return await _context.Triages
                .AsNoTracking()
                .AnyAsync(t => t.ClinicalDepartmentID == departmentId
                            && t.PatientVisit != null
                            && t.PatientVisit.PatientID == patientId);
        }

        [HttpGet("patient/{patientId:int}/visit/{visitId:int}")]
        public async Task<IActionResult> GetPatientVisitDetails(int patientId, int visitId)
        {
            try
            {
                int departmentId = GetDepartmentId();

                var visit = await _context.PatientVisits
                    .AsNoTracking()
                    .Include(v => v.Patient)
                    .Include(v => v.Triage)
                    .FirstOrDefaultAsync(v => v.VisitID == visitId);

                if (visit == null)
                    return NotFound(new { message = "Patient visit not found." });

                if (visit.PatientID != patientId)
                    return NotFound(new { message = "The visit does not belong to this patient." });

                bool inDepartment = visit.Triage != null
                    && visit.Triage.Any(t => t.ClinicalDepartmentID == departmentId);

                if (!inDepartment)
                    return NotFound(new { message = "Patient visit not found." });

                var patient = visit.Patient!;

                var currentTriage = await _context.Triages
                    .AsNoTracking()
                    .Where(t => t.VisitID == visitId && t.ClinicalDepartmentID == departmentId)
                    .OrderByDescending(t => t.TriageId)
                    .Select(t => new TriageDetailDto
                    {
                        TriageId = t.TriageId,
                        VisitID = t.VisitID,
                        NurseID = t.NurseID,
                        TriageDepartmentID = t.TriageDepartmentID,
                        ClinicalDepartmentID = t.ClinicalDepartmentID,
                        Temprature = t.Temprature,
                        BloodPressure = t.BloodPressure,
                        HeartRate = t.HeartRate,
                        RespiratotyRate = t.RespiratotyRate,
                        Weight = t.Weight,
                        Notes = t.Notes
                    })
                    .FirstOrDefaultAsync();

                var allergies = await _context.Allergies
                    .AsNoTracking()
                    .Where(a => a.PatientID == patientId)
                    .Select(a => new AllergyDto
                    {
                        AllergyID = a.AllergyID,
                        PatientID = a.PatientID,
                        Allergen = a.Allergen,
                        Reaction = a.Reaction,
                        Severity = a.Severity,
                        IsActive = a.IsActive,
                        OnsetDate = a.OnsetDate,
                        Notes = a.Notes
                    })
                    .ToListAsync();

                var medicalHistory = await _context.MedicalHistories
                    .AsNoTracking()
                    .Where(m => m.PatientID == patientId)
                    .Select(m => new MedicalHistoryDto
                    {
                        MedicalHistoryID = m.MedicalHistoryID,
                        PatientID = m.PatientID,
                        ConditionName = m.ConditionName,
                        DiagnosedDate = m.DiagnosedDate,
                        Status = m.Status,
                        Treatment = m.Treatment,
                        Notes = m.Notes
                    })
                    .ToListAsync();

                var familyHistory = await _context.FamilyMedicalHistories
                    .AsNoTracking()
                    .Where(f => f.PatientID == patientId)
                    .Select(f => new FamilyMedicalHistoryDto
                    {
                        FamilyMedicalHistoryID = f.FamilyMedicalHistoryID,
                        PatientID = f.PatientID,
                        Relative = f.Relative,
                        ConditionName = f.ConditionName,
                        Notes = f.Notes
                    })
                    .ToListAsync();

                var problemList = await _context.ProblemLists
                    .AsNoTracking()
                    .Where(p => p.PatientID == patientId)
                    .Select(p => new ProblemListDto
                    {
                        ProblemListID = p.ProblemListID,
                        PatientID = p.PatientID,
                        ProblemName = p.ProblemName,
                        Code = p.Code,
                        CodingSystem = p.CodingSystem,
                        Status = p.Status,
                        OnsetDate = p.OnsetDate,
                        ResolvedDate = p.ResolvedDate,
                        Notes = p.Notes
                    })
                    .ToListAsync();

                var socialHistory = await _context.SocialHistories
                    .AsNoTracking()
                    .Where(s => s.PatientID == patientId)
                    .Select(s => new SocialHistoryDto
                    {
                        SocialHistoryID = s.SocialHistoryID,
                        PatientID = s.PatientID,
                        SmokingStatus = s.SmokingStatus,
                        AlcoholUse = s.AlcoholUse,
                        Occupation = s.Occupation,
                        LivingSituation = s.LivingSituation,
                        PhysicalActivity = s.PhysicalActivity,
                        Notes = s.Notes
                    })
                    .ToListAsync();

                var previousConsultations = await _context.Consultations
                    .AsNoTracking()
                    .Where(c => c.PatientVisit != null && c.PatientVisit.PatientID == patientId)
                    .OrderByDescending(c => c.ConsultationDate)
                    .Select(c => new ConsultationSummaryDto
                    {
                        ConsultationID = c.ConsultationID,
                        VisitID = c.VisitID,
                        DoctorID = c.DoctorID,
                        ConsultationDate = c.ConsultationDate,
                        ChiefComplaint = c.ChiefComplaint,
                        HistoryOfPresentIllness = c.HistoryOfPresentIllness,
                        Assessment = c.Assessment,
                        TreatmentPlan = c.TreatmentPlan,
                        ClinicalNotes = c.ClinicalNotes,
                        PhysicalExaminations = c.PhysicalExaminations.Select(pe => new PhysicalExaminationDto
                        {
                            PhysicalExaminationID = pe.PhysicalExaminationID,
                            ConsultationID = pe.ConsultationID,
                            ExaminationArea = pe.ExaminationArea,
                            Findings = pe.Findings,
                            Notes = pe.Notes
                        }).ToList(),
                        Diagnoses = c.Diagnose.Select(d => new DiagnosisDto
                        {
                            DiagnosisID = d.DiagnosisID,
                            ConsultationID = d.ConsultationID,
                            Code = d.Code,
                            Description = d.Description,
                            CodingSystem = d.CodingSystem,
                            DiagnosisType = d.DiagnosisType,
                            IsPrimary = d.IsPrimary
                        }).ToList()
                    })
                    .ToListAsync();

                var latestPrescription = await _context.Prescriptions
                    .AsNoTracking()
                    .Where(p => p.PatientID == patientId)
                    .OrderByDescending(p => p.PrescriptionDate)
                    .Select(p => new PrescriptionDetailViewDto
                    {
                        PrescriptionID = p.PrescriptionID,
                        ConsultationID = p.ConsultationID,
                        DoctorID = p.DoctorID,
                        PatientID = p.PatientID,
                        BranchPharmacyID = p.BranchPharmacyID,
                        PrescriptionDate = p.PrescriptionDate,
                        Items = p.PrescriptionDetail.Select(pd => new PrescriptionItemDto
                        {
                            PrescriptionDetailID = pd.PrescriptionDetailID,
                            PrescriptionID = pd.PrescriptionID,
                            MedicineID = pd.MedicineID,
                            MedicineName = pd.Medicine != null ? pd.Medicine.MedicineName : "",
                            GenericName = pd.Medicine != null ? pd.Medicine.GenericName : "",
                            Dosage = pd.Dosage,
                            Frequency = pd.Frequency,
                            Duration = pd.Duration,
                            Quantity = pd.Quantity
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();

                var result = new DoctorPatientVisitDetailsDto
                {
                    Patient = new PatientSummaryDto
                    {
                        PatientID = patient.PatientID,
                        MRN = patient.MRN,
                        FirstName = patient.FirstName,
                        LastName = patient.LastName,
                        Gender = patient.Gender.ToString(),
                        DateOfBirth = patient.DateOfBirth,
                        Phone = patient.Phone,
                        Address = patient.Address
                    },
                    CurrentVisit = new VisitSummaryDto
                    {
                        VisitID = visit.VisitID,
                        PatientID = visit.PatientID,
                        VisitDate = visit.VisitDate,
                        VisitType = visit.VisitType,
                        Status = visit.Status
                    },
                    CurrentTriage = currentTriage,
                    Allergies = allergies,
                    MedicalHistory = medicalHistory,
                    FamilyMedicalHistory = familyHistory,
                    ProblemList = problemList,
                    SocialHistory = socialHistory,
                    PreviousConsultations = previousConsultations,
                    LatestPrescription = latestPrescription
                };

                return Ok(result);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Unauthorized" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while loading patient visit details." });
            }
        }

        [HttpGet("patient/{patientId:int}")]
        public async Task<IActionResult> GetPatientDetails(int patientId)
        {
            try
            {
                int departmentId = GetDepartmentId();

                if (!await PatientAccessibleAsync(patientId, departmentId))
                    return NotFound(new { message = "Patient not found." });

                var patient = await _context.Patients
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.PatientID == patientId);

                if (patient == null)
                    return NotFound(new { message = "Patient not found." });

                var asthma = await _context.AsthmaManagements.AsNoTracking()
                    .Where(x => x.PatientID == patientId).ToListAsync();
                var diabetes = await _context.DiabetesManagements.AsNoTracking()
                    .Where(x => x.PatientID == patientId).ToListAsync();
                var hiv = await _context.HIVCares.AsNoTracking()
                    .Where(x => x.PatientID == patientId).ToListAsync();
                var hepatitis = await _context.HepatitisManagements.AsNoTracking()
                    .Where(x => x.PatientID == patientId).ToListAsync();
                var hypertension = await _context.HypertensionManagements.AsNoTracking()
                    .Where(x => x.PatientID == patientId).ToListAsync();
                var mental = await _context.MentalHealthCares.AsNoTracking()
                    .Where(x => x.PatientID == patientId).ToListAsync();
                var tb = await _context.TuberculosisManagements.AsNoTracking()
                    .Where(x => x.PatientID == patientId).ToListAsync();

                var result = new DoctorPatientDetailsDto
                {
                    Patient = new PatientSummaryDto
                    {
                        PatientID = patient.PatientID,
                        MRN = patient.MRN,
                        FirstName = patient.FirstName,
                        LastName = patient.LastName,
                        Gender = patient.Gender.ToString(),
                        DateOfBirth = patient.DateOfBirth,
                        Phone = patient.Phone,
                        Address = patient.Address
                    },
                    AsthmaManagement = asthma.Select(MapAsthma).ToList(),
                    DiabetesManagement = diabetes.Select(MapDiabetes).ToList(),
                    HIVCare = hiv.Select(MapHiv).ToList(),
                    HepatitisManagement = hepatitis.Select(MapHepatitis).ToList(),
                    HypertensionManagement = hypertension.Select(MapHypertension).ToList(),
                    MentalHealthCare = mental.Select(MapMentalHealth).ToList(),
                    TuberculosisManagement = tb.Select(MapTb).ToList()
                };

                return Ok(result);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Unauthorized" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while loading patient details." });
            }
        }

        private static AsthmaManagementDto MapAsthma(HospitalSys.Models.AdultMedicalCare.AsthmaManagement x) => new()
        {
            AsthmaManagementID = x.AsthmaManagementID,
            PatientID = x.PatientID,
            DiagnosisDate = x.DiagnosisDate,
            AsthmaSeverity = x.AsthmaSeverity,
            AsthmaControlStatus = x.AsthmaControlStatus,
            Symptoms = x.Symptoms,
            Triggers = x.Triggers,
            Allergies = x.Allergies,
            ExacerbationHistory = x.ExacerbationHistory,
            HospitalizationHistory = x.HospitalizationHistory,
            ManagementPlan = x.ManagementPlan,
            InhalerTechniqueEducation = x.InhalerTechniqueEducation,
            TreatmentStatus = x.TreatmentStatus,
            LastFollowUpDate = x.LastFollowUpDate,
            NextFollowUpDate = x.NextFollowUpDate,
            Active = x.Active,
            Notes = x.Notes,
            RecordedByUserID = x.RecordedByUserID,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };

        private static DiabetesManagementDto MapDiabetes(HospitalSys.Models.AdultMedicalCare.DiabetesManagement x) => new()
        {
            DiabetesManagementID = x.DiabetesManagementID,
            PatientID = x.PatientID,
            DiagnosisDate = x.DiagnosisDate,
            DiabetesType = x.DiabetesType.ToString(),
            DiagnosisMethod = x.DiagnosisMethod,
            LastFastingBloodGlucose = x.LastFastingBloodGlucose,
            LastRandomBloodGlucose = x.LastRandomBloodGlucose,
            LastHbA1c = x.LastHbA1c,
            Symptoms = x.Symptoms,
            Complications = x.Complications,
            RiskFactors = x.RiskFactors,
            ManagementPlan = x.ManagementPlan,
            LifestyleAdvice = x.LifestyleAdvice,
            TreatmentStatus = x.TreatmentStatus,
            LastFollowUpDate = x.LastFollowUpDate,
            NextFollowUpDate = x.NextFollowUpDate,
            Active = x.Active,
            Notes = x.Notes,
            RecordedByUserID = x.RecordedByUserID,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };

        private static HIVCareDto MapHiv(HospitalSys.Models.AdultMedicalCare.HIVCare x) => new()
        {
            HIVCareID = x.HIVCareID,
            PatientID = x.PatientID,
            EnrollmentDate = x.EnrollmentDate,
            DiagnosisDate = x.DiagnosisDate,
            CareStatus = x.CareStatus,
            ClinicalStage = x.ClinicalStage,
            TreatmentStatus = x.TreatmentStatus,
            TreatmentStartDate = x.TreatmentStartDate,
            AdherenceStatus = x.AdherenceStatus,
            TreatmentResponse = x.TreatmentResponse,
            OpportunisticConditions = x.OpportunisticConditions,
            Complications = x.Complications,
            CounselingProvided = x.CounselingProvided,
            FollowUpPlan = x.FollowUpPlan,
            LastFollowUpDate = x.LastFollowUpDate,
            NextFollowUpDate = x.NextFollowUpDate,
            Outcome = x.Outcome,
            Active = x.Active,
            Notes = x.Notes,
            ManagedByUserID = x.ManagedByUserID,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };

        private static HepatitisManagementDto MapHepatitis(HospitalSys.Models.AdultMedicalCare.HepatitisManagement x) => new()
        {
            HepatitisManagementID = x.HepatitisManagementID,
            PatientID = x.PatientID,
            DiagnosisDate = x.DiagnosisDate,
            HepatitisType = x.HepatitisType,
            DiagnosticMethod = x.DiagnosticMethod,
            DiseaseStatus = x.DiseaseStatus,
            Symptoms = x.Symptoms,
            LiverCondition = x.LiverCondition,
            Complications = x.Complications,
            TreatmentPlan = x.TreatmentPlan,
            TreatmentStatus = x.TreatmentStatus,
            LaboratoryMonitoringPlan = x.LaboratoryMonitoringPlan,
            LastFollowUpDate = x.LastFollowUpDate,
            NextFollowUpDate = x.NextFollowUpDate,
            Outcome = x.Outcome,
            Active = x.Active,
            Notes = x.Notes,
            ManagedByUserID = x.ManagedByUserID,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };

        private static HypertensionManagementDto MapHypertension(HospitalSys.Models.AdultMedicalCare.HypertensionManagement x) => new()
        {
            HypertensionManagementID = x.HypertensionManagementID,
            PatientID = x.PatientID,
            DiagnosisDate = x.DiagnosisDate,
            HypertensionType = x.HypertensionType,
            DiagnosisMethod = x.DiagnosisMethod,
            RiskFactors = x.RiskFactors,
            TargetBloodPressure = x.TargetBloodPressure,
            Complications = x.Complications,
            CardiovascularRisk = x.CardiovascularRisk,
            ManagementPlan = x.ManagementPlan,
            LifestyleAdvice = x.LifestyleAdvice,
            TreatmentStatus = x.TreatmentStatus,
            LastFollowUpDate = x.LastFollowUpDate,
            NextFollowUpDate = x.NextFollowUpDate,
            Active = x.Active,
            Notes = x.Notes,
            RecordedByUserID = x.RecordedByUserID,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };

        private static MentalHealthCareDto MapMentalHealth(HospitalSys.Models.AdultMedicalCare.MentalHealthCare x) => new()
        {
            MentalHealthCareID = x.MentalHealthCareID,
            PatientID = x.PatientID,
            AssessmentDate = x.AssessmentDate,
            PresentingConcern = x.PresentingConcern,
            MentalHealthDiagnosis = x.MentalHealthDiagnosis,
            Symptoms = x.Symptoms,
            MentalStatusExamination = x.MentalStatusExamination,
            PsychosocialFactors = x.PsychosocialFactors,
            RiskAssessment = x.RiskAssessment,
            SafetyPlan = x.SafetyPlan,
            TreatmentPlan = x.TreatmentPlan,
            CounselingProvided = x.CounselingProvided,
            ReferralRequired = x.ReferralRequired,
            FollowUpPlan = x.FollowUpPlan,
            NextFollowUpDate = x.NextFollowUpDate,
            Active = x.Active,
            Notes = x.Notes,
            AssessedByUserID = x.AssessedByUserID,
            UpdatedAt = x.UpdatedAt
        };

        private static TuberculosisManagementDto MapTb(HospitalSys.Models.AdultMedicalCare.TuberculosisManagement x) => new()
        {
            TuberculosisManagementID = x.TuberculosisManagementID,
            PatientID = x.PatientID,
            DiagnosisDate = x.DiagnosisDate,
            TBType = x.TBType,
            SiteOfTB = x.SiteOfTB,
            DiagnosticMethod = x.DiagnosticMethod,
            Symptoms = x.Symptoms,
            DrugResistanceStatus = x.DrugResistanceStatus,
            TreatmentStartDate = x.TreatmentStartDate,
            ExpectedTreatmentEndDate = x.ExpectedTreatmentEndDate,
            ActualTreatmentEndDate = x.ActualTreatmentEndDate,
            TreatmentRegimen = x.TreatmentRegimen,
            TreatmentStatus = x.TreatmentStatus,
            AdherenceStatus = x.AdherenceStatus,
            TreatmentResponse = x.TreatmentResponse,
            Complications = x.Complications,
            ContactTracingStatus = x.ContactTracingStatus,
            LastFollowUpDate = x.LastFollowUpDate,
            NextFollowUpDate = x.NextFollowUpDate,
            Outcome = x.Outcome,
            Active = x.Active,
            Notes = x.Notes,
            ManagedByUserID = x.ManagedByUserID,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };
    }
}