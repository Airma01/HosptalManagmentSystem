using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto.Radiology
{
    /// <summary>
    /// Lightweight representation of RadiologyTestType.
    /// Maps to Models.Radiology.RadiologyTestType.
    /// RadiologyDepartment = category; RadiologyTestType = actual test (e.g. Pregnancy Ultrasound).
    /// </summary>
    public class RadiologyTestTypeDto
    {
        public int RadiologyTestTypeID { get; set; }

        public int RadiologyDepartmentID { get; set; }

        public string? DepartmentName { get; set; }

        public string TestName { get; set; } = "";

        public decimal Price { get; set; }

        public string Description { get; set; } = "";
    }

    /// <summary>
    /// Create a new RadiologyTestType under an existing department.
    /// </summary>
    public class CreateRadiologyTestTypeDto
    {
        [Required]
        public int RadiologyDepartmentID { get; set; }

        [Required]
        [MaxLength(200)]
        public string TestName { get; set; } = "";

        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        public string Description { get; set; } = "";
    }

    /// <summary>
    /// Update an existing RadiologyTestType.
    /// </summary>
    public class UpdateRadiologyTestTypeDto
    {
        [Required]
        public int RadiologyTestTypeID { get; set; }

        [Required]
        public int RadiologyDepartmentID { get; set; }

        [Required]
        [MaxLength(200)]
        public string TestName { get; set; } = "";

        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        public string Description { get; set; } = "";
    }
}
