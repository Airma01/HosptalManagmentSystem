using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.HospitalStruct;

namespace HospitalSys.Models.PatientManagment
{
    public class Triage{

        [Key]
        public int TriageId {get;set;}
        public int VistID {get;set;}
        public PatientVist? PatientVist{get;set;}
        public int NurseID {get;set;}
        public Nurse? Nurse {get;set;}
        public int TriageDepartmentID {get;set;}
        public TriageDepartment? TriageDepartment {get;set;}
        public int ClinicalDepartmentID {get;set;}
        public ClinicalDepartment? ClinicalDepartment {get;set;}
        public double Temprature {get;set;}
        public double BloodPressure {get;set;}
        public double HeartRate {get;set;}
        public double RespiratotyRate {get;set;}
        public double Weight {get;set;}
        public string Notes {get;set;} = "";
    }
}