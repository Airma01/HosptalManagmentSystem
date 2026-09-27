namespace HospitalSys.DTO.Payment.Cashier
{
    public class UnpaidBillDto
    {
        public int BillID { get; set; }
        public int VisitID { get; set; }
        public int PatientID { get; set; }
        public string PatientName { get; set; } = "";
        public string MRN { get; set; } = "";
        public DateTime BillDate { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public string Status { get; set; } = "";
        public List<BillItemDto> Items { get; set; } = new();
    }

    public class BillItemDto
    {
        public int BillItemID { get; set; }
        public string ServiceName { get; set; } = "";
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
