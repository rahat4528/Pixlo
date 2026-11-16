import difflib
from typing import Dict, Any, List

class DiffEngine:
    """
    Computes unified line diffs, additions, deletions, and rollback states
    between historical page revisions using Python standard difflib.
    """

    @staticmethod
    def compute_line_diff(old_text: str, new_text: str) -> Dict[str, Any]:
        old_lines = old_text.splitlines(keepends=True)
        new_lines = new_text.splitlines(keepends=True)

        # Unified diff
        diff_generator = difflib.unified_diff(
            old_lines,
            new_lines,
            fromfile="Previous Revision",
            tofile="Current Revision",
            lineterm=""
        )
        unified_diff_text = "\n".join(diff_generator)

        # Structured line-by-line inspection
        matcher = difflib.SequenceMatcher(None, old_lines, new_lines)
        hunks: List[Dict[str, Any]] = []
        additions = 0
        deletions = 0
        unchanged = 0

        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == 'equal':
                for line in old_lines[i1:i2]:
                    hunks.append({'type': 'unchanged', 'text': line.rstrip('\r\n'), 'old_line': i1 + 1, 'new_line': j1 + 1})
                    unchanged += 1
            elif tag == 'insert':
                for line in new_lines[j1:j2]:
                    hunks.append({'type': 'addition', 'text': line.rstrip('\r\n'), 'old_line': None, 'new_line': j1 + 1})
                    additions += 1
            elif tag == 'delete':
                for line in old_lines[i1:i2]:
                    hunks.append({'type': 'deletion', 'text': line.rstrip('\r\n'), 'old_line': i1 + 1, 'new_line': None})
                    deletions += 1
            elif tag == 'replace':
                for line in old_lines[i1:i2]:
                    hunks.append({'type': 'deletion', 'text': line.rstrip('\r\n'), 'old_line': i1 + 1, 'new_line': None})
                    deletions += 1
                for line in new_lines[j1:j2]:
                    hunks.append({'type': 'addition', 'text': line.rstrip('\r\n'), 'old_line': None, 'new_line': j1 + 1})
                    additions += 1

        return {
            'unified_diff': unified_diff_text,
            'hunks': hunks,
            'stats': {
                'additions': additions,
                'deletions': deletions,
                'unchanged': unchanged,
                'total_changes': additions + deletions,
            }
        }

    @staticmethod
    def prepare_rollback_content(target_revision_content: str, target_revision_number: int) -> Dict[str, Any]:
        """
        Creates the restorative revision payload to roll back a page to an earlier version.
        """
        return {
            'content': target_revision_content,
            'change_summary': f"Restored content from Revision #{target_revision_number}",
            'is_rollback': True,
            'target_revision': target_revision_number,
        }
