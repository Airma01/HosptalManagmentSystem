namespace HospitalSys.Dto
{
    public class RadiographerLoginDto
    {
        public string Username { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class RadiographerAuthDto
    {
        public string Username { get; set; } = "";
        public string FullName { get; set; } = "";
        public string RoleName { get; set; } = "";
    }
}