using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.MaternalChildHealth
{
    public class HighRiskPregnancy
    {
        [Key]
        public int HighRiskPregnancyID { get; set; }

        public int PregnancyID { get; set; }

        [ForeignKey(nameof(PregnancyID))]
        public Pregnancy? Pregnancy { get; set; }

        public DateTime IdentificationDate { get; set; } = DateTime.UtcNow;

        public string RiskLevel { get; set; } = "High";

        public string RiskReason { get; set; } = "";

        public string? ManagementPlan { get; set; }

        public string? SpecialistRequired { get; set; }

        public string? ReferralPlan { get; set; }

        public string? FollowUpFrequency { get; set; }

        public bool Active { get; set; } = true;

        public DateTime? ResolvedDate { get; set; }

        public string? Outcome { get; set; }

        public string? Notes { get; set; }

        public int? ManagedByUserID { get; set; }
    }
}