using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.BillingAndPayment;
using HospitalSys.Models.Pharmacy.Branch;

namespace HospitalSys.Models
{
    public class PharmacyCashier
    {
        [Key]
        public int PharmacyCashierID {get;set;}
        public int UserID {get;set;}
        [ForeignKey(nameof(UserID))]
        public Users? Users {get;set;}
        public int BranchPharmacyID {get;set;}
        [ForeignKey(nameof(BranchPharmacyID))]
        public BranchPharmacy? BranchPharmacy {get;set;}

        public List<PharmacyPayment> PharmacyPayment {get;set;} = new();
    }
}