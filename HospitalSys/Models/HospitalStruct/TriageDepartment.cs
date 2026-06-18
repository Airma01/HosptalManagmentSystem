using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.HospitalStruct
{
    public class TriageDepartment
    {
        [Key]
        public int TriageDepartmentID {get;set;}
        [MaxLength(100)]
        public string DepartmentName {get;set;} = "";
        [MaxLength(250)]
        public string Description {get;set;} = "";

        public List<Triage> Triage {get;set;} = new();
    }
}