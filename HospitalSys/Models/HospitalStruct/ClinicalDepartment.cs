using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.HospitalStruct
{
    public class ClinicalDepartment
    {
        [Key]
        public int ClinicalDepartmentID {get;set;}
        [MaxLength(100)]
        public string DepartmentName {get;set;} = "";
        [MaxLength(250)]
        public string Description {get;set;} = "";

        public List<Doctor> Doctor {get;set;} = new();
        public List<Nurse> Nurse{get;set;} = new();
        public List<Triage> Triage {get;set;} = new();
    }
}