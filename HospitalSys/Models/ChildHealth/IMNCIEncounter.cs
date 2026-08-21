using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.ChildHealth
{
    public class IMNCIEncounter
    {
        [Key]
        public int IMNCIEncounterID { get; set; }

        public int PatientID { get; set; }

        [ForeignKey(nameof(PatientID))]
        public Patient? Patient { get; set; }

        public int PatientVisitID { get; set; }

        [ForeignKey(nameof(PatientVisitID))]
        public PatientVisit? PatientVisit { get; set; }

        public DateTime EncounterDate { get; set; } = DateTime.UtcNow;

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
}