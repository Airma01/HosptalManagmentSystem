using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.BillingAndPayment;
using HospitalSys.Models.Consultation_M;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.Laboratory
{
    public class LaboratoryTest
    {
        [Key]
        public int TestID {get;set;}
        public int ConsultationID {get;set;}
        [ForeignKey(nameof(ConsultationID))]
        public Consultation? Consultation {get;set;}
        [Required]
        public int PatientID {get;set;}
        [ForeignKey(nameof(PatientID))]
        public Patient? Patient {get;set;}
        [Required]
        public int DoctorID {get;set;}
        [ForeignKey(nameof(DoctorID))]
        public Doctor? Doctor {get;set;}
         [Required]
        public int LaboratoryTestTypeID {get;set;}
        [ForeignKey(nameof(LaboratoryTestTypeID))]
        public LaboratoryTestType? LaboratoryTestType {get;set;}
        public DateTime RequestDate {get;set;} = DateTime.UtcNow;
        [MaxLength(50)]
        public string Status {get;set;} = "";

        public List<LaboratoryResult> LaboratoryResult {get;set;} = new();
        public List<LaboratoryPayment> LaboratoryPayments {get;set;} = new();

    }
}