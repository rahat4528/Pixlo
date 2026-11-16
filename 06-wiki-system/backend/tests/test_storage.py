import os
import sys
import tempfile
import pytest

# Ensure parent directory is in python path to import storage
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from storage.asset_manager import StorageManager

def test_save_and_retrieve_valid_file():
    with tempfile.TemporaryDirectory() as tmp_dir:
        storage = StorageManager(upload_dir=tmp_dir)
        content = b"# Wiki System Readme\nWelcome to the knowledge base."
        
        saved = storage.save_file(content, "readme.md", declared_mime="text/markdown")
        
        assert saved['filename'].endswith('.md')
        assert saved['size'] == len(content)
        assert os.path.isfile(saved['path'])

        retrieved = storage.get_file(saved['filename'])
        assert retrieved == content

def test_reject_unsupported_mime_type():
    with tempfile.TemporaryDirectory() as tmp_dir:
        storage = StorageManager(upload_dir=tmp_dir)
        malicious_content = b"\x4d\x5a\x90\x00"  # PE binary header
        
        with pytest.raises(ValueError) as exc:
            storage.save_file(malicious_content, "payload.exe", declared_mime="application/x-msdownload")
        
        assert "Unsupported MIME type" in str(exc.value)

def test_reject_oversized_file():
    with tempfile.TemporaryDirectory() as tmp_dir:
        storage = StorageManager(upload_dir=tmp_dir)
        # 11MB file
        oversized = b"0" * (11 * 1024 * 1024)
        
        with pytest.raises(ValueError) as exc:
            storage.save_file(oversized, "big_file.png", declared_mime="image/png")
        
        assert "exceeds maximum allowed size" in str(exc.value)

def test_guard_against_path_traversal():
    with tempfile.TemporaryDirectory() as tmp_dir:
        storage = StorageManager(upload_dir=tmp_dir)
        
        # Attempting traversal
        result = storage.get_file("../../etc/passwd")
        assert result is None
