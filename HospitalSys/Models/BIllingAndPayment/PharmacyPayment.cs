using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.Pharmacy.Common;

namespace HospitalSys.Models.BillingAndPayment
{
    public class PharmacyPayment
    {
        [Key]
        public int PharmacyPaymentID {get;set;}
        public int PrescriptionID {get;set;}
        public Prescription? Prescription {get;set;}
        public int PharmacyCashierID {get;set;}
        public PharmacyCashier? PharmacyCashier {get;set;}
        public double AmountPaid {get;set;}
        public string PaymentMethod {get;set;} = "";
        public DateTime PaymentDate {get;set;}
        public string PaymentStatus {get;set;} = "";
        
    }
}