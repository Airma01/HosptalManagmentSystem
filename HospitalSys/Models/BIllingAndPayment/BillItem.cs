using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.BillingAndPayment
{
    public class BillItem
    {
        [Key]
        public int BillItemID {get;set;}
        public int BillID {get;set;}
        [ForeignKey(nameof(BillID))]
        public Bill? Bill {get;set;}
        public string ServiceName {get;set;} = "";
        public int Quantity {get;set;}
        public decimal UnitPrice {get;set;}
        public decimal TotalPrice {get;set;}
    }
}