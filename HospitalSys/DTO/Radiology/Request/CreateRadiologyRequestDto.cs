using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto.Radiology
{
    /// <summary>
    /// Used by Doctor (or system) to create a RadiologyRequest.
    /// Only properties that exist on Models.Radiology.RadiologyRequest.
    /// Status defaults on the entity; RequestDate defaults to UtcNow.
    /// </summary>
    public class CreateRadiologyRequestDto
    {
        [Required]
        public int ConsultationID { get; set; }

        [Required]
        public int PatientID { get; set; }

        [Required]
        public int DoctorID { get; set; }

        [Required]
        public int RadiologyTestTypeID { get; set; }

        /// <summary>
        /// Optional initial status (e.g. "Pending"). Entity default is empty string.
        /// </summary>
        [MaxLength(50)]
        public string? Status { get; set; }
    }
}
