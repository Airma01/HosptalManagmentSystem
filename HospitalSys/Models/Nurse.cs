using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.HospitalStruct;
using HospitalSys.Models.PatientManagment;
namespace HospitalSys.Models
{
    public class Nurse
    {
        [Key]
        public int NurseID {get;set;}
        public int UserID {get;set;}
        public Users? Users {get;set;}
        public int ClinicalDepartmentID {get;set;}
        public ClinicalDepartment? ClinicalDepartment {get;set;}

        public List<Triage> Triage {get;set;} = new();

    }
}