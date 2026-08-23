// DTO/Doctor/ConsultationDtos.cs
namespace HospitalSys.Dto.DoctorDtos
{
    public class DoctorPatientVisitDetailsDto
    {
        public PatientSummaryDto Patient { get; set; } = new();
        public VisitSummaryDto CurrentVisit { get; set; } = new();
        public TriageDetailDto? CurrentTriage { get; set; }
        public List<AllergyDto> Allergies { get; set; } = new();
        public List<MedicalHistoryDto> MedicalHistory { get; set; } = new();
        public List<FamilyMedicalHistoryDto> FamilyMedicalHistory { get; set; } = new();
        public List<ProblemListDto> ProblemList { get; set; } = new();
        public List<SocialHistoryDto> SocialHistory { get; set; } = new();
        public List<ConsultationSummaryDto> PreviousConsultations { get; set; } = new();
        public PrescriptionDetailViewDto? LatestPrescription { get; set; }
    }

    public class PatientSummaryDto
    {
        public int PatientID { get; set; }
        public string MRN { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string Gender { get; set; } = "";
        public DateTime DateOfBirth { get; set; }
        public string Phone { get; set; } = "";
        public string Address { get; set; } = "";
    }

    public class VisitSummaryDto
    {
        public int VisitID { get; set; }
        public int PatientID { get; set; }
        public DateTime VisitDate { get; set; }
        public string VisitType { get; set; } = "";
        public string Status { get; set; } = "";
    }

    public class TriageDetailDto
    {
        public int TriageId { get; set; }
        public int VisitID { get; set; }
        public int? NurseID { get; set; }
        public int TriageDepartmentID { get; set; }
        public int ClinicalDepartmentID { get; set; }
        public double Temprature { get; set; }
        public double BloodPressure { get; set; }
        public double HeartRate { get; set; }
        public double RespiratotyRate { get; set; }
        public double Weight { get; set; }
        public string Notes { get; set; } = "";
    }

    public class ConsultationSummaryDto
    {
        public int ConsultationID { get; set; }
        public int VisitID { get; set; }
        public int DoctorID { get; set; }
        public DateTime ConsultationDate { get; set; }
        public string ChiefComplaint { get; set; } = "";
        public string HistoryOfPresentIllness { get; set; } = "";
        public string? Assessment { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? ClinicalNotes { get; set; }
        public List<PhysicalExaminationDto> PhysicalExaminations { get; set; } = new();
        public List<DiagnosisDto> Diagnoses { get; set; } = new();
    }

    public class CreateConsultationDto
    {
        public string? ChiefComplaint { get; set; }
        public string? HistoryOfPresentIllness { get; set; }
        public string? Assessment { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? ClinicalNotes { get; set; }
    }

    public class PhysicalExaminationDto
    {
        public int PhysicalExaminationID { get; set; }
        public int ConsultationID { get; set; }
        public string ExaminationArea { get; set; } = "";
        public string Findings { get; set; } = "";
        public string? Notes { get; set; }
    }

    public class CreatePhysicalExaminationDto
    {
        public string? ExaminationArea { get; set; }
        public string? Findings { get; set; }
        public string? Notes { get; set; }
    }

    public class DiagnosisDto
    {
        public int DiagnosisID { get; set; }
        public int ConsultationID { get; set; }
        public string Code { get; set; } = "";
        public string Description { get; set; } = "";
        public string CodingSystem { get; set; } = "";
        public string? DiagnosisType { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class CreateDiagnosisDto
    {
        public string? Code { get; set; }
        public string? Description { get; set; }
        public string? CodingSystem { get; set; }
        public string? DiagnosisType { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class AllergyDto
    {
        public int AllergyID { get; set; }
        public int PatientID { get; set; }
        public string Allergen { get; set; } = "";
        public string? Reaction { get; set; }
        public string? Severity { get; set; }
        public bool IsActive { get; set; }
        public DateTime? OnsetDate { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateAllergyDto
    {
        public string? Allergen { get; set; }
        public string? Reaction { get; set; }
        public string? Severity { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? OnsetDate { get; set; }
        public string? Notes { get; set; }
    }

    public class MedicalHistoryDto
    {
        public int MedicalHistoryID { get; set; }
        public int PatientID { get; set; }
        public string ConditionName { get; set; } = "";
        public DateTime? DiagnosedDate { get; set; }
        public string? Status { get; set; }
        public string? Treatment { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateMedicalHistoryDto
    {
        public string? ConditionName { get; set; }
        public DateTime? DiagnosedDate { get; set; }
        public string? Status { get; set; }
        public string? Treatment { get; set; }
        public string? Notes { get; set; }
    }

    public class FamilyMedicalHistoryDto
    {
        public int FamilyMedicalHistoryID { get; set; }
        public int PatientID { get; set; }
        public string Relative { get; set; } = "";
        public string ConditionName { get; set; } = "";
        public string? Notes { get; set; }
    }

    public class CreateFamilyMedicalHistoryDto
    {
        public string? Relative { get; set; }
        public string? ConditionName { get; set; }
        public string? Notes { get; set; }
    }

    public class ProblemListDto
    {
        public int ProblemListID { get; set; }
        public int PatientID { get; set; }
        public string ProblemName { get; set; } = "";
        public string? Code { get; set; }
        public string? CodingSystem { get; set; }
        public string Status { get; set; } = "Active";
        public DateTime? OnsetDate { get; set; }
        public DateTime? ResolvedDate { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateProblemListDto
    {
        public string? ProblemName { get; set; }
        public string? Code { get; set; }
        public string? CodingSystem { get; set; }
        public string? Status { get; set; }
        public DateTime? OnsetDate { get; set; }
        public DateTime? ResolvedDate { get; set; }
        public string? Notes { get; set; }
    }

    public class SocialHistoryDto
    {
        public int SocialHistoryID { get; set; }
        public int PatientID { get; set; }
        public string? SmokingStatus { get; set; }
        public string? AlcoholUse { get; set; }
        public string? Occupation { get; set; }
        public string? LivingSituation { get; set; }
        public string? PhysicalActivity { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateSocialHistoryDto
    {
        public string? SmokingStatus { get; set; }
        public string? AlcoholUse { get; set; }
        public string? Occupation { get; set; }
        public string? LivingSituation { get; set; }
        public string? PhysicalActivity { get; set; }
        public string? Notes { get; set; }
    }

    public class PrescriptionDetailViewDto
    {
        public int PrescriptionID { get; set; }
        public int? ConsultationID { get; set; }
        public int? DoctorID { get; set; }
        public int PatientID { get; set; }
        public int BranchPharmacyID { get; set; }
        public DateTime PrescriptionDate { get; set; }
        public List<PrescriptionItemDto> Items { get; set; } = new();
    }

    public class PrescriptionItemDto
    {
        public int PrescriptionDetailID { get; set; }
        public int PrescriptionID { get; set; }
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public string GenericName { get; set; } = "";
        public string Dosage { get; set; } = "";
        public decimal Frequency { get; set; }
        public decimal Duration { get; set; }
        public decimal Quantity { get; set; }
    }
}