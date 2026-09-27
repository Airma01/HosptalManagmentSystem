namespace HospitalSys.DTO.Payment.Auth
{
    public class RadiologyCashierLoginResponseDto
    {
        public string Message { get; set; } = "";
        public int RadiologyCashierID { get; set; }
        public int UserID { get; set; }
        public string FullName { get; set; } = "";
        public string Username { get; set; } = "";
        public string Role { get; set; } = "RadiologyCashier";
    }

    public class RadiologyCashierCookieDto
    {
        public string username { get; set; } = "";
        public string FullName { get; set; } = "";
        public int UserID { get; set; }
        public int RadiologyCashierID { get; set; }
    }
}
