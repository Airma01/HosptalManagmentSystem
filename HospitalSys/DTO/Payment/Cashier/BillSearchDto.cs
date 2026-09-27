namespace HospitalSys.DTO.Payment.Cashier
{
    public class BillSearchDto
    {
        public string? MRN { get; set; }
        public string? PatientName { get; set; }
        public int? VisitID { get; set; }
        public int? PatientID { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        /// <summary>Filter: Unpaid, Partial, Paid, Waived</summary>
        public string? Status { get; set; }
    }
}
