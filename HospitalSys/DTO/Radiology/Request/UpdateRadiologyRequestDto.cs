using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto.Radiology
{
    /// <summary>
    /// Used to update status or related fields on an existing RadiologyRequest.
    /// Only properties present on the model are included.
    /// </summary>
    public class UpdateRadiologyRequestDto
    {
        [Required]
        public int RadiologyRequestID { get; set; }

        /// <summary>
        /// Status values used by workflow (e.g. Pending, InProgress, Completed, Cancelled).
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "";
    }
}
