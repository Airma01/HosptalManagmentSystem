using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto.MLT
{
    /// <summary>
    /// Response for LaboratoryTestType (with optional section name).
    /// </summary>
    public class MLTTestTypeResponseDto
    {
        public int LaboratoryTestTypeID { get; set; }
        public int LaboratorySectionID { get; set; }
        public string? SectionName { get; set; }
        public string TestName { get; set; } = "";
        public decimal Price { get; set; }
        public double NormalRange { get; set; }
        public string Description { get; set; } = "";
    }

    /// <summary>
    /// Create LaboratoryTestType under an existing section.
    /// </summary>
    public class MLTTestTypeCreateDto
    {
        [Required]
        public int LaboratorySectionID { get; set; }

        [Required]
        public string TestName { get; set; } = "";

        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        public double NormalRange { get; set; }

        public string? Description { get; set; }
    }

    /// <summary>
    /// Update LaboratoryTestType (may move to another section).
    /// </summary>
    public class MLTTestTypeUpdateDto
    {
        [Required]
        public int LaboratoryTestTypeID { get; set; }

        [Required]
        public int LaboratorySectionID { get; set; }

        [Required]
        public string TestName { get; set; } = "";

        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        public double NormalRange { get; set; }

        public string? Description { get; set; }
    }
}