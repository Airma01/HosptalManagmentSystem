using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.MaternalChildHealth
{
    public class DeliveryComplication
    {
        [Key]
        public int DeliveryComplicationID { get; set; }

        public int DeliveryID { get; set; }

        [ForeignKey(nameof(DeliveryID))]
        public Delivery? Delivery { get; set; }

        public string ComplicationType { get; set; } = "";

        public string? Description { get; set; }

        public string? Severity { get; set; }

        public string? Management { get; set; }

        public bool ReferralRequired { get; set; }

        public string? Outcome { get; set; }

        public string? Notes { get; set; }
    }
}