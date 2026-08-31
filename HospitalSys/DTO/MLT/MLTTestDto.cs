using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto.MLT
{
    /// <summary>
    /// Full response for LaboratoryTest (entity + useful navigations).
    /// </summary>
    public class MLTTestResponseDto
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
        public decimal? Price { get; set; }
        public double? NormalRange { get; set; }
        public int? LaboratorySectionID { get; set; }
        public string? SectionName { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = "";
        public List<MLTResultResponseDto> Results { get; set; } = new();
    }

    /// <summary>
    /// Compact list item for LaboratoryTest.
    /// </summary>
    public class MLTTestListDto
    {
        public int TestID { get; set; }
        public int PatientID { get; set; }
        public string? PatientName { get; set; }
        public string? PatientMRN { get; set; }
        public string? TestName { get; set; }
        public string? SectionName { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = "";
        public bool HasResult { get; set; }
    }

    /// <summary>
    /// Update status of an existing LaboratoryTest (Status is string on the model).
    /// </summary>
    public class MLTTestUpdateStatusDto
    {
        [Required]
        public int TestID { get; set; }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "";
    }

    /// <summary>
    /// Laboratory test type for selection/display (from LaboratoryTestType).
    /// </summary>
    public class MLTTestTypeDto
    {
        public int LaboratoryTestTypeID { get; set; }
        public string TestName { get; set; } = "";
        public decimal Price { get; set; }
        public double NormalRange { get; set; }
        public string Description { get; set; } = "";
        public int LaboratorySectionID { get; set; }
        public string? SectionName { get; set; }
    }

    /// <summary>
    /// Laboratory section for filter/display (from LaboratorySection).
    /// </summary>
    public class MLTSectionDto
    {
        public int LaboratorySectionID { get; set; }
        public string SectionName { get; set; } = "";
        public string Description { get; set; } = "";
    }
}