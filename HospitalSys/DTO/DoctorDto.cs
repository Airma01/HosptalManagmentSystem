namespace HospitalSys.Dto
{
    public class RegisterDoctorDto
    {
        public int UserID {get;set;}
        public int ClinicalDepartmentID {get;set;}
        public string LicenseNumber {get;set;} = "";
    }
}