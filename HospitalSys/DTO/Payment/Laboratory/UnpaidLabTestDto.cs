namespace HospitalSys.DTO.Payment.Laboratory
{
    public class UnpaidLabTestDto
    {
        public int TestID { get; set; }
        public int PatientID { get; set; }
        public string PatientName { get; set; } = "";
        public string MRN { get; set; } = "";
        public string TestName { get; set; } = "";
        public decimal Price { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = "";
        public string DoctorName { get; set; } = "";
        public int? ConsultationID { get; set; }
    }
}
