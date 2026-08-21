using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.ChildHealth
{
    public class DevelopmentAssessment
    {
        [Key]
        public int DevelopmentAssessmentID { get; set; }

        public int PatientID { get; set; }

        [ForeignKey(nameof(PatientID))]
        public Patient? Patient { get; set; }

        public int? PatientVisitID { get; set; }

        [ForeignKey(nameof(PatientVisitID))]
        public PatientVisit? PatientVisit { get; set; }

        public DateTime AssessmentDate { get; set; } = DateTime.UtcNow;

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
}