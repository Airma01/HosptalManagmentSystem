using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models
{
    public class Receptionist
    {
        [Key]
        public int ReceptionistID {get;set;}
        public int UserID {get;set;}
        public Users? Users {get;set;}
    }
}