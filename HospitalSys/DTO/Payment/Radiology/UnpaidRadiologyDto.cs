namespace HospitalSys.DTO.Payment.Radiology
{
    public class UnpaidRadiologyDto
    {
        public int RadiologyRequestID { get; set; }
        public int PatientID { get; set; }
        public string PatientName { get; set; } = "";
        public string MRN { get; set; } = "";
        public string ExamName { get; set; } = "";
        public decimal Price { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = "";
        public string DoctorName { get; set; } = "";
        public int? ConsultationID { get; set; }
    }
}
