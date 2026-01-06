from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from app.database import get_db
from app.models.seed import Seed
from app.models.user import User
from app.schemas.seed import SeedResponse
from app.middleware.auth import get_current_user, get_current_admin_user

router = APIRouter(prefix="/api/seeds", tags=["inventory"])


class RestockRequest(BaseModel):
    quantity: int = Field(..., gt=0)


@router.post("/{seed_id}/purchase", response_model=SeedResponse)
async def purchase_seed(
    seed_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Purchase a seed, decreasing its quantity by 1"""
    seed = db.query(Seed).filter(Seed.id == seed_id).first()
    if not seed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seed not found"
        )

    if seed.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seed is out of stock"
        )

    seed.quantity -= 1
    db.commit()
    db.refresh(seed)
    return seed


@router.post("/{seed_id}/restock", response_model=SeedResponse)
async def restock_seed(
    seed_id: int,
    restock_data: RestockRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Restock a seed, increasing its quantity (Admin only)"""

    seed = db.query(Seed).filter(Seed.id == seed_id).first()
    if not seed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seed not found"
        )

    seed.quantity += restock_data.quantity
    db.commit()
    db.refresh(seed)
    return seed
