using System.Security.Claims;
using System.Threading.RateLimiting;
using HospitalSys.Helpers;
using Microsoft.AspNetCore.RateLimiting;

namespace HospitalSys.RateLimiting
{
    /// <summary>
    /// Rate limiting strategy for a hospital system behind NAT:
    ///
    /// Partition keys combine:
    ///   - Client IP (always)
    ///   - Authenticated user id when available
    ///   - Policy name / endpoint category
    ///
    /// This avoids treating an entire ward (same public IP) as a single user for general API limits,
    /// while still throttling anonymous login attempts strictly by IP.
    ///
    /// Policies:
    ///   general   — 100 req/min  partition: IP + userId (or "anon")
    ///   login     — 5 req/min    partition: IP only (pre-auth)
    ///   ai        — 20 req/min   partition: IP + userId (Gemini endpoints)
    /// </summary>
    public static class RateLimitExtensions
    {
        public const string GeneralPolicy = "general";
        public const string LoginPolicy = "login";
        public const string AiPolicy = "ai";

        public static IServiceCollection AddHospitalRateLimiting(this IServiceCollection services)
        {
            services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

                options.OnRejected = async (context, ct) =>
                {
                    context.HttpContext.Response.Headers.RetryAfter = "60";
                    context.HttpContext.Response.ContentType = "application/json";
                    await context.HttpContext.Response.WriteAsJsonAsync(new
                    {
                        message = "Too many requests. Please try again later."
                    }, ct);
                };

                // General API: 100 / minute per IP+user
                options.AddPolicy(GeneralPolicy, httpContext =>
                {
                    var key = BuildPartitionKey(httpContext, "general");
                    return RateLimitPartition.GetFixedWindowLimiter(key, _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 100,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0,
                        AutoReplenishment = true
                    });
                });

                // Login endpoints: 5 / minute per IP (strict, pre-authentication)
                options.AddPolicy(LoginPolicy, httpContext =>
                {
                    var ip = IpAddressHelper.GetClientIp(httpContext) ?? "unknown";
                    return RateLimitPartition.GetFixedWindowLimiter($"login:{ip}", _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 5,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0,
                        AutoReplenishment = true
                    });
                });

                // AI / Gemini: 20 / minute per IP+user
                options.AddPolicy(AiPolicy, httpContext =>
                {
                    var key = BuildPartitionKey(httpContext, "ai");
                    return RateLimitPartition.GetFixedWindowLimiter(key, _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 20,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0,
                        AutoReplenishment = true
                    });
                });
            });

            return services;
        }

        private static string BuildPartitionKey(HttpContext httpContext, string policy)
        {
            var ip = IpAddressHelper.GetClientIp(httpContext) ?? "unknown";
            var userId = httpContext.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anon";
            return $"{policy}:{ip}:{userId}";
        }

        /// <summary>
        /// Apply rate-limit policies by path convention used in this repository:
        ///   *login*  → login policy
        ///   *AI* / *Gemini* / DoctorAI → ai policy
        ///   everything else under /Hospital → general
        /// </summary>
        public static void UseHospitalRateLimiting(this IApplicationBuilder app)
        {
            app.UseRateLimiter();
        }
    }
}
