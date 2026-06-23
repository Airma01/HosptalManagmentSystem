using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Laboratory;

namespace HospitalSys.Models
{
    public class LaboratoryTechnician
    {
        [Key]
        public int TechnicianID {get;set;}
        public int UserID {get;set;}
        [ForeignKey(nameof(UserID))]
        public Users? Users {get;set;}
        public List<LaboratoryResult> LaboratoryResult {get;set;} = new();
    }
}