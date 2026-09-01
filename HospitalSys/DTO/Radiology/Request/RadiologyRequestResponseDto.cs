using System;
using System.Collections.Generic;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Dto.Radiology
{
    /// <summary>
    /// Detailed response for Radiographer / Radiologist portals.
    /// Includes patient, doctor, test type, clinical context from Consultation,
    /// and lightweight results (with image info) without circular navigations.
    /// Maps from Models.Radiology.RadiologyRequest + related entities that exist.
    /// </summary>
    public class RadiologyRequestResponseDto
    {
        public int RadiologyRequestID { get; set; }

        public int ConsultationID { get; set; }

        // Patient (from Patient navigation)
        public int PatientID { get; set; }
        public string PatientMRN { get; set; } = "";
        public string? PatientFaydaFIN { get; set; }
        public string PatientFirstName { get; set; } = "";
        public string PatientLastName { get; set; } = "";
        public string PatientName => $"{PatientFirstName} {PatientLastName}".Trim();
        public Gender? PatientGender { get; set; }
        public DateTime? PatientDateOfBirth { get; set; }
        public string? PatientPhone { get; set; }

        // Doctor
        public int DoctorID { get; set; }
        public string? DoctorName { get; set; }

        // Test type / department
        public int RadiologyTestTypeID { get; set; }
        public string TestName { get; set; } = "";
        public string? TestDescription { get; set; }
        public decimal? Price { get; set; }
        public int? RadiologyDepartmentID { get; set; }
        public string? DepartmentName { get; set; }

        // Request meta
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = "";

        // Clinical context from Consultation (exists on model relationship)
        public string? ChiefComplaint { get; set; }
        public string? HistoryOfPresentIllness { get; set; }
        public string? Assessment { get; set; }
        public string? ClinicalNotes { get; set; }

        // Results (RadiologyRequest has List<RadiologyResult>)
        public List<RadiologyResultDto> Results { get; set; } = new();
    }
}
