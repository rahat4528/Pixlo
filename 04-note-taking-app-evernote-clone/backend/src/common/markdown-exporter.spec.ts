import { MarkdownExporter, ExportableNote } from '../../../sync/markdown-exporter';

describe('MarkdownExporter', () => {
  it('should export note with valid YAML frontmatter and formatted markdown', () => {
    const note: ExportableNote = {
      title: 'Database Partitioning Guidelines',
      notebookName: 'Architecture',
      tags: ['database', 'scaling'],
      serverRevision: 4,
      createdAt: new Date('2026-11-16T10:00:00Z'),
      updatedAt: new Date('2026-11-16T12:00:00Z'),
      content: '## Hash Partitioning\nPartition by tenant_id across physical shards.',
    };

    const exported = MarkdownExporter.exportToMarkdown(note);
    expect(exported).toContain('title: "Database Partitioning Guidelines"');
    expect(exported).toContain('notebook: "Architecture"');
    expect(exported).toContain('revision: 4');
    expect(exported).toContain('- "database"');
    expect(exported).toContain('- "scaling"');
    expect(exported).toContain('Partition by tenant_id across physical shards.');
  });
});
