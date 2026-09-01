// DTO/DoctorDto/MaternalChildHealthDtos.cs
using HospitalSys.Models.MaternalChildHealth;

namespace HospitalSys.Dto.DoctorDtos
{
    // ============================================================
    // Pregnancy
    // ============================================================

    public class PregnancyDto
    {
        public int PregnancyID { get; set; }
        public int PatientID { get; set; }
        public DateTime? LastMenstrualPeriod { get; set; }
        public DateTime? ExpectedDeliveryDate { get; set; }
        public int? Gravida { get; set; }
        public int? Para { get; set; }
        public int? Abortions { get; set; }
        public int? LivingChildren { get; set; }
        public PregnancyStatus Status { get; set; }
        public DateTime RegistrationDate { get; set; }
        public string? Notes { get; set; }
    }

    public class PregnancyListDto
    {
        public int PregnancyID { get; set; }
        public int PatientID { get; set; }
        public string PatientName { get; set; } = "";
        public string MRN { get; set; } = "";
        public DateTime? LastMenstrualPeriod { get; set; }
        public DateTime? ExpectedDeliveryDate { get; set; }
        public int? Gravida { get; set; }
        public int? Para { get; set; }
        public PregnancyStatus Status { get; set; }
        public DateTime RegistrationDate { get; set; }
    }

    public class PregnancyDetailsDto
    {
        public int PregnancyID { get; set; }
        public int PatientID { get; set; }
        public PatientSummaryDto? Patient { get; set; }
        public DateTime? LastMenstrualPeriod { get; set; }
        public DateTime? ExpectedDeliveryDate { get; set; }
        public int? Gravida { get; set; }
        public int? Para { get; set; }
        public int? Abortions { get; set; }
        public int? LivingChildren { get; set; }
        public PregnancyStatus Status { get; set; }
        public DateTime RegistrationDate { get; set; }
        public string? Notes { get; set; }
        public List<PregnancyRegistrationDto> Registrations { get; set; } = new();
        public List<ANCVisitDto> ANCVisits { get; set; } = new();
        public List<PregnancyRiskAssessmentDto> RiskAssessments { get; set; } = new();
        public List<HighRiskPregnancyDto> HighRiskPregnancies { get; set; } = new();
        public List<BirthPreparednessDto> BirthPreparednessPlans { get; set; } = new();
        public List<PregnancyLaboratoryOrderDto> LaboratoryOrders { get; set; } = new();
        public List<PregnancyUltrasoundDto> Ultrasounds { get; set; } = new();
        public List<PregnancyMedicationDto> Medications { get; set; } = new();
        public List<LaborRecordDto> LaborRecords { get; set; } = new();
        public List<DeliveryDto> Deliveries { get; set; } = new();
        public List<PNCVisitDto> PNCVisits { get; set; } = new();
        public List<FamilyPlanningDto> FamilyPlanningRecords { get; set; } = new();
    }

    public class CreatePregnancyDto
    {
        public DateTime? LastMenstrualPeriod { get; set; }
        public DateTime? ExpectedDeliveryDate { get; set; }
        public int? Gravida { get; set; }
        public int? Para { get; set; }
        public int? Abortions { get; set; }
        public int? LivingChildren { get; set; }
        public string? Notes { get; set; }
        public int? GestationalAgeWeeks { get; set; }
        public string? RegistrationReason { get; set; }
        public string? PreviousPregnancyHistory { get; set; }
        public string? CurrentPregnancyHistory { get; set; }
        public string? RegistrationNotes { get; set; }
    }

    public class UpdatePregnancyDto
    {
        public DateTime? LastMenstrualPeriod { get; set; }
        public DateTime? ExpectedDeliveryDate { get; set; }
        public int? Gravida { get; set; }
        public int? Para { get; set; }
        public int? Abortions { get; set; }
        public int? LivingChildren { get; set; }
        public PregnancyStatus Status { get; set; }
        public string? Notes { get; set; }
    }

    // ============================================================
    // Pregnancy Registration
    // ============================================================

    public class PregnancyRegistrationDto
    {
        public int PregnancyRegistrationID { get; set; }
        public int PregnancyID { get; set; }
        public int PatientID { get; set; }
        public DateTime RegistrationDate { get; set; }
        public int? GestationalAgeWeeks { get; set; }
        public string? RegistrationReason { get; set; }
        public string? PreviousPregnancyHistory { get; set; }
        public string? CurrentPregnancyHistory { get; set; }
        public string? Notes { get; set; }
        public int? RecordedByUserID { get; set; }
    }

    public class CreatePregnancyRegistrationDto
    {
        public int PregnancyID { get; set; }
        public int? GestationalAgeWeeks { get; set; }
        public string? RegistrationReason { get; set; }
        public string? PreviousPregnancyHistory { get; set; }
        public string? CurrentPregnancyHistory { get; set; }
        public string? Notes { get; set; }
    }

    // ============================================================
    // ANC Visit
    // ============================================================

    public class ANCVisitDto
    {
        public int ANCVisitID { get; set; }
        public int PregnancyID { get; set; }
        public int PatientVisitID { get; set; }
        public DateTime VisitDate { get; set; }
        public int? GestationalAgeWeeks { get; set; }
        public string? ChiefComplaint { get; set; }
        public string? MaternalCondition { get; set; }
        public string? FetalCondition { get; set; }
        public string? FetalHeartRate { get; set; }
        public string? FundalHeight { get; set; }
        public string? Edema { get; set; }
        public string? CounselingProvided { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? Notes { get; set; }
        public int? RecordedByUserID { get; set; }
    }

    public class ANCVisitListDto
    {
        public int ANCVisitID { get; set; }
        public int PregnancyID { get; set; }
        public int PatientVisitID { get; set; }
        public int PatientID { get; set; }
        public string PatientName { get; set; } = "";
        public string MRN { get; set; } = "";
        public DateTime VisitDate { get; set; }
        public int? GestationalAgeWeeks { get; set; }
        public string? ChiefComplaint { get; set; }
        public string? MaternalCondition { get; set; }
        public string? FetalCondition { get; set; }
    }

    public class ANCVisitDetailsDto
    {
        public int ANCVisitID { get; set; }
        public int PregnancyID { get; set; }
        public int PatientVisitID { get; set; }
        public DateTime VisitDate { get; set; }
        public int? GestationalAgeWeeks { get; set; }
        public string? ChiefComplaint { get; set; }
        public string? MaternalCondition { get; set; }
        public string? FetalCondition { get; set; }
        public string? FetalHeartRate { get; set; }
        public string? FundalHeight { get; set; }
        public string? Edema { get; set; }
        public string? CounselingProvided { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? Notes { get; set; }
        public int? RecordedByUserID { get; set; }
        public List<PregnancyRiskAssessmentDto> RiskAssessments { get; set; } = new();
    }

    public class CreateANCVisitDto
    {
        public int PregnancyID { get; set; }
        public int PatientVisitID { get; set; }
        public int? GestationalAgeWeeks { get; set; }
        public string? ChiefComplaint { get; set; }
        public string? MaternalCondition { get; set; }
        public string? FetalCondition { get; set; }
        public string? FetalHeartRate { get; set; }
        public string? FundalHeight { get; set; }
        public string? Edema { get; set; }
        public string? CounselingProvided { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateANCVisitDto
    {
        public int? GestationalAgeWeeks { get; set; }
        public string? ChiefComplaint { get; set; }
        public string? MaternalCondition { get; set; }
        public string? FetalCondition { get; set; }
        public string? FetalHeartRate { get; set; }
        public string? FundalHeight { get; set; }
        public string? Edema { get; set; }
        public string? CounselingProvided { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? Notes { get; set; }
    }

    // ============================================================
    // Pregnancy Risk Assessment
    // ============================================================

    public class PregnancyRiskAssessmentDto
    {
        public int PregnancyRiskAssessmentID { get; set; }
        public int PregnancyID { get; set; }
        public int? ANCVisitID { get; set; }
        public DateTime AssessmentDate { get; set; }
        public bool IsHighRisk { get; set; }
        public string? RiskCategory { get; set; }
        public string? RiskFactor { get; set; }
        public string? RiskDescription { get; set; }
        public string? ActionTaken { get; set; }
        public string? ReferralRequired { get; set; }
        public string? Notes { get; set; }
        public int? AssessedByUserID { get; set; }
    }

    public class CreatePregnancyRiskAssessmentDto
    {
        public int PregnancyID { get; set; }
        public int? ANCVisitID { get; set; }
        public bool IsHighRisk { get; set; }
        public string? RiskCategory { get; set; }
        public string? RiskFactor { get; set; }
        public string? RiskDescription { get; set; }
        public string? ActionTaken { get; set; }
        public string? ReferralRequired { get; set; }
        public string? Notes { get; set; }
    }

    // ============================================================
    // High Risk Pregnancy
    // ============================================================

    public class HighRiskPregnancyDto
    {
        public int HighRiskPregnancyID { get; set; }
        public int PregnancyID { get; set; }
        public DateTime IdentificationDate { get; set; }
        public string RiskLevel { get; set; } = "";
        public string RiskReason { get; set; } = "";
        public string? ManagementPlan { get; set; }
        public string? SpecialistRequired { get; set; }
        public string? ReferralPlan { get; set; }
        public string? FollowUpFrequency { get; set; }
        public bool Active { get; set; }
        public DateTime? ResolvedDate { get; set; }
        public string? Outcome { get; set; }
        public string? Notes { get; set; }
        public int? ManagedByUserID { get; set; }
    }

    public class CreateHighRiskPregnancyDto
    {
        public int PregnancyID { get; set; }
        public string RiskLevel { get; set; } = "High";
        public string RiskReason { get; set; } = "";
        public string? ManagementPlan { get; set; }
        public string? SpecialistRequired { get; set; }
        public string? ReferralPlan { get; set; }
        public string? FollowUpFrequency { get; set; }
        public bool Active { get; set; } = true;
        public string? Notes { get; set; }
    }

    public class UpdateHighRiskPregnancyDto
    {
        public string RiskLevel { get; set; } = "High";
        public string RiskReason { get; set; } = "";
        public string? ManagementPlan { get; set; }
        public string? SpecialistRequired { get; set; }
        public string? ReferralPlan { get; set; }
        public string? FollowUpFrequency { get; set; }
        public bool Active { get; set; }
        public DateTime? ResolvedDate { get; set; }
        public string? Outcome { get; set; }
        public string? Notes { get; set; }
    }

    // ============================================================
    // Birth Preparedness
    // ============================================================

    public class BirthPreparednessDto
    {
        public int BirthPreparednessID { get; set; }
        public int PregnancyID { get; set; }
        public DateTime AssessmentDate { get; set; }
        public bool DeliveryFacilityIdentified { get; set; }
        public string? DeliveryFacility { get; set; }
        public bool TransportArranged { get; set; }
        public string? TransportPlan { get; set; }
        public bool BirthCompanionIdentified { get; set; }
        public bool EmergencyContactIdentified { get; set; }
        public bool FinancialPreparation { get; set; }
        public bool BloodDonorIdentified { get; set; }
        public string? EmergencyPlan { get; set; }
        public string? CounselingProvided { get; set; }
        public string? Notes { get; set; }
        public int? PreparedByUserID { get; set; }
    }

    public class CreateBirthPreparednessDto
    {
        public int PregnancyID { get; set; }
        public bool DeliveryFacilityIdentified { get; set; }
        public string? DeliveryFacility { get; set; }
        public bool TransportArranged { get; set; }
        public string? TransportPlan { get; set; }
        public bool BirthCompanionIdentified { get; set; }
        public bool EmergencyContactIdentified { get; set; }
        public bool FinancialPreparation { get; set; }
        public bool BloodDonorIdentified { get; set; }
        public string? EmergencyPlan { get; set; }
        public string? CounselingProvided { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateBirthPreparednessDto
    {
        public bool DeliveryFacilityIdentified { get; set; }
        public string? DeliveryFacility { get; set; }
        public bool TransportArranged { get; set; }
        public string? TransportPlan { get; set; }
        public bool BirthCompanionIdentified { get; set; }
        public bool EmergencyContactIdentified { get; set; }
        public bool FinancialPreparation { get; set; }
        public bool BloodDonorIdentified { get; set; }
        public string? EmergencyPlan { get; set; }
        public string? CounselingProvided { get; set; }
        public string? Notes { get; set; }
    }

    // ============================================================
    // Pregnancy Laboratory Order
    // ============================================================

    public class PregnancyLaboratoryOrderDto
    {
        public int PregnancyLaboratoryOrderID { get; set; }
        public int PregnancyID { get; set; }
        public int? ANCVisitID { get; set; }
        public int LaboratoryTestTypeID { get; set; }
        public string? LaboratoryTestTypeName { get; set; }
        public DateTime OrderDate { get; set; }
        public string? ClinicalReason { get; set; }
        public string Status { get; set; } = "";
        public string? Notes { get; set; }
        public int? OrderedByUserID { get; set; }
    }

    public class CreatePregnancyLaboratoryOrderDto
    {
        public int PregnancyID { get; set; }
        public int? ANCVisitID { get; set; }
        public int LaboratoryTestTypeID { get; set; }
        public string? ClinicalReason { get; set; }
        public string? Notes { get; set; }
    }

    // ============================================================
    // Pregnancy Ultrasound
    // ============================================================

    public class PregnancyUltrasoundDto
    {
        public int PregnancyUltrasoundID { get; set; }
        public int PregnancyID { get; set; }
        public int? ANCVisitID { get; set; }
        public DateTime ExaminationDate { get; set; }
        public int? GestationalAgeWeeks { get; set; }
        public string? FetalNumber { get; set; }
        public string? FetalPresentation { get; set; }
        public string? PlacentaLocation { get; set; }
        public string? AmnioticFluid { get; set; }
        public string? FetalHeartRate { get; set; }
        public string? EstimatedFetalWeight { get; set; }
        public string? Findings { get; set; }
        public string? Impression { get; set; }
        public string? Notes { get; set; }
        public int? RequestedByUserID { get; set; }
    }

    public class CreatePregnancyUltrasoundDto
    {
        public int PregnancyID { get; set; }
        public int? ANCVisitID { get; set; }
        public int? GestationalAgeWeeks { get; set; }
        public string? FetalNumber { get; set; }
        public string? FetalPresentation { get; set; }
        public string? PlacentaLocation { get; set; }
        public string? AmnioticFluid { get; set; }
        public string? FetalHeartRate { get; set; }
        public string? EstimatedFetalWeight { get; set; }
        public string? Findings { get; set; }
        public string? Impression { get; set; }
        public string? Notes { get; set; }
    }

    // ============================================================
    // Pregnancy Medication
    // ============================================================

    public class PregnancyMedicationDto
    {
        public int PregnancyMedicationID { get; set; }
        public int PregnancyID { get; set; }
        public int MedicineID { get; set; }
        public string? MedicineName { get; set; }
        public string? GenericName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Dosage { get; set; } = "";
        public string Frequency { get; set; } = "";
        public string Route { get; set; } = "";
        public string? Indication { get; set; }
        public string Status { get; set; } = "";
        public int? PrescribedByUserID { get; set; }
        public string? Notes { get; set; }
    }

    public class CreatePregnancyMedicationDto
    {
        public int PregnancyID { get; set; }
        public int MedicineID { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Dosage { get; set; } = "";
        public string Frequency { get; set; } = "";
        public string Route { get; set; } = "";
        public string? Indication { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdatePregnancyMedicationDto
    {
        public DateTime? EndDate { get; set; }
        public string Dosage { get; set; } = "";
        public string Frequency { get; set; } = "";
        public string Route { get; set; } = "";
        public string? Indication { get; set; }
        public string Status { get; set; } = "";
        public string? Notes { get; set; }
    }

    // ============================================================
    // Labor Record
    // ============================================================

    public class LaborRecordDto
    {
        public int LaborRecordID { get; set; }
        public int PregnancyID { get; set; }
        public DateTime AdmissionDate { get; set; }
        public DateTime? LaborStartDate { get; set; }
        public DateTime? MembraneRuptureDate { get; set; }
        public string? MembraneStatus { get; set; }
        public string? CervicalDilation { get; set; }
        public string? ContractionPattern { get; set; }
        public string? FetalHeartRate { get; set; }
        public string? LaborProgress { get; set; }
        public string? LaborManagement { get; set; }
        public string? DeliveryPlan { get; set; }
        public string? Notes { get; set; }
        public int? RecordedByUserID { get; set; }
    }

    public class LaborRecordDetailsDto
    {
        public int LaborRecordID { get; set; }
        public int PregnancyID { get; set; }
        public DateTime AdmissionDate { get; set; }
        public DateTime? LaborStartDate { get; set; }
        public DateTime? MembraneRuptureDate { get; set; }
        public string? MembraneStatus { get; set; }
        public string? CervicalDilation { get; set; }
        public string? ContractionPattern { get; set; }
        public string? FetalHeartRate { get; set; }
        public string? LaborProgress { get; set; }
        public string? LaborManagement { get; set; }
        public string? DeliveryPlan { get; set; }
        public string? Notes { get; set; }
        public int? RecordedByUserID { get; set; }
        public List<DeliveryDto> Deliveries { get; set; } = new();
    }

    public class CreateLaborRecordDto
    {
        public int PregnancyID { get; set; }
        public DateTime AdmissionDate { get; set; }
        public DateTime? LaborStartDate { get; set; }
        public DateTime? MembraneRuptureDate { get; set; }
        public string? MembraneStatus { get; set; }
        public string? CervicalDilation { get; set; }
        public string? ContractionPattern { get; set; }
        public string? FetalHeartRate { get; set; }
        public string? LaborProgress { get; set; }
        public string? LaborManagement { get; set; }
        public string? DeliveryPlan { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateLaborRecordDto
    {
        public DateTime? LaborStartDate { get; set; }
        public DateTime? MembraneRuptureDate { get; set; }
        public string? MembraneStatus { get; set; }
        public string? CervicalDilation { get; set; }
        public string? ContractionPattern { get; set; }
        public string? FetalHeartRate { get; set; }
        public string? LaborProgress { get; set; }
        public string? LaborManagement { get; set; }
        public string? DeliveryPlan { get; set; }
        public string? Notes { get; set; }
    }

    // ============================================================
    // Delivery
    // ============================================================

    public class DeliveryDto
    {
        public int DeliveryID { get; set; }
        public int PregnancyID { get; set; }
        public int? LaborRecordID { get; set; }
        public DateTime DeliveryDate { get; set; }
        public DeliveryMode DeliveryMode { get; set; }
        public string? DeliveryLocation { get; set; }
        public int? NumberOfBabies { get; set; }
        public string? MaternalCondition { get; set; }
        public string? PlacentaCondition { get; set; }
        public string? BloodLoss { get; set; }
        public string? DeliveryNotes { get; set; }
        public int? RecordedByUserID { get; set; }
    }

    public class DeliveryDetailsDto
    {
        public int DeliveryID { get; set; }
        public int PregnancyID { get; set; }
        public int? LaborRecordID { get; set; }
        public DateTime DeliveryDate { get; set; }
        public DeliveryMode DeliveryMode { get; set; }
        public string? DeliveryLocation { get; set; }
        public int? NumberOfBabies { get; set; }
        public string? MaternalCondition { get; set; }
        public string? PlacentaCondition { get; set; }
        public string? BloodLoss { get; set; }
        public string? DeliveryNotes { get; set; }
        public int? RecordedByUserID { get; set; }
        public List<DeliveryComplicationDto> Complications { get; set; } = new();
        public List<ChildBirthDto> ChildBirths { get; set; } = new();
    }

    public class CreateDeliveryDto
    {
        public int PregnancyID { get; set; }
        public int? LaborRecordID { get; set; }
        public DateTime DeliveryDate { get; set; }
        public DeliveryMode DeliveryMode { get; set; }
        public string? DeliveryLocation { get; set; }
        public int? NumberOfBabies { get; set; }
        public string? MaternalCondition { get; set; }
        public string? PlacentaCondition { get; set; }
        public string? BloodLoss { get; set; }
        public string? DeliveryNotes { get; set; }
    }

    public class UpdateDeliveryDto
    {
        public DateTime DeliveryDate { get; set; }
        public DeliveryMode DeliveryMode { get; set; }
        public string? DeliveryLocation { get; set; }
        public int? NumberOfBabies { get; set; }
        public string? MaternalCondition { get; set; }
        public string? PlacentaCondition { get; set; }
        public string? BloodLoss { get; set; }
        public string? DeliveryNotes { get; set; }
    }

    // ============================================================
    // Delivery Complication
    // ============================================================

    public class DeliveryComplicationDto
    {
        public int DeliveryComplicationID { get; set; }
        public int DeliveryID { get; set; }
        public string ComplicationType { get; set; } = "";
        public string? Description { get; set; }
        public string? Severity { get; set; }
        public string? Management { get; set; }
        public bool ReferralRequired { get; set; }
        public string? Outcome { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateDeliveryComplicationDto
    {
        public int DeliveryID { get; set; }
        public string ComplicationType { get; set; } = "";
        public string? Description { get; set; }
        public string? Severity { get; set; }
        public string? Management { get; set; }
        public bool ReferralRequired { get; set; }
        public string? Outcome { get; set; }
        public string? Notes { get; set; }
    }

    // ============================================================
    // Child Birth
    // ============================================================

    public class ChildBirthDto
    {
        public int ChildBirthID { get; set; }
        public int DeliveryID { get; set; }
        public int? ChildPatientID { get; set; }
        public string? Sex { get; set; }
        public DateTime BirthDate { get; set; }
        public string? BirthWeight { get; set; }
        public string? BirthLength { get; set; }
        public string? HeadCircumference { get; set; }
        public string? ApgarScore { get; set; }
        public string? BirthCondition { get; set; }
        public string? ResuscitationRequired { get; set; }
        public string? Notes { get; set; }
    }

    public class ChildBirthDetailsDto
    {
        public int ChildBirthID { get; set; }
        public int DeliveryID { get; set; }
        public int? ChildPatientID { get; set; }
        public PatientSummaryDto? ChildPatient { get; set; }
        public string? Sex { get; set; }
        public DateTime BirthDate { get; set; }
        public string? BirthWeight { get; set; }
        public string? BirthLength { get; set; }
        public string? HeadCircumference { get; set; }
        public string? ApgarScore { get; set; }
        public string? BirthCondition { get; set; }
        public string? ResuscitationRequired { get; set; }
        public string? Notes { get; set; }
        public List<NeonatalCareDto> NeonatalCare { get; set; } = new();
    }

    public class CreateChildBirthDto
    {
        public int DeliveryID { get; set; }
        public int? ChildPatientID { get; set; }
        public string? Sex { get; set; }
        public DateTime BirthDate { get; set; }
        public string? BirthWeight { get; set; }
        public string? BirthLength { get; set; }
        public string? HeadCircumference { get; set; }
        public string? ApgarScore { get; set; }
        public string? BirthCondition { get; set; }
        public string? ResuscitationRequired { get; set; }
        public string? Notes { get; set; }
    }

    // ============================================================
    // PNC Visit
    // ============================================================

    public class PNCVisitDto
    {
        public int PNCVisitID { get; set; }
        public int PregnancyID { get; set; }
        public int PatientVisitID { get; set; }
        public int? DeliveryID { get; set; }
        public DateTime VisitDate { get; set; }
        public int? DaysAfterDelivery { get; set; }
        public string? MaternalCondition { get; set; }
        public string? BleedingStatus { get; set; }
        public string? BreastfeedingStatus { get; set; }
        public string? UterusCondition { get; set; }
        public string? MentalHealthAssessment { get; set; }
        public string? CounselingProvided { get; set; }
        public string? FamilyPlanningCounseling { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? Notes { get; set; }
        public int? RecordedByUserID { get; set; }
    }

    public class PNCVisitListDto
    {
        public int PNCVisitID { get; set; }
        public int PregnancyID { get; set; }
        public int PatientVisitID { get; set; }
        public int PatientID { get; set; }
        public string PatientName { get; set; } = "";
        public string MRN { get; set; } = "";
        public int? DeliveryID { get; set; }
        public DateTime VisitDate { get; set; }
        public int? DaysAfterDelivery { get; set; }
        public string? MaternalCondition { get; set; }
        public string? BleedingStatus { get; set; }
        public string? BreastfeedingStatus { get; set; }
    }

    public class CreatePNCVisitDto
    {
        public int PregnancyID { get; set; }
        public int PatientVisitID { get; set; }
        public int? DeliveryID { get; set; }
        public int? DaysAfterDelivery { get; set; }
        public string? MaternalCondition { get; set; }
        public string? BleedingStatus { get; set; }
        public string? BreastfeedingStatus { get; set; }
        public string? UterusCondition { get; set; }
        public string? MentalHealthAssessment { get; set; }
        public string? CounselingProvided { get; set; }
        public string? FamilyPlanningCounseling { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdatePNCVisitDto
    {
        public int? DaysAfterDelivery { get; set; }
        public string? MaternalCondition { get; set; }
        public string? BleedingStatus { get; set; }
        public string? BreastfeedingStatus { get; set; }
        public string? UterusCondition { get; set; }
        public string? MentalHealthAssessment { get; set; }
        public string? CounselingProvided { get; set; }
        public string? FamilyPlanningCounseling { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? Notes { get; set; }
    }

    // ============================================================
    // Family Planning
    // ============================================================

    public class FamilyPlanningDto
    {
        public int FamilyPlanningID { get; set; }
        public int PatientID { get; set; }
        public int? PregnancyID { get; set; }
        public DateTime VisitDate { get; set; }
        public string? Method { get; set; }
        public string? MethodType { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? DiscontinuationDate { get; set; }
        public string? ReasonForDiscontinuation { get; set; }
        public string? CounselingProvided { get; set; }
        public string? SideEffects { get; set; }
        public string? Notes { get; set; }
        public int? ProvidedByUserID { get; set; }
    }

    public class CreateFamilyPlanningDto
    {
        public int? PregnancyID { get; set; }
        public string? Method { get; set; }
        public string? MethodType { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? DiscontinuationDate { get; set; }
        public string? ReasonForDiscontinuation { get; set; }
        public string? CounselingProvided { get; set; }
        public string? SideEffects { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateFamilyPlanningDto
    {
        public string? Method { get; set; }
        public string? MethodType { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? DiscontinuationDate { get; set; }
        public string? ReasonForDiscontinuation { get; set; }
        public string? CounselingProvided { get; set; }
        public string? SideEffects { get; set; }
        public string? Notes { get; set; }
    }
}