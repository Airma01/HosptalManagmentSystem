using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models.HospitalStruct
{
    public class Ward
    {
        [Key]
        public int WardID {get;set;}
        [MaxLength(100)]
        public string WardName {get;set;} = "";
        public int Capacity {get;set;}

        public List<Room> Room {get;set;} = new();
    }
}