using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models.BillingAndPayment
{
    public class PaymentHospital
    {
        [Key]
        public int PaymentID {get;set;}
        public int BillID {get;set;}
        public Bill? Bill {get;set;}
        public int CashierID {get;set;}
        public Cashier? Cashier {get;set;}
        public double AmountPaid {get;set;}
        public string PaymentMethod {get;set;} = "";
        public DateTime PaymentDate {get;set;} = DateTime.UtcNow;
        public string PaymentStatus {get;set;} = "";
    }
}