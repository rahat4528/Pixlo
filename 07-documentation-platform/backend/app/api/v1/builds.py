import os
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...models.doc_models import DocProject, DocVersion, DocPage, DocApiSpec, DocBuildRun
from ...schemas.doc_schemas import BuildRunCreate, BuildRunResponse
from ...core.config import settings
from generator.builder import DocumentationBuilder
from generator.version_manager import DocVersion as EngineDocVersion

router = APIRouter(prefix="/projects/{project_id}/builds", tags=["Builds & Static Generator"])


@router.get("", response_model=List[BuildRunResponse])
def list_build_runs(project_id: str, db: Session = Depends(get_db)):
    project = db.query(DocProject).filter(
        (DocProject.id == project_id) | (DocProject.slug == project_id)
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    return db.query(DocBuildRun).filter(DocBuildRun.project_id == project.id).order_by(DocBuildRun.created_at.desc()).all()


@router.post("", response_model=BuildRunResponse, status_code=status.HTTP_201_CREATED)
def trigger_build(project_id: str, payload: BuildRunCreate, db: Session = Depends(get_db)):
    project = db.query(DocProject).filter(
        (DocProject.id == project_id) | (DocProject.slug == project_id)
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # Fetch all versions for this project
    db_versions = db.query(DocVersion).filter(DocVersion.project_id == project.id).all()
    if not db_versions:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No versions defined for project.")

    engine_versions = [
        EngineDocVersion(
            version_str=v.version_string,
            is_prerelease=v.is_prerelease,
            is_deprecated=v.is_deprecated,
            is_default=v.is_default
        )
        for v in db_versions
    ]

    # Organize pages by version string
    pages_by_version: Dict[str, List[Dict[str, Any]]] = {}
    openapi_specs_by_version: Dict[str, str] = {}

    for v in db_versions:
        pages = db.query(DocPage).filter(DocPage.version_id == v.id).order_by(DocPage.order_index.asc()).all()
        pages_by_version[v.version_string] = [
            {"slug": p.slug, "title": p.title, "raw_content": p.raw_content}
            for p in pages
        ]

        spec = db.query(DocApiSpec).filter(DocApiSpec.version_id == v.id).first()
        if spec:
            openapi_specs_by_version[v.version_string] = spec.raw_spec

    # Resolve paths relative to 07-documentation-platform root
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
    templates_dir = os.path.join(base_dir, "templates")
    output_dir = os.path.join(base_dir, "dist", project.slug)

    builder = DocumentationBuilder(
        project_name=project.name,
        templates_dir=templates_dir,
        output_dir=output_dir,
        versions=engine_versions
    )

    try:
        build_output = builder.build_project(
            pages_by_version=pages_by_version,
            openapi_specs_by_version=openapi_specs_by_version
        )
        build_status = "SUCCESS" if build_output["broken_links_count"] == 0 else "WARNING"
        log = (
            f"Built {build_output['total_pages_built']} pages in {build_output['build_duration_ms']}ms. "
            f"Broken links: {build_output['broken_links_count']}."
        )
    except Exception as e:
        build_status = "FAILED"
        log = f"Build failed with exception: {str(e)}"
        build_output = {"total_pages_built": 0, "broken_links_count": 0, "build_duration_ms": 0}

    build_run = DocBuildRun(
        project_id=project.id,
        version_id=payload.version_id,
        trigger_type=payload.trigger_type,
        status=build_status,
        total_pages=build_output["total_pages_built"],
        broken_links_count=build_output["broken_links_count"],
        build_duration_ms=build_output["build_duration_ms"],
        log_output=log
    )
    db.add(build_run)
    db.commit()
    db.refresh(build_run)

    return build_run
