using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.AdultMedicalCare
{
    public class MentalHealthCare
    {
        [Key]
        public int MentalHealthCareID { get; set; }

        public int PatientID { get; set; }

        [ForeignKey(nameof(PatientID))]
        public Patient? Patient { get; set; }

        public DateTime AssessmentDate { get; set; } = DateTime.UtcNow;

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

        public int? AssessedByUserID { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}