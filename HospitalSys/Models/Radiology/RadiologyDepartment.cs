using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models.Radiology
{
    public class RadiologyDepartment
    {
        [Key]
        public int RadiologyDepartmentID {get;set;}
        public string DepartmentName {get;set;} = "";
        public string Description {get;set;} = "";

        public List<RadiologyTestType> RadiologyTestType {get;set;} = new();
    }
}