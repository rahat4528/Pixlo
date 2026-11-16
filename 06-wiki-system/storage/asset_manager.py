import os
import hashlib
import mimetypes
from typing import Dict, Any, Optional, Tuple

ALLOWED_MIME_TYPES = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'application/pdf': '.pdf',
    'text/markdown': '.md',
    'text/plain': '.txt',
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


class StorageManager:
    """
    Local content-addressable asset storage manager with MIME verification and path-traversal guards.
    """
    def __init__(self, upload_dir: str = './storage/uploads'):
        self.upload_dir = os.path.abspath(upload_dir)
        os.makedirs(self.upload_dir, exist_ok=True)

    def validate_file(self, content_bytes: bytes, original_filename: str, declared_mime: Optional[str] = None) -> Tuple[bool, str]:
        if len(content_bytes) == 0:
            return False, "File is empty"

        if len(content_bytes) > MAX_FILE_SIZE:
            return False, f"File exceeds maximum allowed size of {MAX_FILE_SIZE} bytes"

        # Check declared MIME or deduce from filename
        mime = declared_mime or mimetypes.guess_type(original_filename)[0]
        if not mime or mime.lower() not in ALLOWED_MIME_TYPES:
            return False, f"Unsupported MIME type: {mime}"

        return True, ""

    def save_file(self, content_bytes: bytes, original_filename: str, declared_mime: Optional[str] = None) -> Dict[str, Any]:
        is_valid, error = self.validate_file(content_bytes, original_filename, declared_mime)
        if not is_valid:
            raise ValueError(error)

        mime = declared_mime or mimetypes.guess_type(original_filename)[0] or 'application/octet-stream'
        extension = ALLOWED_MIME_TYPES.get(mime.lower(), os.path.splitext(original_filename)[1] or '.bin')

        # Content-addressable hash
        content_hash = hashlib.sha256(content_bytes).hexdigest()
        filename = f"{content_hash}{extension}"
        file_path = os.path.join(self.upload_dir, filename)

        with open(file_path, 'wb') as f:
            f.write(content_bytes)

        return {
            'filename': filename,
            'original_filename': original_filename,
            'size': len(content_bytes),
            'mime_type': mime,
            'path': file_path,
            'url': f"/api/storage/files/{filename}",
            'sha256': content_hash,
        }

    def get_file(self, filename: str) -> Optional[bytes]:
        # Guard against path traversal
        clean_filename = os.path.basename(filename)
        safe_path = os.path.join(self.upload_dir, clean_filename)

        if not os.path.isfile(safe_path):
            return None

        with open(safe_path, 'rb') as f:
            return f.read()

    def delete_file(self, filename: str) -> bool:
        clean_filename = os.path.basename(filename)
        safe_path = os.path.join(self.upload_dir, clean_filename)

        if os.path.isfile(safe_path):
            os.remove(safe_path)
            return True
        return False
