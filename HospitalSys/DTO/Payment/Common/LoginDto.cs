using System.ComponentModel.DataAnnotations;

namespace HospitalSys.DTO.Payment.Common
{
    public class LoginDto
    {
        [Required]
        public string username { get; set; } = "";

        [Required]
        public string Password { get; set; } = "";
    }
}
