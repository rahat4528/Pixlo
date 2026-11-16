from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...models.doc_models import DocProject, DocVersion, DocApiSpec
from ...schemas.doc_schemas import ApiSpecCreate, ApiSpecResponse
from generator.openapi_parser import OpenAPIParser

router = APIRouter(prefix="/projects/{project_id}/api-specs", tags=["API Specifications"])


@router.get("", response_model=List[ApiSpecResponse])
def list_api_specs(project_id: str, db: Session = Depends(get_db)):
    project = db.query(DocProject).filter(
        (DocProject.id == project_id) | (DocProject.slug == project_id)
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    return db.query(DocApiSpec).filter(DocApiSpec.project_id == project.id).all()


@router.post("", response_model=ApiSpecResponse, status_code=status.HTTP_201_CREATED)
def upload_api_spec(project_id: str, payload: ApiSpecCreate, db: Session = Depends(get_db)):
    project = db.query(DocProject).filter(
        (DocProject.id == project_id) | (DocProject.slug == project_id)
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    version = db.query(DocVersion).filter(
        DocVersion.id == payload.version_id,
        DocVersion.project_id == project.id
    ).first()
    if not version:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version not found")

    # Validate and parse OpenAPI spec
    try:
        parser = OpenAPIParser(payload.raw_spec)
        endpoints = parser.parse_endpoints()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse OpenAPI specification: {str(e)}"
        )

    spec = DocApiSpec(
        project_id=project.id,
        version_id=version.id,
        title=payload.title,
        spec_type="OPENAPI_3",
        raw_spec=payload.raw_spec,
        parsed_endpoints_json=endpoints
    )
    db.add(spec)
    db.commit()
    db.refresh(spec)
    return spec
