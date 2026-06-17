using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.Consultation_M
{
    public class MedicalRecord
    {
        public int MedicalRecordID {get;set;}
        public int ConsultationID {get;set;}
        public Consultation? Consultation {get;set;}
        public int PatientID {get;set;}
        public Patient? Patient {get;set;}
        public int DoctorID {get;set;}
        public Doctor? Doctor {get;set;}
        public DateTime RecordTime {get;set;} =DateTime.UtcNow;

    }
}