using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.BillingAndPayment;
using HospitalSys.Models.Consultation_M;

namespace HospitalSys.Models.PatientManagment
{
    public class PatientVisit{

        [Key]
        public int VisitID {get;set;}
        public int PatientID {get;set;}
        [ForeignKey(nameof(PatientID))]
        public Patient? Patient {get;set;}
        public DateTime VisitDate {get;set;}
        public string VisitType {get;set;} = "";
        public string Status {get;set;} = "";
        public DateTime Created_at {get;set;} = DateTime.UtcNow;

        public List<Triage> Triage {get;set;} = new();
        public List<Consultation> Consultation {get;set;} = new();
        public List<Bill> Bill {get;set;} = new();
        

    }
}