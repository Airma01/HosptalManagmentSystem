using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models.BillingAndPayment
{
    public class BillItem
    {
        [Key]
        public int BillItemID {get;set;}
        public int BillID {get;set;}
        public Bill? Bill {get;set;}
        public string? ServiceName {get;set;}
        public int Quantity {get;set;}
        public double UnitPrice {get;set;}
        public double TotalPrice {get;set;}
    }
}