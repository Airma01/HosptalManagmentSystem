using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.CommunityHealth
{
    public class HouseholdMember
    {
        [Key]
        public int HouseholdMemberID { get; set; }

        public int HouseholdID { get; set; }

        [ForeignKey(nameof(HouseholdID))]
        public Household? Household { get; set; }

        public int? PatientID { get; set; }

        [ForeignKey(nameof(PatientID))]
        public Patient? Patient { get; set; }

        public string? RelationshipToHead { get; set; }

        public bool IsHouseholdHead { get; set; }

        public string? Occupation { get; set; }

        public string? EducationLevel { get; set; }

        public string? VulnerabilityStatus { get; set; }

        public string? Notes { get; set; }

        public DateTime JoinedDate { get; set; } = DateTime.UtcNow;

        public bool Active { get; set; } = true;
    }
}