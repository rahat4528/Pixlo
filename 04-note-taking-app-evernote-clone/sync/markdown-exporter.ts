export interface ExportableNote {
  title: string;
  content: string;
  notebookName?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  serverRevision: number;
}

export class MarkdownExporter {
  /**
   * Generates a portable Markdown document with YAML frontmatter.
   */
  static exportToMarkdown(note: ExportableNote): string {
    const tagsYaml = note.tags && note.tags.length > 0
      ? `\ntags:\n${note.tags.map((t) => `  - "${t}"`).join('\n')}`
      : '\ntags: []';

    const frontmatter = `---
title: "${note.title.replace(/"/g, '\\"')}"
notebook: "${(note.notebookName || 'Inbox').replace(/"/g, '\\"')}"
created: "${note.createdAt.toISOString()}"
updated: "${note.updatedAt.toISOString()}"
revision: ${note.serverRevision}${tagsYaml}
---

`;

    return `${frontmatter}${note.content.trim()}\n`;
  }
}
