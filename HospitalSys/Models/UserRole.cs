using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models
{
    public class UserRole
    {
        [Key]
        public int UserRoleID {get;set;}
        public int UserID {get;set;}
        [ForeignKey(nameof(UserID))]
        public Users? Users {get;set;}
        public int RoleID {get;set;}
        [ForeignKey(nameof(RoleID))]
        public Role? Role {get;set;}
    }
}