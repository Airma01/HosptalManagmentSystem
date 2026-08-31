using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto.MLT
{
    /// <summary>
    /// Response / list item for LaboratorySection.
    /// </summary>
    public class MLTSectionResponseDto
    {
        public int LaboratorySectionID { get; set; }
        public string SectionName { get; set; } = "";
        public string Description { get; set; } = "";
        public int TestTypeCount { get; set; }
    }

    /// <summary>
    /// Section detail including nested test types.
    /// </summary>
    public class MLTSectionDetailDto
    {
        public int LaboratorySectionID { get; set; }
        public string SectionName { get; set; } = "";
        public string Description { get; set; } = "";
        public List<MLTTestTypeResponseDto> TestTypes { get; set; } = new();
    }

    /// <summary>
    /// Create LaboratorySection — maps to SectionName, Description.
    /// </summary>
    public class MLTSectionCreateDto
    {
        [Required]
        [MaxLength(100)]
        public string SectionName { get; set; } = "";

        public string? Description { get; set; }
    }

    /// <summary>
    /// Update LaboratorySection.
    /// </summary>
    public class MLTSectionUpdateDto
    {
        [Required]
        public int LaboratorySectionID { get; set; }

        [Required]
        [MaxLength(100)]
        public string SectionName { get; set; } = "";

        public string? Description { get; set; }
    }
}