using System.Net;
using System.Net.Sockets;

namespace HospitalSys.Helpers
{
    public static class IpAddressHelper
    {
        /// <summary>
        /// Resolves client IP. Prefer connection remote IP.
        /// Only use X-Forwarded-For when ForwardedHeaders middleware is configured
        /// and the proxy is trusted — never trust raw client-supplied headers blindly.
        /// </summary>
        public static string? GetClientIp(HttpContext context)
        {
            // After UseForwardedHeaders(), RemoteIpAddress is already the client IP when proxy is trusted.
            var ip = context.Connection.RemoteIpAddress;
            if (ip == null)
                return null;

            // Map IPv4-mapped IPv6 (::ffff:x.x.x.x) to plain IPv4 for consistent storage/matching
            if (ip.IsIPv4MappedToIPv6)
                ip = ip.MapToIPv4();

            return ip.ToString();
        }

        public static bool IsValidIpAddress(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return false;

            value = value.Trim();
            if (!IPAddress.TryParse(value, out var parsed))
                return false;

            // Reject unspecified / any
            if (parsed.Equals(IPAddress.Any) || parsed.Equals(IPAddress.IPv6Any))
                return false;

            return parsed.AddressFamily is AddressFamily.InterNetwork or AddressFamily.InterNetworkV6;
        }

        public static string NormalizeIp(string ip)
        {
            if (!IPAddress.TryParse(ip.Trim(), out var parsed))
                return ip.Trim();

            if (parsed.IsIPv4MappedToIPv6)
                parsed = parsed.MapToIPv4();

            return parsed.ToString();
        }
    }
}
