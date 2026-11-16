from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...models.doc_models import DocProject, DocVersion, DocPage
from ...schemas.doc_schemas import PageCreate, PageUpdate, PageResponse
from generator.markdown_parser import render_markdown

router = APIRouter(tags=["Pages"])


@router.get("/projects/{project_id}/pages", response_model=List[PageResponse])
def list_pages(project_id: str, version_id: Optional[str] = None, db: Session = Depends(get_db)):
    project = db.query(DocProject).filter(
        (DocProject.id == project_id) | (DocProject.slug == project_id)
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    query = db.query(DocPage).filter(DocPage.project_id == project.id)
    if version_id:
        query = query.filter(DocPage.version_id == version_id)

    return query.order_by(DocPage.order_index.asc()).all()


@router.post("/projects/{project_id}/pages", response_model=PageResponse, status_code=status.HTTP_201_CREATED)
def create_page(project_id: str, payload: PageCreate, db: Session = Depends(get_db)):
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

    existing = db.query(DocPage).filter(
        DocPage.version_id == version.id,
        DocPage.slug == payload.slug
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Page with slug '{payload.slug}' already exists in this version.")

    # Render markdown and extract metadata
    parsed = render_markdown(payload.raw_content)

    doc_path = payload.path or f"/docs/{version.version_string}/{payload.slug}"

    page = DocPage(
        project_id=project.id,
        version_id=version.id,
        slug=payload.slug,
        path=doc_path,
        title=payload.title or parsed["title"],
        raw_content=payload.raw_content,
        html_content=parsed["html"],
        order_index=payload.order_index,
        parent_id=payload.parent_id,
        metadata_json={
            "toc": parsed["toc"],
            "frontmatter": parsed["metadata"]
        }
    )
    db.add(page)
    db.commit()
    db.refresh(page)
    return page


@router.get("/pages/{page_id}", response_model=PageResponse)
def get_page(page_id: str, db: Session = Depends(get_db)):
    page = db.query(DocPage).filter(DocPage.id == page_id).first()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    return page


@router.put("/pages/{page_id}", response_model=PageResponse)
def update_page(page_id: str, payload: PageUpdate, db: Session = Depends(get_db)):
    page = db.query(DocPage).filter(DocPage.id == page_id).first()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")

    if payload.title is not None:
        page.title = payload.title
    if payload.order_index is not None:
        page.order_index = payload.order_index
    if payload.parent_id is not None:
        page.parent_id = payload.parent_id

    if payload.raw_content is not None:
        page.raw_content = payload.raw_content
        parsed = render_markdown(payload.raw_content)
        page.html_content = parsed["html"]
        page.metadata_json = {
            "toc": parsed["toc"],
            "frontmatter": parsed["metadata"]
        }

    db.commit()
    db.refresh(page)
    return page


@router.delete("/pages/{page_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_page(page_id: str, db: Session = Depends(get_db)):
    page = db.query(DocPage).filter(DocPage.id == page_id).first()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    db.delete(page)
    db.commit()
    return None
