using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.BillingAndPayment
{
    public class PaymentHospital
    {
        [Key]
        public int PaymentID {get;set;}
        public int BillID {get;set;}
        [ForeignKey(nameof(BillID))]
        public Bill? Bill {get;set;}
        public int CashierID {get;set;}
        [ForeignKey(nameof(CashierID))]
        public Cashier? Cashier {get;set;}
        public decimal AmountPaid {get;set;}
        public string PaymentMethod {get;set;} = "";
        public DateTime PaymentDate {get;set;} = DateTime.UtcNow;
        public string PaymentStatus {get;set;} = "";
    }
}