import pytest
from app.services.diff_engine import DiffEngine

def test_line_diff_computation():
    old_content = """# System Architecture
The system consists of three services.
- Service A
- Service B
"""
    new_content = """# System Architecture
The system consists of four services.
- Service A
- Service B
- Service C
"""

    diff_result = DiffEngine.compute_line_diff(old_content, new_content)

    assert "The system consists of four services." in diff_result['unified_diff']
    assert "+- Service C" in diff_result['unified_diff']
    assert diff_result['stats']['additions'] >= 2
    assert diff_result['stats']['deletions'] >= 1

    hunk_types = [h['type'] for h in diff_result['hunks']]
    assert 'addition' in hunk_types
    assert 'deletion' in hunk_types
    assert 'unchanged' in hunk_types

def test_no_changes_diff():
    content = "Single unchanged line."
    diff_result = DiffEngine.compute_line_diff(content, content)

    assert diff_result['stats']['additions'] == 0
    assert diff_result['stats']['deletions'] == 0
    assert diff_result['stats']['unchanged'] == 1

def test_rollback_payload_generation():
    target_content = "# Restored Architecture V1"
    rollback = DiffEngine.prepare_rollback_content(target_content, 3)

    assert rollback['content'] == target_content
    assert "Revision #3" in rollback['change_summary']
    assert rollback['is_rollback'] is True
    assert rollback['target_revision'] == 3
