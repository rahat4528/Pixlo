import { Deduplicator } from '../../../ingestion/deduplicator';

describe('Deduplicator', () => {
  describe('normalizeTitle and hashTitle', () => {
    it('should normalize titles ignoring casing, punctuation, and extra whitespace', () => {
      const titleA = 'BREAKING: Global Central Banks Announce New Rate Protocol!';
      const titleB = 'breaking global central banks announce new rate protocol';
      expect(Deduplicator.normalizeTitle(titleA)).toBe(Deduplicator.normalizeTitle(titleB));
    });

    it('should generate identical SHA-256 hashes for equivalent titles', () => {
      const hash1 = Deduplicator.hashTitle('Spacecraft lands safely on lunar south pole!');
      const hash2 = Deduplicator.hashTitle('spacecraft  lands   safely on lunar south pole');
      expect(hash1).toBe(hash2);
    });
  });

  describe('calculateJaccardSimilarity', () => {
    it('should return 1.0 for identical content', () => {
      const text = 'Breakthrough solid state battery charges in five minutes';
      expect(Deduplicator.calculateJaccardSimilarity(text, text)).toBe(1.0);
    });

    it('should compute high similarity for paraphrased titles', () => {
      const t1 = 'Solid state battery breakthrough charges electric vehicle in five minutes';
      const t2 = 'Breakthrough solid state battery charges electric vehicle rapidly';
      const sim = Deduplicator.calculateJaccardSimilarity(t1, t2);
      expect(sim).toBeGreaterThan(0.5);
    });

    it('should compute low similarity for unrelated titles', () => {
      const t1 = 'Stock market reaches all time high after inflation report';
      const t2 = 'National basketball league announces championship playoffs schedule';
      const sim = Deduplicator.calculateJaccardSimilarity(t1, t2);
      expect(sim).toBeLessThan(0.1);
    });
  });

  describe('isDuplicate', () => {
    it('should detect duplicate by exact canonical URL', () => {
      const candA = {
        title: 'Title One',
        canonicalUrl: 'https://news.org/article-1',
      };
      const candB = {
        title: 'Different Title Text',
        canonicalUrl: 'https://news.org/article-1',
      };
      expect(Deduplicator.isDuplicate(candA, candB)).toBe(true);
    });

    it('should detect duplicate by exact GUID', () => {
      const candA = {
        title: 'Title One',
        guid: 'unique-guid-999',
      };
      const candB = {
        title: 'Totally Different Headline',
        guid: 'unique-guid-999',
      };
      expect(Deduplicator.isDuplicate(candA, candB)).toBe(true);
    });

    it('should detect duplicate by normalized title hash', () => {
      const candA = {
        title: 'Major earthquake detected off coastal region',
      };
      const candB = {
        title: 'Major earthquake detected off coastal region!',
      };
      expect(Deduplicator.isDuplicate(candA, candB)).toBe(true);
    });
  });
});
