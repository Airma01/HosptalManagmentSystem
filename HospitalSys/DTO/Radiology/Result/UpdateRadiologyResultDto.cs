using System;
using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto.Radiology
{
    /// <summary>
    /// Used to update result (e.g. Radiologist writes/finalizes impression,
    /// or Radiographer updates image / description).
    /// Only fields that exist on Models.Radiology.RadiologyResult.
    /// </summary>
    public class UpdateRadiologyResultDto
    {
        [Required]
        public int RadiologyResultID { get; set; }

        public string? RadiologyTechnicianName { get; set; }

        public string? ImageName { get; set; }

        public string? ImagePath { get; set; }

        public string? ResultDescription { get; set; }

        public DateTime? ResultDate { get; set; }
    }
}
