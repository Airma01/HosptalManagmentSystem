using System.ComponentModel.DataAnnotations;

namespace HospitalSys.DTO.Payment.Radiology
{
    public class CreateRadiologyPaymentDto
    {
        [Required]
        public int RadiologyRequestID { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero")]
        public decimal AmountPaid { get; set; }

        [Required]
        [MaxLength(50)]
        public string PaymentMethod { get; set; } = "Cash";

        [MaxLength(100)]
        public string? TransactionReference { get; set; }

        [MaxLength(250)]
        public string? Notes { get; set; }
    }
}
