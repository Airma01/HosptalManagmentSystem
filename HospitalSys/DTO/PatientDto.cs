using System.ComponentModel.DataAnnotations;
using HospitalSys.Models;

namespace HospitalSys.DTO
{
    public class PatientDto
{
    [Required]
    public string FirstName { get; set; }
    [Required]
    public string LastName { get; set; }
    [Required]
    public DateTime DateOfBirth { get; set; }
    [Required]
    public Gender Gender { get; set; } // enum
    [Required]
    public string Phone { get; set; }
    public string Address { get; set; }
    public string EmergencyContact { get; set; }
}

    public class PatientVisitDto
    {
       public int VisitID {get;set;}
        public int PatientID {get;set;}
        public DateTime VisitDate {get;set;}
        public string VisitType {get;set;} = "";
        public string Status {get;set;} = "";

    }
}