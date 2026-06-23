using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models.Laboratory
{
    public class LaboratorySection
    {
        [Key]
        public int LaboratorySectionID {get;set;}
        [MaxLength(100)]
        public string SectionName {get;set;} = "";
        public string Description {get;set;} = "";

        public List<LaboratoryTestType> LaboratoryTestType {get;set;} = new();
    }
}