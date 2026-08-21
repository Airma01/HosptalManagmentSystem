using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dtos.Nurse
{
    // ============================================================
    // 1. DTO for requesting a laboratory test (nurse creates)
    // ============================================================
    public class NurseLaboratoryRequestDto
    {
        [Required]
        public int ConsultationId { get; set; }   // FK to Consultation (required)

        [Required]
        public int PatientId { get; set; }        // FK to Patient

        [Required]
        public int DoctorId { get; set; }         // FK to Doctor (ordering physician)

        [Required]
        public int LaboratoryTestTypeId { get; set; } // FK to LaboratoryTestType

        // Status can be set by the system; if provided, must be ≤50 chars
        [MaxLength(50)]
        public string? Status { get; set; }

        // RequestDate is auto-set in the model, but allow override if needed
        public DateTime? RequestDate { get; set; }
    }

    // ============================================================
    // 2. Response DTO for a single laboratory test (full details)
    // ============================================================
    public class NurseLaboratoryTestResponseDto
    {
        public int TestId { get; set; }
        public int ConsultationId { get; set; }
        public int PatientId { get; set; }
        public string? PatientMrn { get; set; }
        public string? PatientName { get; set; }         // FirstName + LastName
        public int DoctorId { get; set; }
        public string? DoctorName { get; set; }          // from Users navigation
        public int LaboratoryTestTypeId { get; set; }
        public string? TestTypeName { get; set; }
        public int? LaboratorySectionId { get; set; }    // from LaboratoryTestType
        public string? SectionName { get; set; }         // from LaboratorySection
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = "";

        // Result information (if available)
        public NurseLaboratoryResultResponseDto? Result { get; set; }
    }

    // ============================================================
    // 3. DTO for listing laboratory tests (compact view)
    // ============================================================
    public class NurseLaboratoryTestListDto
    {
        public int TestId { get; set; }
        public int PatientId { get; set; }
        public string? PatientName { get; set; }
        public string? PatientMrn { get; set; }
        public string? TestTypeName { get; set; }
        public string? SectionName { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = "";
        public bool HasResult { get; set; }  // computed from navigation
    }

    // ============================================================
    // 4. DTO for laboratory test types (selection dropdown)
    // ============================================================
    public class NurseLaboratoryTestTypeDto
    {
        public int LaboratoryTestTypeId { get; set; }
        public string TestName { get; set; } = "";
        public decimal Price { get; set; }
        public string? Description { get; set; }
        public int LaboratorySectionId { get; set; }
        public string? SectionName { get; set; }  // flattened from Section
    }

    // ============================================================
    // 5. DTO for laboratory sections (selection/filter)
    // ============================================================
    public class NurseLaboratorySectionDto
    {
        public int LaboratorySectionId { get; set; }
        public string SectionName { get; set; } = "";
        public string? Description { get; set; }
    }

    // ============================================================
    // 6. DTO for laboratory results (read‑only for nurse)
    // ============================================================
    public class NurseLaboratoryResultResponseDto
    {
        public int ResultId { get; set; }
        public int TestId { get; set; }
        public int TechnicianId { get; set; }
        public string? TechnicianName { get; set; }   // from Users navigation
        public string ResultDescription { get; set; } = "";
        public DateTime ResultDate { get; set; }
    }
}