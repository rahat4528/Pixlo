from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...models.doc_models import DocProject, DocVersion
from ...schemas.doc_schemas import VersionCreate, VersionResponse

router = APIRouter(prefix="/projects/{project_id}/versions", tags=["Versions"])


@router.get("", response_model=List[VersionResponse])
def list_versions(project_id: str, db: Session = Depends(get_db)):
    project = db.query(DocProject).filter(
        (DocProject.id == project_id) | (DocProject.slug == project_id)
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    return db.query(DocVersion).filter(DocVersion.project_id == project.id).all()


@router.post("", response_model=VersionResponse, status_code=status.HTTP_201_CREATED)
def create_version(project_id: str, payload: VersionCreate, db: Session = Depends(get_db)):
    project = db.query(DocProject).filter(
        (DocProject.id == project_id) | (DocProject.slug == project_id)
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    existing = db.query(DocVersion).filter(
        DocVersion.project_id == project.id,
        DocVersion.version_string == payload.version_string
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Version '{payload.version_string}' already exists for this project."
        )

    # If new version is default, unset previous default
    if payload.is_default:
        db.query(DocVersion).filter(DocVersion.project_id == project.id).update({"is_default": False})

    version = DocVersion(
        project_id=project.id,
        version_string=payload.version_string,
        is_prerelease=payload.is_prerelease,
        is_deprecated=payload.is_deprecated,
        is_default=payload.is_default
    )
    db.add(version)
    db.commit()
    db.refresh(version)
    return version
