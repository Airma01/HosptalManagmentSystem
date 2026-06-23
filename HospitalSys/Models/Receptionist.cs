using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models
{
    public class Receptionist
    {
        [Key]
        public int ReceptionistID {get;set;}
        public int UserID {get;set;}
        [ForeignKey(nameof(UserID))]
        public Users? Users {get;set;}
    }
}