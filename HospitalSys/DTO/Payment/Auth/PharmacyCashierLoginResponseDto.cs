namespace HospitalSys.DTO.Payment.Auth
{
    public class PharmacyCashierLoginResponseDto
    {
        public string Message { get; set; } = "";
        public int PharmacyCashierID { get; set; }
        public int UserID { get; set; }
        public string FullName { get; set; } = "";
        public string Username { get; set; } = "";
        public string Role { get; set; } = "PharmacyCashier";
        /// <summary>
        /// Pharmacy cashier can handle ALL branch pharmacies (no single branch restriction).
        /// </summary>
        public bool CanAccessAllBranches { get; set; } = true;
    }

    public class PharmacyCashierCookieDto
    {
        public string username { get; set; } = "";
        public string FullName { get; set; } = "";
        public int UserID { get; set; }
        public int PharmacyCashierID { get; set; }
    }
}
