namespace HospitalSys.Dto
{
    public class RegisterDoctorDto
    {
        public int UserID {get;set;}
        public int ClinicalDepartmentID {get;set;}
        public string LicenseNumber {get;set;} = "";
    }

    public class DoctorLoginDto
    {
        public string Username {get;set;} = ""; 
        public string Password {get;set;} = "";    
    }

    public class DoctorCoockieDto
    {
        public string Username {get;set;} = ""; 

        public string FullName {get;set;} = "";
        public string Password {get;set;} = "";    
        public int RoleID {get;set;}
    }
}