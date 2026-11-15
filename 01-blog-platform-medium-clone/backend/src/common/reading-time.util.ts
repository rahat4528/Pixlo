export interface ReadingTimeOptions {
  wordsPerMinute?: number;
  secondsPerImage?: number;
  secondsPerCodeBlock?: number;
}

export function calculateReadingTime(
  content: string | Record<string, any>,
  imageCount: number = 0,
  codeBlockCount: number = 0,
  options: ReadingTimeOptions = {}
): number {
  const wpm = options.wordsPerMinute ?? 200;
  const imageSec = options.secondsPerImage ?? 12;
  const codeSec = options.secondsPerCodeBlock ?? 10;

  let plainText = '';
  let inlineImages = imageCount;
  let inlineCodeBlocks = codeBlockCount;

  if (typeof content === 'string') {
    // Strip HTML tags for word counting
    plainText = content.replace(/<[^>]*>/g, ' ');
    // Detect inline images if not provided
    if (imageCount === 0) {
      const imgMatches = content.match(/<img[^>]*>/gi);
      if (imgMatches) inlineImages += imgMatches.length;
    }
    // Detect inline code blocks if not provided
    if (codeBlockCount === 0) {
      const codeMatches = content.match(/<pre[^>]*>[\s\S]*?<\/pre>/gi);
      if (codeMatches) inlineCodeBlocks += codeMatches.length;
    }
  } else if (typeof content === 'object' && content !== null) {
    // Traverse structured editor document (e.g., Tiptap JSON)
    const extractText = (node: any) => {
      if (!node) return;
      if (node.type === 'text' && node.text) {
        plainText += ' ' + node.text;
      }
      if (node.type === 'image') {
        inlineImages++;
      }
      if (node.type === 'codeBlock') {
        inlineCodeBlocks++;
      }
      if (Array.isArray(node.content)) {
        node.content.forEach(extractText);
      }
    };
    extractText(content);
  }

  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  const wordMinutes = words / wpm;
  const imageMinutes = (inlineImages * imageSec) / 60;
  const codeMinutes = (inlineCodeBlocks * codeSec) / 60;

  const totalMinutes = Math.ceil(wordMinutes + imageMinutes + codeMinutes);
  return Math.max(1, totalMinutes);
}
