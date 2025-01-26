from sqlmodel import Session, create_engine

from backend.app.core.config import settings

engine = create_engine(settings.DATABASE_URL)


def get_session():
    with Session(engine) as session:
        yield session
