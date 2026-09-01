using System;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Dto.Radiology
{
    /// <summary>
    /// Detailed result response for Radiologist / Doctor portals.
    /// Includes image fields and related request/patient/test context
    /// without circular navigation properties.
    /// Maps from Models.Radiology.RadiologyResult + RadiologyRequest navigations.
    /// </summary>
    public class RadiologyResultResponseDto
    {
        public int RadiologyResultID { get; set; }

        public int RadiologyRequestID { get; set; }

        public string RadiologyTechnicianName { get; set; } = "";

        public string? ImageName { get; set; }

        public string? ImagePath { get; set; }

        public string ResultDescription { get; set; } = "";

        public DateTime ResultDate { get; set; }

        // Request context
        public string? RequestStatus { get; set; }
        public DateTime? RequestDate { get; set; }

        // Patient
        public int? PatientID { get; set; }
        public string? PatientMRN { get; set; }
        public string? PatientName { get; set; }
        public Gender? PatientGender { get; set; }
        public DateTime? PatientDateOfBirth { get; set; }

        // Test
        public int? RadiologyTestTypeID { get; set; }
        public string? TestName { get; set; }
        public string? DepartmentName { get; set; }

        // Clinical indication (from Consultation via Request)
        public string? ChiefComplaint { get; set; }
        public string? HistoryOfPresentIllness { get; set; }
        public string? Assessment { get; set; }

        // Doctor who requested
        public int? DoctorID { get; set; }
        public string? DoctorName { get; set; }
    }
}
