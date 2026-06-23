using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.Laboratory
{
    public class LaboratoryTestType
    {
        [Key]
        public int LaboratoryTestTypeID {get;set;}
        public int LaboratorySectionID {get;set;}
        [ForeignKey(nameof(LaboratorySectionID))]
        public LaboratorySection? LaboratorySection {get;set;}
        public string TestName {get;set;} = "";
        public decimal Price {get;set;}
        public double NormalRange {get;set;}
        public string Description {get;set;} = "";
        public List<LaboratoryTest> LaboratoryTest {get;set;} = new();
    }
}