from typing import Generator


def get_db() -> Generator:
    """Database session dependency placeholder."""
    db = None
    try:
        yield db
    finally:
        pass
