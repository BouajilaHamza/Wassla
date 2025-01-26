from sqlmodel import Session, create_engine

from backend.app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
# SQLModel.metadata.create_all(engine)


# Dependency for FastAPI routes
def get_session():
    with Session(engine) as session:
        yield session
