using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.CommunityHealth
{
    public class HomeVisit
    {
        [Key]
        public int HomeVisitID { get; set; }

        public int HouseholdID { get; set; }

        [ForeignKey(nameof(HouseholdID))]
        public Household? Household { get; set; }

        public int? HealthWorkerID { get; set; }

        public DateTime VisitDate { get; set; } = DateTime.UtcNow;

        public string? VisitPurpose { get; set; }

        public string? Observations { get; set; }

        public string? HealthEducationProvided { get; set; }

        public string? ServicesProvided { get; set; }

        public string? ProblemsIdentified { get; set; }

        public string? ReferralsMade { get; set; }

        public string? FollowUpRequired { get; set; }

        public DateTime? NextVisitDate { get; set; }

        public string? Notes { get; set; }

        public string Status { get; set; } = "Completed";
    }
}