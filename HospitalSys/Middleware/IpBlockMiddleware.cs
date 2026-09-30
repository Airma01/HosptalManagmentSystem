using HospitalSys.Helpers;
using HospitalSys.Services.Security;

namespace HospitalSys.Middleware
{
    /// <summary>
    /// Runs early: blocked IP → 403 before rate limiting / auth.
    /// </summary>
    public class IpBlockMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<IpBlockMiddleware> _logger;

        public IpBlockMiddleware(RequestDelegate next, ILogger<IpBlockMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, ISecurityEventService security)
        {
            var ip = IpAddressHelper.GetClientIp(context);
            if (!string.IsNullOrEmpty(ip))
            {
                try
                {
                    if (await security.IsIpBlockedAsync(ip))
                    {
                        _logger.LogWarning("Blocked IP attempted access: {Ip} {Path}", ip, context.Request.Path);

                        await security.RecordAsync(
                            "ForbiddenRequest",
                            $"Request from blocked IP {ip} to {context.Request.Path}",
                            "Warning",
                            ip,
                            endpoint: context.Request.Path.Value);

                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        context.Response.ContentType = "application/json";
                        await context.Response.WriteAsJsonAsync(new
                        {
                            message = "Access denied. Your IP address has been blocked."
                        });
                        return;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "IP block check failed for {Ip}", ip);
                    // Fail open for availability of clinical system; still log
                }
            }

            await _next(context);
        }
    }
}
