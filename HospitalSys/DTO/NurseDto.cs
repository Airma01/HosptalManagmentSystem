namespace HospitalSys.Dto
{
    public class RegisterNurseDto
    {
        public int UserID {get;set;}
        public int ClinicalDepartmentID {get;set;}
        
    }
    public class NurseLoginDto
    {
        public string username {get;set;} = ""; 
        public string Password {get;set;} = "";    
    }
    public class NurseCookieDto
    {
        public int NurseID {get;set;}
        public int UserID {get;set;}
        public string username {get;set;} = ""; 
        public string FullName {get;set;} = "";    
        public List<string> RoleName {get;set;} = new List<string>();
    }
}