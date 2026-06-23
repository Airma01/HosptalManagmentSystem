using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.HospitalStruct
{
    public class Room
    {
        [Key]
        public int RoomID {get;set;}
        public int WardID {get;set;}
        [ForeignKey(nameof(WardID))]
        public Ward? Ward {get;set;}
        [MaxLength(200)]
        public string RoomNumber {get;set;} = "";
        [MaxLength(100)]
        public string RoomType {get;set;} = "";

        public List<Bed> Bed {get;set;} = new();
    }
}