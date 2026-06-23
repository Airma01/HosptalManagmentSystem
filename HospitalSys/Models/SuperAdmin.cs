using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models
{
    public enum AdminRole
    {
        Admin
    }
    public class SuperAdmins
    {
        [Key]
        public int ID {get;set;}
        [MaxLength(100)]
        public string Username {get;set;} = "";
        [MaxLength(200)] 
        public string HashPassword {get;set;} = "";
        [MaxLength(50)]
        public AdminRole AdminRole {get;set;}

    }
}