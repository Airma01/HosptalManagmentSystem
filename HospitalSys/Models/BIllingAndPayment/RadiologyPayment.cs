using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Radiology;
using HospitalSys.Models;

namespace HospitalSys.Models.BillingAndPayment
{
    public class RadiologyPayment
    {
        [Key]
        public int RadiologyPaymentID { get; set; }

        public int RadiologyRequestID { get; set; }
        [ForeignKey(nameof(RadiologyRequestID))]
        public RadiologyRequest? RadiologyRequest { get; set; }

        /// <summary>Who collected payment (Users – role RadiologyCashier)</summary>
        public int UserID { get; set; }
        [ForeignKey(nameof(UserID))]
        public Users? User { get; set; }

        public decimal AmountPaid { get; set; }
        public string PaymentMethod { get; set; } = "";
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
        public string PaymentStatus { get; set; } = "";
    }
}