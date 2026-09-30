using HospitalSys.Dto.Security;
using HospitalSys.Models.Security;

namespace HospitalSys.Services.Security
{
    public interface IAuditLogService
    {
        Task CreateAsync(
            string action,
            string? module = null,
            string? entityName = null,
            string? entityId = null,
            string? endpoint = null,
            string? httpMethod = null,
            string? ipAddress = null,
            int? userId = null,
            string? username = null,
            string? role = null,
            string status = "Success",
            string? reason = null,
            CancellationToken ct = default);

        Task CreateFromHttpContextAsync(
            HttpContext httpContext,
            string action,
            string? module = null,
            string? entityName = null,
            string? entityId = null,
            string status = "Success",
            string? reason = null,
            CancellationToken ct = default);

        Task<PagedResultDto<AuditLogDto>> GetPagedAsync(AuditLogFilterDto filter, CancellationToken ct = default);
    }
}
