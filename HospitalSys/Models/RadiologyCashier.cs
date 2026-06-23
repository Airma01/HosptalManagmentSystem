using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.BillingAndPayment;

namespace HospitalSys.Models
{
    public class RadiologyCashier
    {
        [Key]
      public int RadiologyCashierID {get;set;}
      public int UserID {get;set;}
      [ForeignKey(nameof(UserID))]
      public Users? Users {get;set;}

      public List<RadiologyPayment> RadiologyPayment {get;set;} = new();  
    }
}