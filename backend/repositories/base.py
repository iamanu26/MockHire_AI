# repositories/base.py — Abstract base repository
# SOLID: OCP — extend by subclassing, not by modifying
# SOLID: DIP — services depend on this abstraction, not concrete DB queries
from abc import ABC, abstractmethod
from typing import TypeVar, Generic, Optional, List
from sqlalchemy.orm import Session

T = TypeVar("T")


class BaseRepository(ABC, Generic[T]):
    """
    Abstract repository — defines the contract for all data access.
    Pattern: Repository Pattern
    """

    def __init__(self, db: Session):
        self.db = db

    @abstractmethod
    def find_by_id(self, id: int) -> Optional[T]:
        pass

    @abstractmethod
    def save(self, entity: T) -> T:
        pass

    @abstractmethod
    def delete(self, entity: T) -> None:
        pass

    def commit(self):
        self.db.commit()

    def refresh(self, entity: T) -> T:
        self.db.refresh(entity)
        return entity