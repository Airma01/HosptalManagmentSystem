using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.HospitalStruct;

namespace HospitalSys.Models.PatientManagment
{
    public class Triage{

        [Key]
        public int TriageId {get;set;}
        public int VisitID {get;set;}
        [ForeignKey(nameof(VisitID))]
        public PatientVisit? PatientVisit{get;set;}
        public int NurseID {get;set;}
        [ForeignKey(nameof(NurseID))]
        public Nurse? Nurse {get;set;}
        public int TriageDepartmentID {get;set;}
        [ForeignKey(nameof(TriageDepartmentID))]
        public TriageDepartment? TriageDepartment {get;set;}
        public int ClinicalDepartmentID {get;set;}
        [ForeignKey(nameof(ClinicalDepartmentID))]
        public ClinicalDepartment? ClinicalDepartment {get;set;}
        public double Temprature {get;set;}
        public double BloodPressure {get;set;}
        public double HeartRate {get;set;}
        public double RespiratotyRate {get;set;}
        public double Weight {get;set;}
        public string Notes {get;set;} = "";
    }
}