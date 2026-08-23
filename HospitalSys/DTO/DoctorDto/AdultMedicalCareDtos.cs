namespace HospitalSys.Dto.DoctorDtos
{
    
    public class DoctorPatientDetailsDto
    {
        public PatientSummaryDto Patient { get; set; } = new();
        public List<AsthmaManagementDto> AsthmaManagement { get; set; } = new();
        public List<DiabetesManagementDto> DiabetesManagement { get; set; } = new();
        public List<HIVCareDto> HIVCare { get; set; } = new();
        public List<HepatitisManagementDto> HepatitisManagement { get; set; } = new();
        public List<HypertensionManagementDto> HypertensionManagement { get; set; } = new();
        public List<MentalHealthCareDto> MentalHealthCare { get; set; } = new();
        public List<TuberculosisManagementDto> TuberculosisManagement { get; set; } = new();
    }

    public class AsthmaManagementDto
    {
        public int AsthmaManagementID { get; set; }
        public int PatientID { get; set; }
        public DateTime DiagnosisDate { get; set; }
        public string? AsthmaSeverity { get; set; }
        public string? AsthmaControlStatus { get; set; }
        public string? Symptoms { get; set; }
        public string? Triggers { get; set; }
        public string? Allergies { get; set; }
        public string? ExacerbationHistory { get; set; }
        public string? HospitalizationHistory { get; set; }
        public string? ManagementPlan { get; set; }
        public string? InhalerTechniqueEducation { get; set; }
        public string? TreatmentStatus { get; set; }
        public DateTime? LastFollowUpDate { get; set; }
        public DateTime? NextFollowUpDate { get; set; }
        public bool Active { get; set; }
        public string? Notes { get; set; }
        public int? RecordedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateAsthmaManagementDto
    {
        public DateTime DiagnosisDate { get; set; }
        public string? AsthmaSeverity { get; set; }
        public string? AsthmaControlStatus { get; set; }
        public string? Symptoms { get; set; }
        public string? Triggers { get; set; }
        public string? Allergies { get; set; }
        public string? ExacerbationHistory { get; set; }
        public string? HospitalizationHistory { get; set; }
        public string? ManagementPlan { get; set; }
        public string? InhalerTechniqueEducation { get; set; }
        public string? TreatmentStatus { get; set; }
        public DateTime? LastFollowUpDate { get; set; }
        public DateTime? NextFollowUpDate { get; set; }
        public bool Active { get; set; } = true;
        public string? Notes { get; set; }
    }

    public class DiabetesManagementDto
    {
        public int DiabetesManagementID { get; set; }
        public int PatientID { get; set; }
        public DateTime DiagnosisDate { get; set; }
        public string DiabetesType { get; set; } = "";
        public string? DiagnosisMethod { get; set; }
        public decimal? LastFastingBloodGlucose { get; set; }
        public decimal? LastRandomBloodGlucose { get; set; }
        public decimal? LastHbA1c { get; set; }
        public string? Symptoms { get; set; }
        public string? Complications { get; set; }
        public string? RiskFactors { get; set; }
        public string? ManagementPlan { get; set; }
        public string? LifestyleAdvice { get; set; }
        public string? TreatmentStatus { get; set; }
        public DateTime? LastFollowUpDate { get; set; }
        public DateTime? NextFollowUpDate { get; set; }
        public bool Active { get; set; }
        public string? Notes { get; set; }
        public int? RecordedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateDiabetesManagementDto
    {
        public DateTime DiagnosisDate { get; set; }
        public string DiabetesType { get; set; } = "Type2";
        public string? DiagnosisMethod { get; set; }
        public decimal? LastFastingBloodGlucose { get; set; }
        public decimal? LastRandomBloodGlucose { get; set; }
        public decimal? LastHbA1c { get; set; }
        public string? Symptoms { get; set; }
        public string? Complications { get; set; }
        public string? RiskFactors { get; set; }
        public string? ManagementPlan { get; set; }
        public string? LifestyleAdvice { get; set; }
        public string? TreatmentStatus { get; set; }
        public DateTime? LastFollowUpDate { get; set; }
        public DateTime? NextFollowUpDate { get; set; }
        public bool Active { get; set; } = true;
        public string? Notes { get; set; }
    }

    public class HIVCareDto
    {
        public int HIVCareID { get; set; }
        public int PatientID { get; set; }
        public DateTime EnrollmentDate { get; set; }
        public DateTime? DiagnosisDate { get; set; }
        public string? CareStatus { get; set; }
        public string? ClinicalStage { get; set; }
        public string? TreatmentStatus { get; set; }
        public DateTime? TreatmentStartDate { get; set; }
        public string? AdherenceStatus { get; set; }
        public string? TreatmentResponse { get; set; }
        public string? OpportunisticConditions { get; set; }
        public string? Complications { get; set; }
        public string? CounselingProvided { get; set; }
        public string? FollowUpPlan { get; set; }
        public DateTime? LastFollowUpDate { get; set; }
        public DateTime? NextFollowUpDate { get; set; }
        public string? Outcome { get; set; }
        public bool Active { get; set; }
        public string? Notes { get; set; }
        public int? ManagedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateHIVCareDto
    {
        public DateTime? EnrollmentDate { get; set; }
        public DateTime? DiagnosisDate { get; set; }
        public string? CareStatus { get; set; }
        public string? ClinicalStage { get; set; }
        public string? TreatmentStatus { get; set; }
        public DateTime? TreatmentStartDate { get; set; }
        public string? AdherenceStatus { get; set; }
        public string? TreatmentResponse { get; set; }
        public string? OpportunisticConditions { get; set; }
        public string? Complications { get; set; }
        public string? CounselingProvided { get; set; }
        public string? FollowUpPlan { get; set; }
        public DateTime? LastFollowUpDate { get; set; }
        public DateTime? NextFollowUpDate { get; set; }
        public string? Outcome { get; set; }
        public bool Active { get; set; } = true;
        public string? Notes { get; set; }
    }

    public class HepatitisManagementDto
    {
        public int HepatitisManagementID { get; set; }
        public int PatientID { get; set; }
        public DateTime DiagnosisDate { get; set; }
        public string? HepatitisType { get; set; }
        public string? DiagnosticMethod { get; set; }
        public string? DiseaseStatus { get; set; }
        public string? Symptoms { get; set; }
        public string? LiverCondition { get; set; }
        public string? Complications { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? TreatmentStatus { get; set; }
        public string? LaboratoryMonitoringPlan { get; set; }
        public DateTime? LastFollowUpDate { get; set; }
        public DateTime? NextFollowUpDate { get; set; }
        public string? Outcome { get; set; }
        public bool Active { get; set; }
        public string? Notes { get; set; }
        public int? ManagedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateHepatitisManagementDto
    {
        public DateTime DiagnosisDate { get; set; }
        public string? HepatitisType { get; set; }
        public string? DiagnosticMethod { get; set; }
        public string? DiseaseStatus { get; set; }
        public string? Symptoms { get; set; }
        public string? LiverCondition { get; set; }
        public string? Complications { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? TreatmentStatus { get; set; }
        public string? LaboratoryMonitoringPlan { get; set; }
        public DateTime? LastFollowUpDate { get; set; }
        public DateTime? NextFollowUpDate { get; set; }
        public string? Outcome { get; set; }
        public bool Active { get; set; } = true;
        public string? Notes { get; set; }
    }

    public class HypertensionManagementDto
    {
        public int HypertensionManagementID { get; set; }
        public int PatientID { get; set; }
        public DateTime DiagnosisDate { get; set; }
        public string? HypertensionType { get; set; }
        public string? DiagnosisMethod { get; set; }
        public string? RiskFactors { get; set; }
        public string? TargetBloodPressure { get; set; }
        public string? Complications { get; set; }
        public string? CardiovascularRisk { get; set; }
        public string? ManagementPlan { get; set; }
        public string? LifestyleAdvice { get; set; }
        public string? TreatmentStatus { get; set; }
        public DateTime? LastFollowUpDate { get; set; }
        public DateTime? NextFollowUpDate { get; set; }
        public bool Active { get; set; }
        public string? Notes { get; set; }
        public int? RecordedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateHypertensionManagementDto
    {
        public DateTime DiagnosisDate { get; set; }
        public string? HypertensionType { get; set; }
        public string? DiagnosisMethod { get; set; }
        public string? RiskFactors { get; set; }
        public string? TargetBloodPressure { get; set; }
        public string? Complications { get; set; }
        public string? CardiovascularRisk { get; set; }
        public string? ManagementPlan { get; set; }
        public string? LifestyleAdvice { get; set; }
        public string? TreatmentStatus { get; set; }
        public DateTime? LastFollowUpDate { get; set; }
        public DateTime? NextFollowUpDate { get; set; }
        public bool Active { get; set; } = true;
        public string? Notes { get; set; }
    }

    public class MentalHealthCareDto
    {
        public int MentalHealthCareID { get; set; }
        public int PatientID { get; set; }
        public DateTime AssessmentDate { get; set; }
        public string? PresentingConcern { get; set; }
        public string? MentalHealthDiagnosis { get; set; }
        public string? Symptoms { get; set; }
        public string? MentalStatusExamination { get; set; }
        public string? PsychosocialFactors { get; set; }
        public string? RiskAssessment { get; set; }
        public string? SafetyPlan { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? CounselingProvided { get; set; }
        public string? ReferralRequired { get; set; }
        public string? FollowUpPlan { get; set; }
        public DateTime? NextFollowUpDate { get; set; }
        public bool Active { get; set; }
        public string? Notes { get; set; }
        public int? AssessedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateMentalHealthCareDto
    {
        public DateTime? AssessmentDate { get; set; }
        public string? PresentingConcern { get; set; }
        public string? MentalHealthDiagnosis { get; set; }
        public string? Symptoms { get; set; }
        public string? MentalStatusExamination { get; set; }
        public string? PsychosocialFactors { get; set; }
        public string? RiskAssessment { get; set; }
        public string? SafetyPlan { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? CounselingProvided { get; set; }
        public string? ReferralRequired { get; set; }
        public string? FollowUpPlan { get; set; }
        public DateTime? NextFollowUpDate { get; set; }
        public bool Active { get; set; } = true;
        public string? Notes { get; set; }
    }

    public class TuberculosisManagementDto
    {
        public int TuberculosisManagementID { get; set; }
        public int PatientID { get; set; }
        public DateTime DiagnosisDate { get; set; }
        public string? TBType { get; set; }
        public string? SiteOfTB { get; set; }
        public string? DiagnosticMethod { get; set; }
        public string? Symptoms { get; set; }
        public string? DrugResistanceStatus { get; set; }
        public DateTime? TreatmentStartDate { get; set; }
        public DateTime? ExpectedTreatmentEndDate { get; set; }
        public DateTime? ActualTreatmentEndDate { get; set; }
        public string? TreatmentRegimen { get; set; }
        public string? TreatmentStatus { get; set; }
        public string? AdherenceStatus { get; set; }
        public string? TreatmentResponse { get; set; }
        public string? Complications { get; set; }
        public string? ContactTracingStatus { get; set; }
        public DateTime? LastFollowUpDate { get; set; }
        public DateTime? NextFollowUpDate { get; set; }
        public string? Outcome { get; set; }
        public bool Active { get; set; }
        public string? Notes { get; set; }
        public int? ManagedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateTuberculosisManagementDto
    {
        public DateTime DiagnosisDate { get; set; }
        public string? TBType { get; set; }
        public string? SiteOfTB { get; set; }
        public string? DiagnosticMethod { get; set; }
        public string? Symptoms { get; set; }
        public string? DrugResistanceStatus { get; set; }
        public DateTime? TreatmentStartDate { get; set; }
        public DateTime? ExpectedTreatmentEndDate { get; set; }
        public DateTime? ActualTreatmentEndDate { get; set; }
        public string? TreatmentRegimen { get; set; }
        public string? TreatmentStatus { get; set; }
        public string? AdherenceStatus { get; set; }
        public string? TreatmentResponse { get; set; }
        public string? Complications { get; set; }
        public string? ContactTracingStatus { get; set; }
        public DateTime? LastFollowUpDate { get; set; }
        public DateTime? NextFollowUpDate { get; set; }
        public string? Outcome { get; set; }
        public bool Active { get; set; } = true;
        public string? Notes { get; set; }
    }
}