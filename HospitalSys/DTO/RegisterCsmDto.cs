namespace HospitalSys.Dtos
{
    public class RegisterCsmDto
    {
        public int UserID { get; set; }
        public int CentralPharmacyID { get; set; }
        public bool IsCurrent { get; set; } = true;
    }
}