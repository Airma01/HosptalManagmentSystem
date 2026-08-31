using System;
using System.Collections.Generic;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Dto.MLT
{
    /// <summary>
    /// Complete laboratory report for MLT / doctor view.
    /// Built from LaboratoryTest, LaboratoryResult, Patient, Doctor, TestType, Section.
    /// </summary>
    public class MLTReportDto
    {
        // Test
        public int TestID { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = "";

        // Patient
        public int PatientID { get; set; }
        public string PatientMRN { get; set; } = "";
        public string PatientName { get; set; } = "";
        public Gender? PatientGender { get; set; }
        public DateTime? PatientDateOfBirth { get; set; }
        public string? PatientPhone { get; set; }

        // Requesting doctor / department
        public int DoctorID { get; set; }
        public string? DoctorName { get; set; }
        public string? DepartmentName { get; set; }
        public int ConsultationID { get; set; }

        // Test type / section
        public int LaboratoryTestTypeID { get; set; }
        public string TestName { get; set; } = "";
        public string? TestDescription { get; set; }
        public double? NormalRange { get; set; }
        public decimal? Price { get; set; }
        public int? LaboratorySectionID { get; set; }
        public string? SectionName { get; set; }

        // Results (LaboratoryTest has List&lt;LaboratoryResult&gt;)
        public List<MLTResultResponseDto> Results { get; set; } = new();
    }

    /// <summary>
    /// Lighter report list item (e.g. completed tests for a patient or date range).
    /// </summary>
    public class MLTReportListDto
    {
        public int TestID { get; set; }
        public int PatientID { get; set; }
        public string PatientMRN { get; set; } = "";
        public string PatientName { get; set; } = "";
        public string TestName { get; set; } = "";
        public string? SectionName { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = "";
        public DateTime? LatestResultDate { get; set; }
        public string? LatestTechnicianName { get; set; }
    }
}