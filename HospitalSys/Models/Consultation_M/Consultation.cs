namespace HospitalSys.Models.Consultation_M
{
   using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models;
using HospitalSys.Models.Laboratory;
using HospitalSys.Models.PatientManagment;
using HospitalSys.Models.Pharmacy.Common;
using HospitalSys.Models.Radiology;

public class Consultation
{
    [Key]
    public int ConsultationID { get; set; }

    public int VisitID { get; set; }

    [ForeignKey(nameof(VisitID))]
    public PatientVisit? PatientVisit { get; set; }

    public int DoctorID { get; set; }

    [ForeignKey(nameof(DoctorID))]
    public Doctor? Doctor { get; set; }

    public DateTime ConsultationDate { get; set; } = DateTime.UtcNow;

    // Current complaint
    public string ChiefComplaint { get; set; } = "";

    // History of current illness
    public string HistoryOfPresentIllness { get; set; } = "";

    // Clinical assessment
    public string? Assessment { get; set; }

    // Treatment / management
    public string? TreatmentPlan { get; set; }

    // General clinical notes
    public string? ClinicalNotes { get; set; }

    // Relationships
    public List<PhysicalExamination> PhysicalExaminations { get; set; } = new();

    public List<Diagnosis> Diagnose { get; set; } = new();

    public List<Prescription> Prescription { get; set; } = new();

    public List<LaboratoryTest> LaboratoryTest { get; set; } = new();

    public List<RadiologyRequest> RadiologyRequest { get; set; } = new();
} 
}
