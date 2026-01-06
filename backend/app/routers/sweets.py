from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.seed import Seed
from app.models.user import User
from app.schemas.seed import SeedCreate, SeedUpdate, SeedResponse
from app.middleware.auth import get_current_user, get_current_admin_user

router = APIRouter(prefix="/api/seeds", tags=["seeds"])


@router.post("", response_model=SeedResponse, status_code=status.HTTP_201_CREATED)
async def create_seed(
    seed_data: SeedCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new seed (Admin only)"""
    new_seed = Seed(**seed_data.model_dump())
    db.add(new_seed)
    db.commit()
    db.refresh(new_seed)
    return new_seed


@router.get("", response_model=List[SeedResponse])
async def get_all_seeds(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all available seeds"""
    seeds = db.query(Seed).all()
    print(f"[DEBUG] get_all_seeds: Found {len(seeds)} seeds")
    if len(seeds) > 0:
        print(
            f"[DEBUG] First seed: ID={seeds[0].id}, Name={seeds[0].name}, Price={seeds[0].price}")
    else:
        print("[DEBUG] No seeds found in database!")
    return seeds


@router.get("/search", response_model=List[SeedResponse])
async def search_seeds(
    name: Optional[str] = Query(None, description="Search by name"),
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(
        None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(
        None, ge=0, description="Maximum price"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search seeds by name, category, or price range"""
    query = db.query(Seed)

    if name:
        query = query.filter(Seed.name.ilike(f"%{name}%"))

    if category:
        query = query.filter(Seed.category.ilike(f"%{category}%"))

    if min_price is not None:
        query = query.filter(Seed.price >= min_price)

    if max_price is not None:
        query = query.filter(Seed.price <= max_price)

    seeds = query.all()
    return seeds


@router.get("/{seed_id}", response_model=SeedResponse)
async def get_seed(
    seed_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific seed by ID"""
    seed = db.query(Seed).filter(Seed.id == seed_id).first()
    if not seed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seed not found"
        )
    return seed


@router.put("/{seed_id}", response_model=SeedResponse)
async def update_seed(
    seed_id: int,
    seed_data: SeedUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a seed's details"""
    seed = db.query(Seed).filter(Seed.id == seed_id).first()
    if not seed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seed not found"
        )

    # Update only provided fields
    update_data = seed_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(seed, field, value)

    db.commit()
    db.refresh(seed)
    return seed


@router.delete("/{seed_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_seed(
    seed_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a seed (Admin only)"""
    seed = db.query(Seed).filter(Seed.id == seed_id).first()
    if not seed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seed not found"
        )

    db.delete(seed)
    db.commit()
    return None
