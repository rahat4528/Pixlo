from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...models.doc_models import DocProject, DocPage, DocVersion
from ...schemas.doc_schemas import SearchResponse, SearchResultItem
from generator.search_indexer import SearchIndexer

router = APIRouter(prefix="/projects/{project_id}/search", tags=["Search"])


@router.get("", response_model=SearchResponse)
def search_documentation(
    project_id: str,
    q: str = Query(..., min_length=1),
    version: Optional[str] = None,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    project = db.query(DocProject).filter(
        (DocProject.id == project_id) | (DocProject.slug == project_id)
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Fetch pages to index
    pages_query = db.query(DocPage, DocVersion).join(DocVersion, DocPage.version_id == DocVersion.id).filter(
        DocPage.project_id == project.id
    )
    if version:
        pages_query = pages_query.filter(DocVersion.version_string == version)

    results_db = pages_query.all()

    indexer = SearchIndexer()
    for page, ver in results_db:
        toc_items = page.metadata_json.get("toc", []) if page.metadata_json else []
        headings = [t.get("title", "") for t in toc_items]
        indexer.add_document(
            doc_id=page.id,
            title=page.title,
            slug=page.slug,
            body=page.raw_content,
            headings=headings,
            version=ver.version_string
        )

    search_hits = indexer.search(query=q, version=version, limit=limit)

    items = [
        SearchResultItem(
            id=hit["id"],
            title=hit["title"],
            slug=hit["slug"],
            version=hit["version"],
            score=hit["score"],
            snippet=hit["snippet"]
        )
        for hit in search_hits
    ]

    return SearchResponse(
        query=q,
        total_results=len(items),
        results=items
    )
