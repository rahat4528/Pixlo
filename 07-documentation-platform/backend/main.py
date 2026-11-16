import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.db.session import engine, Base
from app.api.v1.projects import router as projects_router
from app.api.v1.versions import router as versions_router
from app.api.v1.pages import router as pages_router
from app.api.v1.api_specs import router as api_specs_router
from app.api.v1.builds import router as builds_router
from app.api.v1.search import router as search_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pixlo Documentation Platform API",
    version="1.0.0",
    description="Developer documentation platform with custom SSG, versioning, OpenAPI parsing, and link auditing."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(projects_router, prefix="/api/v1")
app.include_router(versions_router, prefix="/api/v1")
app.include_router(pages_router, prefix="/api/v1")
app.include_router(api_specs_router, prefix="/api/v1")
app.include_router(builds_router, prefix="/api/v1")
app.include_router(search_router, prefix="/api/v1")


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "07-documentation-platform",
        "port": 4007
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=4007, reload=True)
