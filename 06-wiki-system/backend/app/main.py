from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import Base, engine
from app.api.routers import auth, spaces, pages, approvals, storage

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pixlo Wiki System API",
    description="Knowledge base and team documentation engine with hierarchical spaces, permission inheritance, bi-directional backlinks, version diffs, and approval workflows",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3006",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under /api
app.include_router(auth.router, prefix="/api")
app.include_router(spaces.router, prefix="/api")
app.include_router(pages.router, prefix="/api")
app.include_router(approvals.router, prefix="/api")
app.include_router(storage.router, prefix="/api")

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "pixlo-wiki-system",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
