namespace HospitalSys.DTO.Payment.Auth
{
    public class LaboratoryCashierLoginResponseDto
    {
        public string Message { get; set; } = "";
        public int LaboratoryCashierID { get; set; }
        public int UserID { get; set; }
        public string FullName { get; set; } = "";
        public string Username { get; set; } = "";
        public string Role { get; set; } = "LaboratoryCashier";
    }

    public class LaboratoryCashierCookieDto
    {
        public string username { get; set; } = "";
        public string FullName { get; set; } = "";
        public int UserID { get; set; }
        public int LaboratoryCashierID { get; set; }
    }
}
