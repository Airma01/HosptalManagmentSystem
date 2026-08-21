using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.MaternalChildHealth
{
    public class PregnancyRiskAssessment
    {
        [Key]
        public int PregnancyRiskAssessmentID { get; set; }

        public int PregnancyID { get; set; }

        [ForeignKey(nameof(PregnancyID))]
        public Pregnancy? Pregnancy { get; set; }

        public int? ANCVisitID { get; set; }

        [ForeignKey(nameof(ANCVisitID))]
        public ANCVisit? ANCVisit { get; set; }

        public DateTime AssessmentDate { get; set; } = DateTime.UtcNow;

        public bool IsHighRisk { get; set; }

        public string? RiskCategory { get; set; }

        public string? RiskFactor { get; set; }

        public string? RiskDescription { get; set; }

        public string? ActionTaken { get; set; }

        public string? ReferralRequired { get; set; }

        public string? Notes { get; set; }

        public int? AssessedByUserID { get; set; }
    }
}