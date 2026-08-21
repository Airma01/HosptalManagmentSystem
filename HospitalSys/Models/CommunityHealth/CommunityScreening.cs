using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.CommunityHealth
{
    public class CommunityScreening
    {
        [Key]
        public int CommunityScreeningID { get; set; }

        public int? HouseholdID { get; set; }

        [ForeignKey(nameof(HouseholdID))]
        public Household? Household { get; set; }

        public int? PatientID { get; set; }

        public DateTime ScreeningDate { get; set; } = DateTime.UtcNow;

        public string ScreeningType { get; set; } = "";

        public string? ScreeningLocation { get; set; }

        public string? ScreeningResult { get; set; }

        public string? RiskIdentified { get; set; }

        public string? Symptoms { get; set; }

        public string? ActionTaken { get; set; }

        public string? ReferralRequired { get; set; }

        public int? HealthWorkerID { get; set; }

        public string? Notes { get; set; }
    }
}