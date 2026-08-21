using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.ChildHealth;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.MaternalChildHealth
{
    public class ChildBirth
    {
        [Key]
        public int ChildBirthID { get; set; }

        public int DeliveryID { get; set; }

        [ForeignKey(nameof(DeliveryID))]
        public Delivery? Delivery { get; set; }

        public int? ChildPatientID { get; set; }

        [ForeignKey(nameof(ChildPatientID))]
        public Patient? ChildPatient { get; set; }

        public string? Sex { get; set; }

        public DateTime BirthDate { get; set; }

        public string? BirthWeight { get; set; }

        public string? BirthLength { get; set; }

        public string? HeadCircumference { get; set; }

        public string? ApgarScore { get; set; }

        public string? BirthCondition { get; set; }

        public string? ResuscitationRequired { get; set; }

        public string? Notes { get; set; }

        public List<NeonatalCare> NeonatalCare {get;set;} = new();
    }
}