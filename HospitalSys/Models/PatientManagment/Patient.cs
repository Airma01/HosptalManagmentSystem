using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.AdultMedicalCare;
using HospitalSys.Models.BillingAndPayment;
using HospitalSys.Models.ChildHealth;
using HospitalSys.Models.Consultation_M;
using HospitalSys.Models.Inpatient;
using HospitalSys.Models.Laboratory;
using HospitalSys.Models.MaternalChildHealth;
using HospitalSys.Models.Pharmacy.Common;
using HospitalSys.Models.Radiology;
using HospitalSys.Models.ReferralManagement;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Models.PatientManagment
{
    public enum Gender
    {
        Male,
        Female
    }
    [Index(nameof(MRN), IsUnique = true)]
    [Index(nameof(FaydaFIN), IsUnique = true)]
    public class Patient{
        [Key]
        public int PatientID {get;set;}
        [Required]
        [MaxLength(30)]
        public string MRN { get; set; } = "";
        [MaxLength(12)]
        public string? FaydaFIN { get; set; }
        [MaxLength(100)]
        public string FirstName {get;set;} = "";
        [MaxLength(100)]
        public string LastName {get;set;} = "";
        public Gender Gender {get;set;}
        public DateTime DateOfBirth {get;set;}
        [MaxLength(20)]
        public string Phone {get;set;} = "";
        [MaxLength(100)]
        public string Address {get;set;} = "";
        [MaxLength(100)]
        public string EmergencyContact {get;set;} = "";
        public DateTime Created_at {get;set;} = DateTime.UtcNow;
        public List<PatientVisit> PatientVisit {get;set;} = new();
        public List<Appointment> Appointment {get;set;} = new();
        public List<MedicalHistory> MedicalHistory {get;set;} = new();
        public List<Prescription> Prescription {get;set;} = new();
        public List<Bill> Bill {get;set;} = new();
        public List<Admission> Admission {get;set;} = new();
        public List<LaboratoryTest> LaboratoryTest {get;set;} = new();
        public List<RadiologyRequest> RadiologyRequest {get;set;} = new();
        public List<PregnancyRegistration> PregnancyRegistrations { get; set; } = new();
        public List<Pregnancy> Pregnancies { get; set; } = new();
        public List<FamilyPlanning> FamilyPlanningRecords { get; set; } = new();
        public List<FamilyMember> FamilyMember {get;set;} = new();
        public List<FamilyMedicalHistory> FamilyMedicalHistories {get;set;} = new();
        public List<SocialHistory> SocialHistory {get;set;} = new();
        public List<ProblemList> ProblemList {get;set;} = new();
        public List<Allergy> Allergy {get;set;} = new();
        public List<DevelopmentAssessment> DevelopmentAssessment {get;set;} = new();
        public List<GrowthMonitoring> GrowthMonitoring {get;set;} = new();
        public List<Immunization> Immunization {get;set;} = new();
        public List<IMNCIEncounter> IMNCIEncounter {get;set;} = new();
        public List<NeonatalCare> NeonatalCare {get;set;} = new();
        public List<NutritionAssessment> NutritionAssessment {get;set;} = new();
        public List<AsthmaManagement> AsthmaManagement {get;set;} = new();
        public List<DiabetesManagement> DiabetesManagement {get;set;} = new();
        public List<HepatitisManagement> HepatitisManagement {get;set;} = new();
        public List<HIVCare> HIVCare {get;set;} = new();
        public List<HypertensionManagement> HypertensionManagement {get;set;} = new();
        public List<MentalHealthCare> MentalHealthCare {get;set;} = new();
        public List<TuberculosisManagement> TuberculosisManagement {get;set;} = new();
        public List<Referral> Referral {get;set;} = new();
    }
}