using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.Consultation_M
{
    public class MedicalRecord
    {
        [Key]
        public int MedicalRecordID {get;set;}
        public int ConsultationID {get;set;}
        [ForeignKey(nameof(ConsultationID))]
        public Consultation? Consultation {get;set;}
        public int PatientID {get;set;}
        [ForeignKey(nameof(PatientID))]
        public Patient? Patient {get;set;}
        public int DoctorID {get;set;}
        [ForeignKey(nameof(DoctorID))]
        public Doctor? Doctor {get;set;}
        public DateTime RecordTime {get;set;} =DateTime.UtcNow;

    }
}