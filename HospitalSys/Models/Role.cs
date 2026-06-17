using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models
{
    public class Role
    {
        [Key]
        public int RoleID {get;set;}
        [MaxLength(200)]
        [Required]
        public string RoleName {get;set;} = "";
        public List<Users> Users {get;set;} = new();
    }
}