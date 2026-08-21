using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto.Nurse
{
   // DTO/Nurse/NursePrescriptionDto.cs
public class CreateBasicPrescriptionDto
{
    [Required]
    public int PatientId { get; set; }

    [Required]
    public int BranchPharmacyId { get; set; }

    public DateTime PrescriptionDate { get; set; } = DateTime.UtcNow;
}

    public class UpdatePrescriptionDto
    {
        [Required]
        public int PrescriptionId { get; set; }

        public DateTime? PrescriptionDate { get; set; }
    }

    public class AddPrescriptionMedicineDto
    {
        [Required]
        public int PrescriptionId { get; set; }

        [Required]
        public int MedicineId { get; set; }

        [Required]
        public string Dosage { get; set; } = "";

        [Required]
        public decimal Frequency { get; set; }

        [Required]
        public decimal Duration { get; set; }

        [Required]
        public decimal Quantity { get; set; }
    }

    public class UpdatePrescriptionMedicineDto
    {
        [Required]
        public int PrescriptionDetailId { get; set; }

        public string? Dosage { get; set; }
        public decimal? Frequency { get; set; }
        public decimal? Duration { get; set; }
        public decimal? Quantity { get; set; }
    }

    public class PrescriptionMedicineDto
    {
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = "";
        public string GenericName { get; set; } = "";
        public string Dosage { get; set; } = "";
        public decimal Frequency { get; set; }
        public decimal Duration { get; set; }
        public decimal Quantity { get; set; }
        // Optionally include UnitPrice, but not required for nurse view
    }

    public class PrescriptionResponseDto
    {
        public int PrescriptionId { get; set; }
        public int PatientId { get; set; }
        public string? PatientName { get; set; }
        public int? DoctorId { get; set; }
        public string? DoctorName { get; set; }
        public int? ConsultationId { get; set; }
        public int BranchPharmacyId { get; set; }
        public DateTime PrescriptionDate { get; set; }
        public List<PrescriptionMedicineDto> Medicines { get; set; } = new();
    }
}