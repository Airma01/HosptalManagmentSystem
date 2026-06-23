using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.HospitalStruct;
using HospitalSys.Models.PatientManagment;
namespace HospitalSys.Models
{
    public class Nurse
    {
        [Key]
        [Required]
        public int NurseID {get;set;}
         [Required]
        public int UserID {get;set;}
        [ForeignKey(nameof(UserID))]
        public Users? Users {get;set;}
        public int ClinicalDepartmentID {get;set;}
        [ForeignKey(nameof(ClinicalDepartmentID))]
        public ClinicalDepartment? ClinicalDepartment {get;set;}

        public List<Triage> Triage {get;set;} = new();

    }
}