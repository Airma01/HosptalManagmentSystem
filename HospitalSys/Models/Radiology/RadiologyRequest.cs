using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.BillingAndPayment;
using HospitalSys.Models.Consultation_M;
using HospitalSys.Models.Laboratory;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.Radiology
{
    public class RadiologyRequest
    {
        [Key]
        public int RadiologyRequestID {get;set;}
        public int ConsultationID {get;set;}
        [ForeignKey(nameof(ConsultationID))]
        public Consultation? Consultation {get;set;}
        public int PatientID {get;set;}
        [ForeignKey(nameof(PatientID))]
        public Patient? Patient {get;set;}
        public int DoctorID {get;set;}
        public Doctor? Doctor {get;set;}
        public int RadiologyTestTypeID {get;set;}
        public RadiologyTestType? RadiologyTestType {get;set;}
        public DateTime RequestDate {get;set;} = DateTime.UtcNow;
        [MaxLength(50)]
        public string Status {get;set;} = "";

        public List<RadiologyResult> RadiologyResult {get;set;} = new();
        public List<RadiologyPayment> RadiologyPayment {get;set;} = new();

    }
}