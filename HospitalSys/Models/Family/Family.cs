namespace HospitalSys.Models.Family
{
    public class Family
{
    public long FamilyId { get; set; }

    public string FamilyNumber { get; set; } = null!;

    public string? FamilyName { get; set; }

    public string? Address { get; set; }

    public string? HouseholdPhone { get; set; }

    public DateTime CreatedAt { get; set; }

    public List<FamilyMember> FamilyMember { get; set; } = new();
}
}