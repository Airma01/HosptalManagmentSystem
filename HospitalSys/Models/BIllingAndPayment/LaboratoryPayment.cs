using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Laboratory;

namespace HospitalSys.Models.BillingAndPayment
{
    public class LaboratoryPayment
    {
        [Key]
        public int LaboratoryPaymentID {get;set;}
        public int TestID {get;set;}
        [ForeignKey(nameof(TestID))]
        public LaboratoryTest? LaboratoryTest {get;set;}
        public int LaboratoryCashierID {get;set;}
        [ForeignKey(nameof(LaboratoryCashierID))]
        public LaboratoryCashier? LaboratoryCashier {get;set;}
        public decimal AmountPaid {get;set;}
        public string PaymentMethod {get;set;} = "";
        public DateTime PaymentDate {get;set;} = DateTime.UtcNow;
        public string PaymentStatus {get;set;} = "";
    }
}