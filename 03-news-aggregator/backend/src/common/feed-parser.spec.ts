import { FeedParser } from '../../../ingestion/feed-parser';

describe('FeedParser', () => {
  it('should parse valid RSS 2.0 feeds with enclosures and CDATA content', () => {
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>Tech Chronicle</title>
        <link>https://techchronicle.example.com</link>
        <description>Latest technology news</description>
        <item>
          <title><![CDATA[New Quantum Processor Achieves 1000 Qubits]]></title>
          <link>https://techchronicle.example.com/story/quantum-1000</link>
          <guid>https://techchronicle.example.com/story/quantum-1000</guid>
          <pubDate>Mon, 16 Nov 2026 08:00:00 GMT</pubDate>
          <description><![CDATA[Engineers announce a milestone quantum computing cluster with active error suppression.]]></description>
          <enclosure url="https://techchronicle.example.com/images/quantum.jpg" type="image/jpeg" length="124500" />
        </item>
      </channel>
    </rss>`;

    const parsed = FeedParser.parse(rssXml);
    expect(parsed.title).toBe('Tech Chronicle');
    expect(parsed.items.length).toBe(1);
    expect(parsed.items[0].title).toBe('New Quantum Processor Achieves 1000 Qubits');
    expect(parsed.items[0].link).toBe('https://techchronicle.example.com/story/quantum-1000');
    expect(parsed.items[0].imageUrl).toBe('https://techchronicle.example.com/images/quantum.jpg');
    expect(parsed.items[0].pubDate).toBeInstanceOf(Date);
  });

  it('should parse valid Atom 1.0 feeds', () => {
    const atomXml = `<?xml version="1.0" encoding="utf-8"?>
    <feed xmlns="http://www.w3.org/2005/Atom">
      <title>Global Dispatch</title>
      <link rel="alternate" href="https://globaldispatch.example.org" />
      <updated>2026-11-16T04:00:00Z</updated>
      <entry>
        <id>tag:globaldispatch.example.org,2026:article/789</id>
        <title>Summit Concludes With Maritime Environmental Accord</title>
        <link rel="alternate" href="https://globaldispatch.example.org/news/summit-accord" />
        <published>2026-11-16T03:30:00Z</published>
        <summary>Delegates from member states agree to binding treaty protections.</summary>
        <author>
          <name>Helena Silva</name>
        </author>
      </entry>
    </feed>`;

    const parsed = FeedParser.parse(atomXml);
    expect(parsed.title).toBe('Global Dispatch');
    expect(parsed.items.length).toBe(1);
    expect(parsed.items[0].title).toBe('Summit Concludes With Maritime Environmental Accord');
    expect(parsed.items[0].link).toBe('https://globaldispatch.example.org/news/summit-accord');
    expect(parsed.items[0].authorName).toBe('Helena Silva');
  });

  it('should throw an error on malformed or unsupported XML', () => {
    expect(() => FeedParser.parse('<invalid><data>Not a feed</data></invalid>')).toThrow(
      'Unrecognized feed format',
    );
  });
});
