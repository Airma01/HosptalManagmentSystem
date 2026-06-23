using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Laboratory;
using HospitalSys.Models.PatientManagment;
using HospitalSys.Models.Pharmacy.Common;
using HospitalSys.Models.Radiology;

namespace HospitalSys.Models.Consultation_M
{
    public class Consultation
    {
        [Key]
        public int ConsultationID {get;set;}
        public int VisitID {get;set;}
        [ForeignKey(nameof(VisitID))]
        public PatientVisit? PatientVisit {get;set;}
        public int DoctorID {get;set;}
        [ForeignKey(nameof(DoctorID))]
        public Doctor? Doctor {get;set;}
        public DateTime ConsultationDate {get;set;} = DateTime.UtcNow;
        public string ChiefComplaint {get;set;} = "";
        public string Diagnosis {get;set;} = "";
        public string TreatmentPlan {get;set;} = "";

        public List<MedicalRecord> MedicalRecord {get;set;} = new();
        public List<Prescription> Prescription {get;set;} = new();
        public List<LaboratoryTest> LaboratoryTest {get;set;} = new();
        public List<RadiologyRequest> RadiologyRequest {get;set;} = new();
    }
}