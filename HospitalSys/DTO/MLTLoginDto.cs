namespace HospitalSys.Dto
{
    public class MLTLoginDto
    {
        public string Username { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class MLTAuthDto
    {
        public string Username { get; set; } = "";
        public string FullName { get; set; } = "";
        public string RoleName { get; set; } = "";
    }
}