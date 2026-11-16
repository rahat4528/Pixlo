import os
import sys
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Response
from app.api.deps import get_current_user
from app.models import User

# Ensure parent project directory is in python path to import storage
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..')))
from storage.asset_manager import StorageManager

router = APIRouter(prefix="/storage", tags=["Storage & Attachments"])
storage_manager = StorageManager(upload_dir="./storage/uploads")

@router.post("/upload")
async def upload_asset(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    content = await file.read()
    try:
        saved = storage_manager.save_file(
            content_bytes=content,
            original_filename=file.filename or "attachment.bin",
            declared_mime=file.content_type,
        )
        return saved
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/files/{filename}")
async def get_asset(filename: str):
    file_bytes = storage_manager.get_file(filename)
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    ext = os.path.splitext(filename)[1].lower()
    media_types = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.md': 'text/markdown',
        '.txt': 'text/plain',
    }
    media_type = media_types.get(ext, 'application/octet-stream')
    return Response(content=file_bytes, media_type=media_type)
