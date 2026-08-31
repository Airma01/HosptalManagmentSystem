using System;

namespace HospitalSys.Dto.MLT
{
    /// <summary>
    /// Laboratory work queue item based on LaboratoryTest + related navigations.
    /// </summary>
    public class MLTQueueDto
    {
        public int TestID { get; set; }
        public int ConsultationID { get; set; }
        public int PatientID { get; set; }
        public string? PatientMRN { get; set; }
        public string? PatientName { get; set; }
        public int DoctorID { get; set; }
        public string? DoctorName { get; set; }
        public string? DepartmentName { get; set; }
        public int LaboratoryTestTypeID { get; set; }
        public string? TestName { get; set; }
        public int? LaboratorySectionID { get; set; }
        public string? SectionName { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = "";
        public bool HasResult { get; set; }
        public DateTime? ResultDate { get; set; }
    }

    /// <summary>
    /// Optional filter for queue endpoints (maps to existing LaboratoryTest fields).
    /// </summary>
    public class MLTQueueFilterDto
    {
        public string? Status { get; set; }
        public int? LaboratorySectionID { get; set; }
        public int? LaboratoryTestTypeID { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int? PatientID { get; set; }
        public string? PatientMRN { get; set; }
    }
}