// DTO/DoctorDto/ChildHealthDtos.cs
namespace HospitalSys.Dto.DoctorDtos
{
    // ============================================================
    // Neonatal Care
    // ============================================================

    public class NeonatalCareDto
    {
        public int NeonatalCareID { get; set; }
        public int PatientID { get; set; }
        public int? ChildBirthID { get; set; }
        public int? PatientVisitID { get; set; }
        public DateTime AssessmentDate { get; set; }
        public int? AgeInDays { get; set; }
        public string? GeneralCondition { get; set; }
        public string? FeedingStatus { get; set; }
        public string? BreastfeedingStatus { get; set; }
        public string? Temperature { get; set; }
        public string? RespiratoryRate { get; set; }
        public string? HeartRate { get; set; }
        public string? OxygenSaturation { get; set; }
        public string? JaundiceStatus { get; set; }
        public string? CordCondition { get; set; }
        public string? Weight { get; set; }
        public string? Length { get; set; }
        public string? HeadCircumference { get; set; }
        public bool ResuscitationRequired { get; set; }
        public string? NeonatalProblems { get; set; }
        public string? Treatment { get; set; }
        public string? CounselingProvided { get; set; }
        public string? ReferralRequired { get; set; }
        public string? Notes { get; set; }
        public int? RecordedByUserID { get; set; }
    }

    public class CreateNeonatalCareDto
    {
        public int? ChildBirthID { get; set; }
        public int? PatientVisitID { get; set; }
        public int? AgeInDays { get; set; }
        public string? GeneralCondition { get; set; }
        public string? FeedingStatus { get; set; }
        public string? BreastfeedingStatus { get; set; }
        public string? Temperature { get; set; }
        public string? RespiratoryRate { get; set; }
        public string? HeartRate { get; set; }
        public string? OxygenSaturation { get; set; }
        public string? JaundiceStatus { get; set; }
        public string? CordCondition { get; set; }
        public string? Weight { get; set; }
        public string? Length { get; set; }
        public string? HeadCircumference { get; set; }
        public bool ResuscitationRequired { get; set; }
        public string? NeonatalProblems { get; set; }
        public string? Treatment { get; set; }
        public string? CounselingProvided { get; set; }
        public string? ReferralRequired { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateNeonatalCareDto
    {
        public int? AgeInDays { get; set; }
        public string? GeneralCondition { get; set; }
        public string? FeedingStatus { get; set; }
        public string? BreastfeedingStatus { get; set; }
        public string? Temperature { get; set; }
        public string? RespiratoryRate { get; set; }
        public string? HeartRate { get; set; }
        public string? OxygenSaturation { get; set; }
        public string? JaundiceStatus { get; set; }
        public string? CordCondition { get; set; }
        public string? Weight { get; set; }
        public string? Length { get; set; }
        public string? HeadCircumference { get; set; }
        public bool ResuscitationRequired { get; set; }
        public string? NeonatalProblems { get; set; }
        public string? Treatment { get; set; }
        public string? CounselingProvided { get; set; }
        public string? ReferralRequired { get; set; }
        public string? Notes { get; set; }
    }

    // ============================================================
    // Growth Monitoring
    // ============================================================

    public class GrowthMonitoringDto
    {
        public int GrowthMonitoringID { get; set; }
        public int PatientID { get; set; }
        public int? PatientVisitID { get; set; }
        public DateTime MeasurementDate { get; set; }
        public int? AgeInMonths { get; set; }
        public decimal? WeightKg { get; set; }
        public decimal? HeightCm { get; set; }
        public decimal? LengthCm { get; set; }
        public decimal? HeadCircumferenceCm { get; set; }
        public decimal? MUACCm { get; set; }
        public decimal? BMI { get; set; }
        public decimal? WeightForAge { get; set; }
        public decimal? HeightForAge { get; set; }
        public decimal? WeightForHeight { get; set; }
        public string? GrowthStatus { get; set; }
        public string? GrowthInterpretation { get; set; }
        public string? CounselingProvided { get; set; }
        public string? ActionTaken { get; set; }
        public string? Notes { get; set; }
        public int? RecordedByUserID { get; set; }
    }

    public class CreateGrowthMonitoringDto
    {
        public int? PatientVisitID { get; set; }
        public int? AgeInMonths { get; set; }
        public decimal? WeightKg { get; set; }
        public decimal? HeightCm { get; set; }
        public decimal? LengthCm { get; set; }
        public decimal? HeadCircumferenceCm { get; set; }
        public decimal? MUACCm { get; set; }
        public decimal? BMI { get; set; }
        public decimal? WeightForAge { get; set; }
        public decimal? HeightForAge { get; set; }
        public decimal? WeightForHeight { get; set; }
        public string? GrowthStatus { get; set; }
        public string? GrowthInterpretation { get; set; }
        public string? CounselingProvided { get; set; }
        public string? ActionTaken { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateGrowthMonitoringDto
    {
        public int? AgeInMonths { get; set; }
        public decimal? WeightKg { get; set; }
        public decimal? HeightCm { get; set; }
        public decimal? LengthCm { get; set; }
        public decimal? HeadCircumferenceCm { get; set; }
        public decimal? MUACCm { get; set; }
        public decimal? BMI { get; set; }
        public decimal? WeightForAge { get; set; }
        public decimal? HeightForAge { get; set; }
        public decimal? WeightForHeight { get; set; }
        public string? GrowthStatus { get; set; }
        public string? GrowthInterpretation { get; set; }
        public string? CounselingProvided { get; set; }
        public string? ActionTaken { get; set; }
        public string? Notes { get; set; }
    }

    // ============================================================
    // Development Assessment
    // ============================================================

    public class DevelopmentAssessmentDto
    {
        public int DevelopmentAssessmentID { get; set; }
        public int PatientID { get; set; }
        public int? PatientVisitID { get; set; }
        public DateTime AssessmentDate { get; set; }
        public int? AgeInMonths { get; set; }
        public string? GrossMotor { get; set; }
        public string? FineMotor { get; set; }
        public string? Language { get; set; }
        public string? CognitiveDevelopment { get; set; }
        public string? SocialDevelopment { get; set; }
        public string? DevelopmentalMilestones { get; set; }
        public string? DevelopmentStatus { get; set; }
        public string? ConcernIdentified { get; set; }
        public string? ActionTaken { get; set; }
        public string? ReferralRequired { get; set; }
        public string? Notes { get; set; }
        public int? AssessedByUserID { get; set; }
    }

    public class CreateDevelopmentAssessmentDto
    {
        public int? PatientVisitID { get; set; }
        public int? AgeInMonths { get; set; }
        public string? GrossMotor { get; set; }
        public string? FineMotor { get; set; }
        public string? Language { get; set; }
        public string? CognitiveDevelopment { get; set; }
        public string? SocialDevelopment { get; set; }
        public string? DevelopmentalMilestones { get; set; }
        public string? DevelopmentStatus { get; set; }
        public string? ConcernIdentified { get; set; }
        public string? ActionTaken { get; set; }
        public string? ReferralRequired { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateDevelopmentAssessmentDto
    {
        public int? AgeInMonths { get; set; }
        public string? GrossMotor { get; set; }
        public string? FineMotor { get; set; }
        public string? Language { get; set; }
        public string? CognitiveDevelopment { get; set; }
        public string? SocialDevelopment { get; set; }
        public string? DevelopmentalMilestones { get; set; }
        public string? DevelopmentStatus { get; set; }
        public string? ConcernIdentified { get; set; }
        public string? ActionTaken { get; set; }
        public string? ReferralRequired { get; set; }
        public string? Notes { get; set; }
    }

    // ============================================================
    // Immunization
    // ============================================================

    public class ImmunizationDto
    {
        public int ImmunizationID { get; set; }
        public int PatientID { get; set; }
        public int? PatientVisitID { get; set; }
        public DateTime VaccinationDate { get; set; }
        public string VaccineName { get; set; } = "";
        public string? VaccineCode { get; set; }
        public string? Dose { get; set; }
        public string? DoseNumber { get; set; }
        public string? Route { get; set; }
        public string? AdministrationSite { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? VaccinationReason { get; set; }
        public string Status { get; set; } = "";
        public string? AdverseEvent { get; set; }
        public string? Notes { get; set; }
        public int? AdministeredByUserID { get; set; }
    }

    public class CreateImmunizationDto
    {
        public int? PatientVisitID { get; set; }
        public DateTime VaccinationDate { get; set; }
        public string VaccineName { get; set; } = "";
        public string? VaccineCode { get; set; }
        public string? Dose { get; set; }
        public string? DoseNumber { get; set; }
        public string? Route { get; set; }
        public string? AdministrationSite { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? VaccinationReason { get; set; }
        public string Status { get; set; } = "Given";
        public string? AdverseEvent { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateImmunizationDto
    {
        public DateTime VaccinationDate { get; set; }
        public string VaccineName { get; set; } = "";
        public string? VaccineCode { get; set; }
        public string? Dose { get; set; }
        public string? DoseNumber { get; set; }
        public string? Route { get; set; }
        public string? AdministrationSite { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? VaccinationReason { get; set; }
        public string Status { get; set; } = "";
        public string? AdverseEvent { get; set; }
        public string? Notes { get; set; }
    }

    // ============================================================
    // Nutrition Assessment
    // ============================================================

    public class NutritionAssessmentDto
    {
        public int NutritionAssessmentID { get; set; }
        public int PatientID { get; set; }
        public int? PatientVisitID { get; set; }
        public DateTime AssessmentDate { get; set; }
        public decimal? WeightKg { get; set; }
        public decimal? HeightCm { get; set; }
        public decimal? MUACCm { get; set; }
        public decimal? BMI { get; set; }
        public string? Appetite { get; set; }
        public string? FeedingHistory { get; set; }
        public string? BreastfeedingStatus { get; set; }
        public string? DietaryHistory { get; set; }
        public string? NutritionalStatus { get; set; }
        public string? MalnutritionClassification { get; set; }
        public string? Edema { get; set; }
        public string? CounselingProvided { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? ReferralRequired { get; set; }
        public string? Notes { get; set; }
        public int? AssessedByUserID { get; set; }
    }

    public class CreateNutritionAssessmentDto
    {
        public int? PatientVisitID { get; set; }
        public decimal? WeightKg { get; set; }
        public decimal? HeightCm { get; set; }
        public decimal? MUACCm { get; set; }
        public decimal? BMI { get; set; }
        public string? Appetite { get; set; }
        public string? FeedingHistory { get; set; }
        public string? BreastfeedingStatus { get; set; }
        public string? DietaryHistory { get; set; }
        public string? NutritionalStatus { get; set; }
        public string? MalnutritionClassification { get; set; }
        public string? Edema { get; set; }
        public string? CounselingProvided { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? ReferralRequired { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateNutritionAssessmentDto
    {
        public decimal? WeightKg { get; set; }
        public decimal? HeightCm { get; set; }
        public decimal? MUACCm { get; set; }
        public decimal? BMI { get; set; }
        public string? Appetite { get; set; }
        public string? FeedingHistory { get; set; }
        public string? BreastfeedingStatus { get; set; }
        public string? DietaryHistory { get; set; }
        public string? NutritionalStatus { get; set; }
        public string? MalnutritionClassification { get; set; }
        public string? Edema { get; set; }
        public string? CounselingProvided { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? ReferralRequired { get; set; }
        public string? Notes { get; set; }
    }

    // ============================================================
    // IMNCI Encounter
    // ============================================================

    public class IMNCIEncounterDto
    {
        public int IMNCIEncounterID { get; set; }
        public int PatientID { get; set; }
        public int PatientVisitID { get; set; }
        public DateTime EncounterDate { get; set; }
        public int? AgeInMonths { get; set; }
        public string? MainSymptoms { get; set; }
        public string? GeneralDangerSigns { get; set; }
        public string? CoughClassification { get; set; }
        public string? DiarrheaClassification { get; set; }
        public string? FeverClassification { get; set; }
        public string? EarProblemClassification { get; set; }
        public string? MalnutritionClassification { get; set; }
        public string? AnemiaClassification { get; set; }
        public string? ImmunizationStatus { get; set; }
        public string? FeedingAssessment { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? CounselingProvided { get; set; }
        public string? ReferralDecision { get; set; }
        public string? FollowUpPlan { get; set; }
        public string? Notes { get; set; }
        public int? AssessedByUserID { get; set; }
    }

    public class CreateIMNCIEncounterDto
    {
        public int PatientVisitID { get; set; }
        public int? AgeInMonths { get; set; }
        public string? MainSymptoms { get; set; }
        public string? GeneralDangerSigns { get; set; }
        public string? CoughClassification { get; set; }
        public string? DiarrheaClassification { get; set; }
        public string? FeverClassification { get; set; }
        public string? EarProblemClassification { get; set; }
        public string? MalnutritionClassification { get; set; }
        public string? AnemiaClassification { get; set; }
        public string? ImmunizationStatus { get; set; }
        public string? FeedingAssessment { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? CounselingProvided { get; set; }
        public string? ReferralDecision { get; set; }
        public string? FollowUpPlan { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateIMNCIEncounterDto
    {
        public int? AgeInMonths { get; set; }
        public string? MainSymptoms { get; set; }
        public string? GeneralDangerSigns { get; set; }
        public string? CoughClassification { get; set; }
        public string? DiarrheaClassification { get; set; }
        public string? FeverClassification { get; set; }
        public string? EarProblemClassification { get; set; }
        public string? MalnutritionClassification { get; set; }
        public string? AnemiaClassification { get; set; }
        public string? ImmunizationStatus { get; set; }
        public string? FeedingAssessment { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? CounselingProvided { get; set; }
        public string? ReferralDecision { get; set; }
        public string? FollowUpPlan { get; set; }
        public string? Notes { get; set; }
    }
}