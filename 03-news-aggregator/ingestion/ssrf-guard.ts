import * as dns from 'dns';
import { promisify } from 'util';
import * as net from 'net';

const lookupAsync = promisify(dns.lookup);

export interface SSRFValidationResult {
  isSafe: boolean;
  resolvedIp?: string;
  error?: string;
}

/**
 * SSRF Guard validates URLs before network requests are initiated.
 * Blocks:
 * - Non-HTTP(S) protocols (file:, ftp:, gopher:, etc.)
 * - Loopback addresses (127.0.0.0/8, ::1)
 * - Private IPv4 subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
 * - Link-local & cloud metadata (169.254.0.0/16, fe80::/10)
 * - Carrier-grade NAT (100.64.0.0/10)
 * - Broadcast / 0.0.0.0
 */
export class SSRFGuard {
  private static readonly BLOCKED_IP_PATTERNS = [
    /^127\./,                         // IPv4 loopback
    /^10\./,                          // Private class A
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private class B
    /^192\.168\./,                    // Private class C
    /^169\.254\./,                    // Link-local / AWS / GCP metadata
    /^0\.0\.0\.0$/,                    // Unspecified
    /^224\./,                         // Multicast
    /^240\./,                         // Reserved
    /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./, // Carrier-grade NAT
  ];

  static isIpBlocked(ip: string): boolean {
    const cleanIp = ip.trim().toLowerCase();

    // Check IPv6 loopback and special addresses
    if (cleanIp === '::1' || cleanIp === '::' || cleanIp.startsWith('fe80:') || cleanIp.startsWith('fc00:') || cleanIp.startsWith('fd00:')) {
      return true;
    }

    // Check mapped IPv4 in IPv6 (e.g. ::ffff:127.0.0.1)
    if (cleanIp.startsWith('::ffff:')) {
      const v4Part = cleanIp.replace('::ffff:', '');
      return this.isIpBlocked(v4Part);
    }

    for (const pattern of this.BLOCKED_IP_PATTERNS) {
      if (pattern.test(cleanIp)) {
        return true;
      }
    }

    return false;
  }

  static async validateUrl(rawUrl: string): Promise<SSRFValidationResult> {
    try {
      const parsed = new URL(rawUrl);

      // Only http and https protocols are permitted
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return {
          isSafe: false,
          error: `Blocked unsafe protocol: ${parsed.protocol}. Only http: and https: are allowed.`,
        };
      }

      const hostname = parsed.hostname;

      // Direct IP check
      if (net.isIP(hostname)) {
        if (this.isIpBlocked(hostname)) {
          return {
            isSafe: false,
            resolvedIp: hostname,
            error: `Direct connection to private or loopback IP ${hostname} is blocked.`,
          };
        }
        return { isSafe: true, resolvedIp: hostname };
      }

      // Check special hostnames
      const lowerHost = hostname.toLowerCase();
      if (
        lowerHost === 'localhost' ||
        lowerHost.endsWith('.localhost') ||
        lowerHost.endsWith('.local') ||
        lowerHost.endsWith('.internal')
      ) {
        return {
          isSafe: false,
          error: `Connection to local/internal domain ${hostname} is blocked.`,
        };
      }

      // Resolve DNS to verify the resolved address
      const lookupResult = await lookupAsync(hostname, { all: true });
      if (!lookupResult || lookupResult.length === 0) {
        return {
          isSafe: false,
          error: `Unable to resolve DNS for ${hostname}`,
        };
      }

      for (const entry of lookupResult) {
        if (this.isIpBlocked(entry.address)) {
          return {
            isSafe: false,
            resolvedIp: entry.address,
            error: `Domain ${hostname} resolved to forbidden private/loopback IP ${entry.address}.`,
          };
        }
      }

      return {
        isSafe: true,
        resolvedIp: lookupResult[0].address,
      };
    } catch (err: any) {
      return {
        isSafe: false,
        error: `Invalid URL format or DNS error: ${err.message}`,
      };
    }
  }
}
