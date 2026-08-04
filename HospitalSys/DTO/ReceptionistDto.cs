namespace HospitalSys.Dto
{
    public class RegisterReceptionistDto
    {
        public int UserID {get;set;}
    }
    public class ReceptionistLoginDto
    {
        public string username {get;set;} = ""; 
        public string Password {get;set;} = "";
        public string RoleName {get;set;} = "";
    }
    public class ReceptionistCookieDto
    {
        public string username {get;set;} = ""; 
        public string FullName {get;set;} = "";
        public List<string> RoleName {get;set;} = new List<string>();
    }
}