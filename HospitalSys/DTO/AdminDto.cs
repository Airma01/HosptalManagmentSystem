using HospitalSys.Models;

namespace HospitalSys.Dto
{
    public class AdminDto
    {
        public string username {get;set;} = ""; 
        public string Password {get;set;} = "";    
        public AdminRole AdminRole {get;set;}
    }
}