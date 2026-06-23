using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.BillingAndPayment;

namespace HospitalSys.Models
{
    public class LaboratoryCashier
    {
        [Key]
        public int LaboratoryCashierID {get;set;}
        public int UserID {get;set;}
        [ForeignKey(nameof(UserID))]
        public Users? Users {get;set;}
        public List<LaboratoryPayment> LaboratoryPayments {get;set;} = new();
    }
}