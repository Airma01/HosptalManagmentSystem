using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Radiology;

namespace HospitalSys.Models
{
    public class RadiologyTechnician
    {
        [Key]
        public int RadiologyTechnicianID {get;set;}
        public int UserID {get;set;}
        [ForeignKey(nameof(UserID))]
        public Users? Users {get;set;}

        public List<RadiologyResult> RadiologyResult {get;set;} = new();

    }
}