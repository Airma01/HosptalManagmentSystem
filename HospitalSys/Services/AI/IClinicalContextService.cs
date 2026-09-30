using HospitalSys.Models.AI;

namespace HospitalSys.Services.AI
{
    public interface IClinicalContextService
    {
        /// <summary>
        /// Builds authorized clinical context for the given patient/visit/module.
        /// Returns null if patient/visit not found; throws UnauthorizedAccessException if doctor lacks access.
        /// </summary>
        Task<AIClinicalContext?> BuildContextAsync(
            int doctorId,
            int departmentId,
            int patientId,
            int visitId,
            string module,
            CancellationToken ct = default);

        /// <summary>
        /// Builds context focused on laboratory results (optional specific result IDs).
        /// </summary>
        Task<AIClinicalContext?> BuildLabContextAsync(
            int doctorId,
            int departmentId,
            int patientId,
            int visitId,
            IEnumerable<int>? laboratoryResultIds,
            CancellationToken ct = default);
    }
}
