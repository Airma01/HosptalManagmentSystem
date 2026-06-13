using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models
{
    public enum AdminRole
    {
        SuperAdmin
    }
    public class SuperAdmins
    {
        [Key]
        public int ID {get;set;}
        [MaxLength(100)]
        public string username {get;set;} = "";
        [MaxLength(200)] 
        public string HashPassword {get;set;} = "";
        [MaxLength(50)]
        public AdminRole AdminRole {get;set;}

    }
}