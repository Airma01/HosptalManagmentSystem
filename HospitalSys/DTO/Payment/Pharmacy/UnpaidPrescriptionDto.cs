namespace HospitalSys.DTO.Payment.Pharmacy
{
    public class UnpaidPrescriptionDto
    {
        public int PrescriptionID { get; set; }
        public int PatientID { get; set; }
        public string PatientName { get; set; } = "";
        public string MRN { get; set; } = "";
        public DateTime PrescriptionDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "";
        public string DoctorName { get; set; } = "";
        public int BranchPharmacyID { get; set; }
        public string BranchName { get; set; } = "";
        public List<PrescriptionMedicineDto> Medicines { get; set; } = new();
    }

    public class PrescriptionMedicineDto
    {
        public string MedicineName { get; set; } = "";
        public decimal Quantity { get; set; }
        public string Dosage { get; set; } = "";
        public decimal? UnitPrice { get; set; }
        public decimal? LineTotal { get; set; }
    }
}
