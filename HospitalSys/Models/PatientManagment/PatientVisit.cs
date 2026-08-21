using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.BillingAndPayment;
using HospitalSys.Models.ChildHealth;
using HospitalSys.Models.Consultation_M;
using HospitalSys.Models.MaternalChildHealth;
using HospitalSys.Models.ReferralManagement;

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
        public List<PNCVisit> PNCVisit {get;set;} = new();
        public List<ANCVisit> ANCVisit {get;set;} = new();

        public List<DevelopmentAssessment> DevelopmentAssessment {get;set;} = new();
        public List<GrowthMonitoring> GrowthMonitoring {get;set;} = new();
        public List<Immunization> Immunization {get;set;} = new();
        public List<IMNCIEncounter> IMNCIEncounter {get;set;} = new();
        public List<NeonatalCare> NeonatalCare {get;set;} = new();
        public List<NutritionAssessment> NutritionAssessment {get;set;} = new();
        public List<Referral> Referral {get;set;} = new();
    }
}