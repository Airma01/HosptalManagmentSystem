using System;
using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto.Radiology
{
    /// <summary>
    /// Basic / lightweight RadiologyRequest representation for lists and nesting.
    /// Maps to Models.Radiology.RadiologyRequest.
    /// Avoids full navigation graphs to prevent circular serialization.
    /// </summary>
    public class RadiologyRequestDto
    {
        public int RadiologyRequestID { get; set; }

        public int ConsultationID { get; set; }

        public int PatientID { get; set; }

        public string? PatientMRN { get; set; }

        public string? PatientName { get; set; }

        public int DoctorID { get; set; }

        public string? DoctorName { get; set; }

        public int RadiologyTestTypeID { get; set; }

        public string? TestName { get; set; }

        public string? DepartmentName { get; set; }

        public DateTime RequestDate { get; set; }

        public string Status { get; set; } = "";

        public bool HasResult { get; set; }
    }
}
