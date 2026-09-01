using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto.Radiology
{
    /// <summary>
    /// Lightweight representation of RadiologyDepartment (category).
    /// Maps to Models.Radiology.RadiologyDepartment.
    /// </summary>
    public class RadiologyDepartmentDto
    {
        public int RadiologyDepartmentID { get; set; }

        public string DepartmentName { get; set; } = "";

        public string Description { get; set; } = "";

        /// <summary>
        /// Optional count of test types under this department (for listing).
        /// </summary>
        public int TestTypeCount { get; set; }
    }

    /// <summary>
    /// Detail view including nested test types (avoids full circular navigation).
    /// </summary>
    public class RadiologyDepartmentDetailDto
    {
        public int RadiologyDepartmentID { get; set; }

        public string DepartmentName { get; set; } = "";

        public string Description { get; set; } = "";

        public List<RadiologyTestTypeDto> TestTypes { get; set; } = new();
    }

    /// <summary>
    /// Create a new RadiologyDepartment.
    /// </summary>
    public class CreateRadiologyDepartmentDto
    {
        [Required]
        [MaxLength(200)]
        public string DepartmentName { get; set; } = "";

        public string Description { get; set; } = "";
    }

    /// <summary>
    /// Update an existing RadiologyDepartment.
    /// </summary>
    public class UpdateRadiologyDepartmentDto
    {
        [Required]
        public int RadiologyDepartmentID { get; set; }

        [Required]
        [MaxLength(200)]
        public string DepartmentName { get; set; } = "";

        public string Description { get; set; } = "";
    }
}
