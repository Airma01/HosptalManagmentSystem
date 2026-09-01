using System;
using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto.Radiology
{
    /// <summary>
    /// Used by Radiographer after performing examination and uploading image.
    /// ImageName / ImagePath are stored on the existing RadiologyResult model.
    /// RadiologyTechnicianName should preferably be set from authenticated claims
    /// in the controller rather than trusted from the client.
    /// </summary>
    public class CreateRadiologyResultDto
    {
        [Required]
        public int RadiologyRequestID { get; set; }

        /// <summary>
        /// Optional; controller can override from JWT claims (Radiographer full name).
        /// </summary>
        public string? RadiologyTechnicianName { get; set; }

        public string? ImageName { get; set; }

        public string? ImagePath { get; set; }

        public string ResultDescription { get; set; } = "";

        /// <summary>
        /// Optional; defaults to UtcNow on the entity if omitted.
        /// </summary>
        public DateTime? ResultDate { get; set; }
    }
}
