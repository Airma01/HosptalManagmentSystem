using System;

namespace HospitalSys.Dto.Radiology
{
    /// <summary>
    /// Basic / lightweight RadiologyResult representation.
    /// Maps to Models.Radiology.RadiologyResult (includes ImageName, ImagePath).
    /// </summary>
    public class RadiologyResultDto
    {
        public int RadiologyResultID { get; set; }

        public int RadiologyRequestID { get; set; }

        public string RadiologyTechnicianName { get; set; } = "";

        public string? ImageName { get; set; }

        public string? ImagePath { get; set; }

        public string ResultDescription { get; set; } = "";

        public DateTime ResultDate { get; set; }
    }
}
