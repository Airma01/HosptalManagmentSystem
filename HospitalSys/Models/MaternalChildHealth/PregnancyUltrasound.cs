using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.MaternalChildHealth
{
    public class PregnancyUltrasound
    {
        [Key]
        public int PregnancyUltrasoundID { get; set; }

        public int PregnancyID { get; set; }

        [ForeignKey(nameof(PregnancyID))]
        public Pregnancy? Pregnancy { get; set; }

        public int? ANCVisitID { get; set; }

        [ForeignKey(nameof(ANCVisitID))]
        public ANCVisit? ANCVisit { get; set; }

        public DateTime ExaminationDate { get; set; } = DateTime.UtcNow;

        public int? GestationalAgeWeeks { get; set; }

        public string? FetalNumber { get; set; }

        public string? FetalPresentation { get; set; }

        public string? PlacentaLocation { get; set; }

        public string? AmnioticFluid { get; set; }

        public string? FetalHeartRate { get; set; }

        public string? EstimatedFetalWeight { get; set; }

        public string? Findings { get; set; }

        public string? Impression { get; set; }

        public string? Notes { get; set; }

        public int? RequestedByUserID { get; set; }
    }
}