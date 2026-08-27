using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.Laboratory
{
    public class LaboratoryResult
    {
        [Key]
        public int ResultID { get; set; }
        public int TestID {get;set;}
        [ForeignKey(nameof(TestID))]
        public LaboratoryTest? LaboratoryTest {get;set;}
        public string TechnicianName {get;set;} = "";
        public string ResultDescription {get;set;} = "";
        public DateTime ResultDate { get; set; } = DateTime.UtcNow;
    }
}