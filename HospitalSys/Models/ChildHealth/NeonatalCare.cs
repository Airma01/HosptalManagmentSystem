using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;
using HospitalSys.Models.MaternalChildHealth;

namespace HospitalSys.Models.ChildHealth
{
    public class NeonatalCare
    {
        [Key]
        public int NeonatalCareID { get; set; }

        public int PatientID { get; set; }

        [ForeignKey(nameof(PatientID))]
        public Patient? Patient { get; set; }

        public int? ChildBirthID { get; set; }

        [ForeignKey(nameof(ChildBirthID))]
        public ChildBirth? ChildBirth { get; set; }

        public int? PatientVisitID { get; set; }

        [ForeignKey(nameof(PatientVisitID))]
        public PatientVisit? PatientVisit { get; set; }

        public DateTime AssessmentDate { get; set; } = DateTime.UtcNow;

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
}