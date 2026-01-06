from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.sql import func
from app.database import Base

# Default SVG image for seeds without an image
DEFAULT_SEED_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='35' fill='%238B7355'/%3E%3Ccircle cx='50' cy='50' r='20' fill='%23A0826D'/%3E%3Ccircle cx='45' cy='48' r='2' fill='%23333333'/%3E%3Ccircle cx='55' cy='48' r='2' fill='%23333333'/%3E%3Ccircle cx='50' cy='57' r='2' fill='%23333333'/%3E%3C/svg%3E"


class Seed(Base):
    __tablename__ = "seeds"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, default=0, nullable=False)
    image = Column(String, nullable=True, default=DEFAULT_SEED_IMAGE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True),
                        onupdate=func.now(), server_default=func.now())
