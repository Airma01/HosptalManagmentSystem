using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Pharmacy.Branch;

namespace HospitalSys.Models.Pharmacy.Common
{
    public class DispenseMedicine
    {
        [Key]
        public int DispenseID {get;set;}
        public int PrescriptionID {get;set;}
        [ForeignKey(nameof(PrescriptionID))]
        public Prescription? Prescription {get;set;}
        public int BranchPharmacyID {get;set;}
        [ForeignKey(nameof(BranchPharmacyID))]
        public BranchPharmacy? BranchPharmacy {get;set;}
        public int PharmacistID {get;set;}
        [ForeignKey(nameof(PharmacistID))]
        public Pharmacist? Pharmacist {get;set;}
        public DateTime DispenceDate {get;set;} = DateTime.UtcNow;

        public List<DispenseMedicineDetail> DispenseMedicineDetails {get;set;} = new();
    }
}