using System.Diagnostics;
using System.Security.Claims;
using HospitalSys.Helpers;
using HospitalSys.Models.Security;
using HospitalSys.Services.Security;

namespace HospitalSys.Middleware
{
    /// <summary>
    /// Logs every API request (status, latency). Skips static files and OpenAPI noise when possible.
    /// Does not log request/response bodies (avoid PHI and secrets).
    /// </summary>
    public class ApiRequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ApiRequestLoggingMiddleware> _logger;

        public ApiRequestLoggingMiddleware(RequestDelegate next, ILogger<ApiRequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, ISecurityEventService security)
        {
            var path = context.Request.Path.Value ?? "";
            // Skip static assets
            if (path.StartsWith("/uploads", StringComparison.OrdinalIgnoreCase)
                || path.StartsWith("/openapi", StringComparison.OrdinalIgnoreCase)
                || path.StartsWith("/swagger", StringComparison.OrdinalIgnoreCase))
            {
                await _next(context);
                return;
            }

            var sw = Stopwatch.StartNew();
            var wasRateLimited = false;

            try
            {
                await _next(context);
            }
            finally
            {
                sw.Stop();
                if (context.Response.StatusCode == StatusCodes.Status429TooManyRequests)
                    wasRateLimited = true;

                try
                {
                    var user = context.User;
                    int? userId = null;
                    if (int.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var id))
                        userId = id;

                    var log = new ApiRequestLog
                    {
                        UserId = userId,
                        Username = user.FindFirstValue(ClaimTypes.GivenName) ?? user.FindFirstValue(ClaimTypes.Name),
                        Role = user.FindFirstValue(ClaimTypes.Role),
                        IpAddress = IpAddressHelper.GetClientIp(context),
                        Endpoint = path.Length > 300 ? path[..300] : path,
                        HttpMethod = context.Request.Method,
                        StatusCode = context.Response.StatusCode,
                        ResponseTimeMs = sw.ElapsedMilliseconds,
                        WasRateLimited = wasRateLimited,
                        Timestamp = DateTime.UtcNow
                    };

                    // Fire-and-forget style via scoped service already resolved for this request
                    await security.LogApiRequestAsync(log);

                    if (wasRateLimited)
                    {
                        await security.RecordAsync(
                            "RateLimitExceeded",
                            $"Rate limit exceeded on {context.Request.Method} {path}",
                            "Warning",
                            log.IpAddress,
                            userId,
                            log.Username,
                            log.Role,
                            path);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "API request logging failed");
                }
            }
        }
    }
}
