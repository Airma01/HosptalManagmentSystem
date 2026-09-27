namespace HospitalSys.DTO.Payment.Cashier
{
    public class TodayCollectionDto
    {
        public DateTime Date { get; set; }
        public int TotalTransactions { get; set; }
        public decimal TotalCollected { get; set; }
        public decimal CashTotal { get; set; }
        public decimal TelebirrTotal { get; set; }
        public decimal OtherTotal { get; set; }
        public List<TodayPaymentItemDto> Payments { get; set; } = new();
    }

    public class TodayPaymentItemDto
    {
        public int PaymentID { get; set; }
        public string ReceiptNumber { get; set; } = "";
        public string PatientName { get; set; } = "";
        public string MRN { get; set; } = "";
        public decimal AmountPaid { get; set; }
        public string PaymentMethod { get; set; } = "";
        public DateTime PaymentDate { get; set; }
        public string CashierName { get; set; } = "";
    }
}
