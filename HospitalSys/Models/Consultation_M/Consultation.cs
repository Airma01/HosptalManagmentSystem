using HospitalSys.Models.PatientManagment;
using HospitalSys.Models.Pharmacy.Common;

namespace HospitalSys.Models.Consultation_M
{
    public class Consultation
    {
        public int ConsultationID {get;set;}
        public int VisitID {get;set;}
        public PatientVist? PatientVist {get;set;}
        public int DoctorID {get;set;}
        public Doctor? Doctor {get;set;}
        public DateTime ConsultationDate {get;set;} = DateTime.UtcNow;
        public string ChiefComplaint {get;set;} = "";
        public string Diagnosis {get;set;} = "";
        public string TreatmentPlan {get;set;} = "";

        public List<MedicalRecord> MedicalRecord {get;set;} = new();
        public List<Prescription> Prescription {get;set;} = new();
    }
}