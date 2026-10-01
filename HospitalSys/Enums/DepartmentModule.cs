namespace HospitalSys.Enums
{
    /// <summary>
    /// Strongly-typed module identifiers for department-level permissions.
    /// Add new modules here; do not accept arbitrary strings from the client.
    /// </summary>
    public enum DepartmentModule
    {
        Consultation = 1,
        AdultMedicalCare = 2,
        MaternalChildHealth = 3,
        ChildHealth = 4,
        Laboratory = 5,
        Radiology = 6,
        Pharmacy = 7,
        Referral = 8,
        CommunityHealth = 9
    }
}
