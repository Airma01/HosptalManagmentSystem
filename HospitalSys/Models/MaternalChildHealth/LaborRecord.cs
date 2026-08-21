using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.MaternalChildHealth
{
    public class LaborRecord
    {
        [Key]
        public int LaborRecordID { get; set; }

        public int PregnancyID { get; set; }

        [ForeignKey(nameof(PregnancyID))]
        public Pregnancy? Pregnancy { get; set; }

        public DateTime AdmissionDate { get; set; }

        public DateTime? LaborStartDate { get; set; }

        public DateTime? MembraneRuptureDate { get; set; }

        public string? MembraneStatus { get; set; }

        public string? CervicalDilation { get; set; }

        public string? ContractionPattern { get; set; }

        public string? FetalHeartRate { get; set; }

        public string? LaborProgress { get; set; }

        public string? LaborManagement { get; set; }

        public string? DeliveryPlan { get; set; }

        public string? Notes { get; set; }

        public int? RecordedByUserID { get; set; }

        public List<Delivery> Deliveries { get; set; } = new();
    }
}