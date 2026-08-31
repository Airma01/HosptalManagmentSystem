using System;
using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto.MLT
{
    /// <summary>
    /// Response shape matching LaboratoryResult entity.
    /// Technician identity is stored as TechnicianName (string) on the model;
    /// prefer setting it from the authenticated MLT claims in the controller.
    /// </summary>
    public class MLTResultResponseDto
    {
        public int ResultID { get; set; }
        public int TestID { get; set; }
        public string TechnicianName { get; set; } = "";
        public string ResultDescription { get; set; } = "";
        public DateTime ResultDate { get; set; }
    }

    /// <summary>
    /// Create a new LaboratoryResult.
    /// Do not accept arbitrary TechnicianName from the client if the controller
    /// derives it from the authenticated Laboratory Technician.
    /// </summary>
    public class MLTResultCreateDto
    {
        [Required]
        public int TestID { get; set; }

        [Required]
        public string ResultDescription { get; set; } = "";

        /// <summary>
        /// Optional; if omitted, controller should set ResultDate = UtcNow
        /// (same default as the entity).
        /// </summary>
        public DateTime? ResultDate { get; set; }
    }

    /// <summary>
    /// Update an existing LaboratoryResult.
    /// </summary>
    public class MLTResultUpdateDto
    {
        [Required]
        public int ResultID { get; set; }

        [Required]
        public string ResultDescription { get; set; } = "";

        public DateTime? ResultDate { get; set; }
    }
}