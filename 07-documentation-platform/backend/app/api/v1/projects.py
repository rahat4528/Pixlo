from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...models.doc_models import DocProject, DocVersion
from ...schemas.doc_schemas import ProjectCreate, ProjectResponse

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    return db.query(DocProject).order_by(DocProject.created_at.desc()).all()


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    existing = db.query(DocProject).filter(DocProject.slug == payload.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Project with slug '{payload.slug}' already exists."
        )

    project = DocProject(
        name=payload.name,
        slug=payload.slug,
        description=payload.description,
        repository_url=payload.repository_url,
        default_version=payload.default_version
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    # Initialize default version 'v1.0.0'
    default_ver = DocVersion(
        project_id=project.id,
        version_string="v1.0.0",
        is_default=True
    )
    db.add(default_ver)
    db.commit()

    return project


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(DocProject).filter(
        (DocProject.id == project_id) | (DocProject.slug == project_id)
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(DocProject).filter(
        (DocProject.id == project_id) | (DocProject.slug == project_id)
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    db.delete(project)
    db.commit()
    return None
