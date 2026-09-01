using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.Radiology
{
    public class RadiologyResult
    {
        [Key]
        public int RadiologyResultID { get; set; }
        public int RadiologyRequestID {get;set;}
        [ForeignKey(nameof(RadiologyRequestID))]
        public RadiologyRequest? RadiologyRequest {get;set;}
        public string RadiologyTechnicianName {get;set;} = "";
        public string? ImageName { get; set; } = "";
        public string? ImagePath { get; set; } = "";
        public string ResultDescription {get;set;} = "";
        public DateTime ResultDate { get; set; } = DateTime.UtcNow;

    }
}