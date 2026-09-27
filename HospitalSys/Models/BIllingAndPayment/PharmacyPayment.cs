using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Pharmacy.Common;
using HospitalSys.Models;

namespace HospitalSys.Models.BillingAndPayment
{
    public class PharmacyPayment
    {
        [Key]
        public int PharmacyPaymentID { get; set; }

        public int PrescriptionID { get; set; }
        [ForeignKey(nameof(PrescriptionID))]
        public Prescription? Prescription { get; set; }

        /// <summary>Who collected payment (Users – role PharmacyCashier)</summary>
        public int UserID { get; set; }
        [ForeignKey(nameof(UserID))]
        public Users? User { get; set; }

        public decimal AmountPaid { get; set; }
        public string PaymentMethod { get; set; } = "";
        public DateTime PaymentDate { get; set; }
        public string PaymentStatus { get; set; } = "";
    }
}