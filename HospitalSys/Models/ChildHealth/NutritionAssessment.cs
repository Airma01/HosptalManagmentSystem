using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.ChildHealth
{
    public class NutritionAssessment
    {
        [Key]
        public int NutritionAssessmentID { get; set; }

        public int PatientID { get; set; }

        [ForeignKey(nameof(PatientID))]
        public Patient? Patient { get; set; }

        public int? PatientVisitID { get; set; }

        [ForeignKey(nameof(PatientVisitID))]
        public PatientVisit? PatientVisit { get; set; }

        public DateTime AssessmentDate { get; set; } = DateTime.UtcNow;

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
}