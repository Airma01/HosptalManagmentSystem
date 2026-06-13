// DTO/UsersDto.cs
using HospitalSys.Models;

namespace HospitalSys.Dto
{
    public class UsersDto
    {
        public string FirstName { get; set; } = "";

        public string FatherName { get; set; } = "";

        public string Username { get; set; } = "";

        public string Password { get; set; } = "";

        public Gender Gender { get; set; }
        public string PhoneNumber { get; set; } = "";
    }
}