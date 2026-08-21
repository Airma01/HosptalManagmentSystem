using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Family;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.Family
{
    
}public class FamilyMember
{
    public long FamilyMemberId { get; set; }

    public long FamilyId { get; set; }

    public int PatientId { get; set; }

    public string Relationship { get; set; } = null!;

    public bool IsHeadOfHousehold { get; set; }

    public DateTime JoinedDate { get; set; }

    public DateTime? LeftDate { get; set; }
    [ForeignKey(nameof(FamilyId))]

    public Family Family { get; set; } = null!;
    [ForeignKey(nameof(PatientId))]

    public Patient Patient { get; set; } = null!;
}