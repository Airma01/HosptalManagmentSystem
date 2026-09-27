namespace HospitalSys.DTO.Payment.Auth
{
    public class CashierLoginResponseDto
    {
        public string Message { get; set; } = "";
        public int CashierID { get; set; }
        public int UserID { get; set; }
        public string FullName { get; set; } = "";
        public string Username { get; set; } = "";
        public string Role { get; set; } = "Cashier";
    }

    public class CashierCookieDto
    {
        public string username { get; set; } = "";
        public string FullName { get; set; } = "";
        public int UserID { get; set; }
        public int CashierID { get; set; }
    }
}
