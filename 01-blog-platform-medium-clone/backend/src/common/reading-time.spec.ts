import { calculateReadingTime } from './reading-time.util';

describe('Reading Time Estimation Engine', () => {
  it('calculates 1 minute for short articles under 200 words', () => {
    const text = 'This is a short article explaining consensus algorithms in distributed systems.';
    const minutes = calculateReadingTime(text);
    expect(minutes).toBe(1);
  });

  it('calculates reading time based on 200 words per minute rule', () => {
    // Generate exactly 600 words
    const words = Array(600).fill('consensus').join(' ');
    const minutes = calculateReadingTime(words);
    expect(minutes).toBe(3); // 600 / 200 = 3 minutes
  });

  it('adjusts reading time by +12 seconds per image', () => {
    // 200 words (1 min) + 5 images (5 * 12s = 60s = 1 min) = 2 minutes
    const words = Array(200).fill('node').join(' ');
    const minutes = calculateReadingTime(words, 5, 0);
    expect(minutes).toBe(2);
  });

  it('adjusts reading time by +10 seconds per code block', () => {
    // 200 words (1 min) + 6 code blocks (6 * 10s = 60s = 1 min) = 2 minutes
    const words = Array(200).fill('partition').join(' ');
    const minutes = calculateReadingTime(words, 0, 6);
    expect(minutes).toBe(2);
  });

  it('extracts word counts and inline tags from structured editor JSON', () => {
    const tiptapJson = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          content: [{ type: 'text', text: 'Distributed Raft Consensus' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: Array(400).fill('replicate').join(' '),
            },
          ],
        },
        { type: 'image', attrs: { src: 'https://pixlo.local/raft.png' } },
        { type: 'codeBlock', attrs: { language: 'typescript' } },
      ],
    };

    // 403 words (2.015 min) + 1 image (0.2 min) + 1 code block (0.166 min) = ceil(2.38) = 3 min
    const minutes = calculateReadingTime(tiptapJson);
    expect(minutes).toBe(3);
  });
});
