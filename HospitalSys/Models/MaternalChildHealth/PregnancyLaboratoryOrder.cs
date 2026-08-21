using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Laboratory;

namespace HospitalSys.Models.MaternalChildHealth
{
    public class PregnancyLaboratoryOrder
    {
        [Key]
        public int PregnancyLaboratoryOrderID { get; set; }

        public int PregnancyID { get; set; }

        [ForeignKey(nameof(PregnancyID))]
        public Pregnancy? Pregnancy { get; set; }

        public int? ANCVisitID { get; set; }

        [ForeignKey(nameof(ANCVisitID))]
        public ANCVisit? ANCVisit { get; set; }

        public int LaboratoryTestTypeID { get; set; }

        [ForeignKey(nameof(LaboratoryTestTypeID))]
        public LaboratoryTestType? LaboratoryTestType { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        public string? ClinicalReason { get; set; }

        public string Status { get; set; } = "Ordered";

        public string? Notes { get; set; }

        public int? OrderedByUserID { get; set; }
    }
}