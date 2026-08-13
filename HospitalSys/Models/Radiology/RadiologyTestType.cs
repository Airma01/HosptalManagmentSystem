using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.Radiology
{
    public class RadiologyTestType
    {
        [Key]
        public int RadiologyTestTypeID {get;set;}
        public int RadiologyDepartmentID {get;set;}
        [ForeignKey(nameof(RadiologyDepartmentID))]
        public RadiologyDepartment? RadiologyDepartment {get;set;}
        public string TestName {get;set;} = "";
        public decimal Price {get;set;}
        public string Description {get;set;} = "";
        public List<RadiologyRequest> RadiologyRequest {get;set;} = new();
    }
}