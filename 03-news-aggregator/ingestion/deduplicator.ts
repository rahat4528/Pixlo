import * as crypto from 'crypto';

export interface DeduplicationCandidate {
  guid?: string;
  canonicalUrl?: string;
  normalizedTitleHash?: string;
  title: string;
}

export class Deduplicator {
  /**
   * Normalizes an article title:
   * - Strips HTML tags
   * - Lowercases
   * - Removes non-alphanumeric characters (keeping spaces)
   * - Collapses consecutive spaces
   */
  static normalizeTitle(title: string): string {
    if (!title) return '';
    return title
      .replace(/<[^>]*>/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Generates a stable SHA-256 hash of the normalized title.
   */
  static hashTitle(title: string): string {
    const normalized = this.normalizeTitle(title);
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Tokenizes text into a set of lowercased significant words (length >= 3, skipping stopwords).
   */
  static tokenize(text: string): Set<string> {
    const STOPWORDS = new Set([
      'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'has', 'had',
      'not', 'but', 'what', 'when', 'where', 'which', 'who', 'will', 'are', 'was',
      'were', 'about', 'into', 'over', 'after', 'more', 'also', 'than', 'out',
    ]);

    const words = this.normalizeTitle(text).split(' ');
    const tokens = new Set<string>();

    for (const w of words) {
      if (w.length >= 3 && !STOPWORDS.has(w)) {
        tokens.add(w);
      }
    }

    return tokens;
  }

  /**
   * Computes Jaccard similarity coefficient between two texts (0.0 to 1.0).
   */
  static calculateJaccardSimilarity(textA: string, textB: string): number {
    const setA = this.tokenize(textA);
    const setB = this.tokenize(textB);

    if (setA.size === 0 || setB.size === 0) {
      return 0.0;
    }

    let intersectionCount = 0;
    for (const token of setA) {
      if (setB.has(token)) {
        intersectionCount++;
      }
    }

    const unionCount = setA.size + setB.size - intersectionCount;
    return unionCount === 0 ? 0.0 : intersectionCount / unionCount;
  }

  /**
   * Evaluates if two articles are duplicates based on multi-level criteria:
   * 1. Exact canonical URL match
   * 2. Exact GUID match
   * 3. Exact Normalized Title Hash match
   * 4. High title similarity (Jaccard index >= 0.82)
   */
  static isDuplicate(a: DeduplicationCandidate, b: DeduplicationCandidate): boolean {
    if (a.canonicalUrl && b.canonicalUrl && a.canonicalUrl === b.canonicalUrl) {
      return true;
    }

    if (a.guid && b.guid && a.guid === b.guid) {
      return true;
    }

    const hashA = a.normalizedTitleHash || this.hashTitle(a.title);
    const hashB = b.normalizedTitleHash || this.hashTitle(b.title);
    if (hashA && hashB && hashA === hashB) {
      return true;
    }

    const similarity = this.calculateJaccardSimilarity(a.title, b.title);
    return similarity >= 0.82;
  }
}
