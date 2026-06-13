using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models
{
    public enum UserRole
    {
        Doctor,
        Nurse,
        Pharmacist
    }

    public enum Gender
    {
        Male,
        Female
    }

    public class Users
    {
        [Key]
        public int ID { get; set; }

        [MaxLength(100)]
        public string FirstName { get; set; } = "";

        [MaxLength(100)]
        public string FatherName { get; set; } = "";

        [MaxLength(100)]
        public string Username { get; set; } = "";

        [MaxLength(200)]
        public string HashPassword {get;set;} = "";
               
        public Gender Gender { get; set; }

        public UserRole UserRole { get; set; }

        [MaxLength(20)]
        public string PhoneNumber { get; set; } = "";
    }
}