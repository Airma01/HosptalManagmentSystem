using HospitalSys.Dto.Security;
using HospitalSys.Models.Security;

namespace HospitalSys.Services.Security
{
    public interface ISecurityEventService
    {
        Task RecordAsync(
            string eventType,
            string description,
            string severity = "Info",
            string? ipAddress = null,
            int? userId = null,
            string? username = null,
            string? role = null,
            string? endpoint = null,
            CancellationToken ct = default);

        Task RecordFromHttpContextAsync(
            HttpContext httpContext,
            string eventType,
            string description,
            string severity = "Info",
            CancellationToken ct = default);

        Task<PagedResultDto<SecurityEventDto>> GetPagedAsync(SecurityEventFilterDto filter, CancellationToken ct = default);

        Task LogApiRequestAsync(ApiRequestLog log, CancellationToken ct = default);

        Task<PagedResultDto<ApiRequestLogDto>> GetApiRequestsPagedAsync(ApiRequestFilterDto filter, CancellationToken ct = default);

        Task<SecurityStatisticsDto> GetStatisticsAsync(DateTime? from = null, DateTime? to = null, CancellationToken ct = default);

        Task<bool> IsIpBlockedAsync(string ipAddress, CancellationToken ct = default);

        Task<BlockedIpDto> BlockIpAsync(BlockIpDto dto, int? adminUserId, string? adminUsername, CancellationToken ct = default);

        Task<bool> UnblockIpAsync(int id, int? adminUserId, string? adminUsername, CancellationToken ct = default);

        Task<List<BlockedIpDto>> GetBlockedIpsAsync(bool activeOnly = true, CancellationToken ct = default);
    }
}
