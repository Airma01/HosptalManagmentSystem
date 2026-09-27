namespace HospitalSys.DTO.Payment.Common
{
    public class PaymentResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public int? PaymentId { get; set; }
        public string ReceiptNumber { get; set; } = "";
        public decimal AmountPaid { get; set; }
        public string PaymentMethod { get; set; } = "";
        public DateTime PaymentDate { get; set; }
        public string? PatientName { get; set; }
        public string? MRN { get; set; }
    }
}
