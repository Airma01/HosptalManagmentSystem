using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Pharmacy.AidStore;
using HospitalSys.Models.Pharmacy.CentralStore;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;

namespace HospitalSys.Models
{
    public enum Gender
    {
        Male,
        Female
    }
    public class Users
    {
        [Key]
        [Required]
        public int UserID {get;set;}
        [MaxLength(100)]
        [Required]
        public string FirstName{get;set;} = "";
        [MaxLength(100)]
        [Required]
        public string FatherName{get;set;} = "";  
         [Required]
        public Gender Gender {get;set;}
        [MaxLength(20)]
         [Required]
         
        public string Phone {get;set;} = ""; 
        [MaxLength(100)]
        public string Email{get;set;} = "";
        [MaxLength(100)]
         [Required]
        public string Username{get;set;} = "";
       
        [MaxLength(250)]
         [Required]
        public string HashPassword {get;set;} = "";
        public int RoleID {get;set;}
        [ForeignKey(nameof(RoleID))]
        public Role? Role {get;set;}
        public bool IsActive {get;set;} = true;
        public DateTime Created_at {get;set;} = DateTime.UtcNow;

        public List<Doctor> Doctor {get;set;} = new();
        public List<Nurse> Nurse {get;set;} = new();
        public List<Receptionist> Receptionist {get;set;} = new();
        public List<Pharmacist> Pharmacist {get;set;} = new();
        public List<LaboratoryTechnician> LaboratoryTechnician {get;set;} = new();
        public List<RadiologyTechnician> RadiologyTechnician {get;set;} = new();
        public List<Cashier> Cashier {get;set;} = new();
        public List<PharmacyCashier> PharmacyCashier {get;set;} = new();
        public List<CentralStorePharmacy> CentralStorePharmacy {get;set;} = new();
        public List<AidStorePharmacy> AidStorePharmacy {get;set;} = new();
        public List<RadiologyCashier> RadiologyCashier {get;set;} = new();
        public List<LaboratoryCashier> LaboratoryCashier {get;set;} = new();
    }
}