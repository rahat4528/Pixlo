import { ConflictResolver } from '../../../sync/conflict-resolver';

describe('ConflictResolver - 3-Way Merge & Conflict Copies', () => {
  it('should cleanly auto-merge when one client appends lines to the end', () => {
    const base = 'Line 1: Meeting intro\nLine 2: Project overview';
    const local = 'Line 1: Meeting intro\nLine 2: Project overview\nLine 3: Local action item';
    const remote = 'Line 1: Meeting intro\nLine 2: Project overview\nLine 4: Remote timeline note';

    const result = ConflictResolver.threeWayMerge(base, local, remote, 'Sprint Note');
    expect(result.hasConflict).toBe(false);
    expect(result.conflictCopyRequired).toBe(false);
    expect(result.mergedText).toContain('Line 3: Local action item');
    expect(result.mergedText).toContain('Line 4: Remote timeline note');
  });

  it('should auto-merge non-overlapping line edits', () => {
    const base = 'Header\nSection A\nSection B\nFooter';
    const local = 'Header\nSection A [Edited by Local]\nSection B\nFooter';
    const remote = 'Header\nSection A\nSection B [Edited by Remote]\nFooter';

    const result = ConflictResolver.threeWayMerge(base, local, remote, 'Doc');
    expect(result.hasConflict).toBe(false);
    expect(result.mergedText).toBe('Header\nSection A [Edited by Local]\nSection B [Edited by Remote]\nFooter');
  });

  it('should detect overlapping line edits and require an explicit conflict copy', () => {
    const base = 'Budget: $10,000 for Q1';
    const local = 'Budget: $15,000 for Q1 (Adjusted locally)';
    const remote = 'Budget: $12,500 for Q1 (Adjusted on laptop)';

    const result = ConflictResolver.threeWayMerge(base, local, remote, 'Q1 Budget');
    expect(result.hasConflict).toBe(true);
    expect(result.conflictCopyRequired).toBe(true);
    expect(result.conflictCopyTitle).toContain('[Conflict Copy] Q1 Budget');
    expect(result.conflictCopyContent).toBe('Budget: $15,000 for Q1 (Adjusted locally)');
    // Server canonical remote is preserved
    expect(result.mergedText).toBe('Budget: $12,500 for Q1 (Adjusted on laptop)');
  });

  it('should return identical text if local matches remote', () => {
    const base = 'Original text';
    const modified = 'Both devices made this identical correction';

    const result = ConflictResolver.threeWayMerge(base, modified, modified, 'Note');
    expect(result.hasConflict).toBe(false);
    expect(result.mergedText).toBe(modified);
  });
});
