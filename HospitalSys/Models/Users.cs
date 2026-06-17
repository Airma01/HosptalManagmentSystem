using System.ComponentModel.DataAnnotations;
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
        public int UserID {get;set;}
        [MaxLength(100)]
        public string FirstName{get;set;} = "";
        [MaxLength(100)]
        public string FatherName{get;set;} = "";  
        public Gender Gender {get;set;}
        [MaxLength(20)]
        public string Phone {get;set;} = ""; 
        [MaxLength(100)]
        public string Email{get;set;} = "";
        [MaxLength(100)]
        public string Username{get;set;} = "";
       
        [MaxLength(250)]
        public string HashPassword {get;set;} = "";
        public int RoleID {get;set;}
        public Role? Role {get;set;}
        public bool IsActive {get;set;} = true;
        public DateTime Created_at {get;set;} = DateTime.UtcNow;

        public List<Doctor> Doctor {get;set;} = new();
        public List<Nurse> Nurse {get;set;} = new();
        public List<Receptionist> Receptionist {get;set;} = new();
        public List<Pharmacist> Pharmacist {get;set;} = new();
        public List<LaboratoryTechnician> LaboratoryTechnician {get;set;} = new();
        public List<Cashier> Cashier {get;set;} = new();
        public List<PharmacyCashier> PharmacyCashier {get;set;} = new();
        public List<CentralStorePharmacy> CentralStorePharmacy {get;set;} = new();
        public List<AidStorePharmacy> AidStorePharmacy {get;set;} = new();
       
    }
}