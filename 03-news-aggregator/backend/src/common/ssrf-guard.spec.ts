import { SSRFGuard } from '../../../ingestion/ssrf-guard';

describe('SSRFGuard', () => {
  describe('isIpBlocked', () => {
    it('should block IPv4 loopback (127.0.0.1)', () => {
      expect(SSRFGuard.isIpBlocked('127.0.0.1')).toBe(true);
      expect(SSRFGuard.isIpBlocked('127.0.1.5')).toBe(true);
    });

    it('should block IPv6 loopback (::1)', () => {
      expect(SSRFGuard.isIpBlocked('::1')).toBe(true);
    });

    it('should block Class A private network (10.0.0.0/8)', () => {
      expect(SSRFGuard.isIpBlocked('10.0.0.1')).toBe(true);
      expect(SSRFGuard.isIpBlocked('10.254.10.5')).toBe(true);
    });

    it('should block Class B private network (172.16.0.0 - 172.31.255.255)', () => {
      expect(SSRFGuard.isIpBlocked('172.16.0.1')).toBe(true);
      expect(SSRFGuard.isIpBlocked('172.31.255.254')).toBe(true);
      expect(SSRFGuard.isIpBlocked('172.20.14.2')).toBe(true);
    });

    it('should not block public 172 IPs outside private range', () => {
      expect(SSRFGuard.isIpBlocked('172.15.0.1')).toBe(false);
      expect(SSRFGuard.isIpBlocked('172.32.0.1')).toBe(false);
    });

    it('should block Class C private network (192.168.0.0/16)', () => {
      expect(SSRFGuard.isIpBlocked('192.168.1.1')).toBe(true);
      expect(SSRFGuard.isIpBlocked('192.168.0.254')).toBe(true);
    });

    it('should block cloud metadata and link-local IP (169.254.169.254)', () => {
      expect(SSRFGuard.isIpBlocked('169.254.169.254')).toBe(true);
      expect(SSRFGuard.isIpBlocked('169.254.1.1')).toBe(true);
    });

    it('should block 0.0.0.0', () => {
      expect(SSRFGuard.isIpBlocked('0.0.0.0')).toBe(true);
    });

    it('should allow public routable IP addresses', () => {
      expect(SSRFGuard.isIpBlocked('93.184.216.34')).toBe(false); // example.com
      expect(SSRFGuard.isIpBlocked('8.8.8.8')).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should reject non-HTTP protocols', async () => {
      const fileRes = await SSRFGuard.validateUrl('file:///etc/passwd');
      expect(fileRes.isSafe).toBe(false);
      expect(fileRes.error).toContain('Blocked unsafe protocol: file:');

      const ftpRes = await SSRFGuard.validateUrl('ftp://private.corp/data');
      expect(ftpRes.isSafe).toBe(false);
      expect(ftpRes.error).toContain('Blocked unsafe protocol: ftp:');
    });

    it('should reject direct private IP URLs', async () => {
      const res = await SSRFGuard.validateUrl('http://127.0.0.1:8080/admin');
      expect(res.isSafe).toBe(false);
      expect(res.error).toContain('Direct connection to private or loopback IP 127.0.0.1 is blocked');
    });

    it('should reject localhost domain variants', async () => {
      const res1 = await SSRFGuard.validateUrl('http://localhost/metrics');
      expect(res1.isSafe).toBe(false);

      const res2 = await SSRFGuard.validateUrl('http://service.local/api');
      expect(res2.isSafe).toBe(false);

      const res3 = await SSRFGuard.validateUrl('http://cluster.internal/status');
      expect(res3.isSafe).toBe(false);
    });

    it('should allow valid public HTTP/HTTPS URLs', async () => {
      const res = await SSRFGuard.validateUrl('https://example.com/rss.xml');
      expect(res.isSafe).toBe(true);
    });
  });
});
