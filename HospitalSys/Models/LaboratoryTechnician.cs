using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models
{
    public class LaboratoryTechnician
    {
        [Key]
        public int TechnicianID {get;set;}
        public int UserID {get;set;}
        public Users? Users {get;set;}
    }
}