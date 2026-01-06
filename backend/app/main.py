from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db, SessionLocal
from app.routers import auth, seeds, inventory
from app.models.seed import Seed

# Initialize FastAPI app with OpenAPI security scheme for Swagger
app = FastAPI(
    title="Seed Shop Management System API",
    description="RESTful API for managing a seed shop inventory",
    version="1.0.0",
    swagger_ui_parameters={
        "persistAuthorization": True,
        "displayOperationId": True,
    }
)

# Add OpenAPI security scheme for Bearer token
app.openapi_schema = None


def get_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    from fastapi.openapi.utils import get_openapi
    openapi_schema = get_openapi(
        title="Seed Shop Management System API",
        version="1.0.0",
        description="RESTful API for managing a seed shop inventory",
        routes=app.routes,
    )
    bearer_scheme = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "Enter a valid JWT token. Get one from /api/auth/login or /api/auth/register",
    }
    # Keep both names to match FastAPI's HTTPBearer dependency
    openapi_schema["components"]["securitySchemes"] = {
        "Bearer": bearer_scheme,
        "HTTPBearer": bearer_scheme,
    }
    # Apply Bearer security globally so Swagger's Authorize button works
    openapi_schema["security"] = [{"Bearer": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = get_openapi

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database


@app.on_event("startup")
async def startup_event():
    init_db()
    db = SessionLocal()
    try:
        count = db.query(Seed).count()
        if count == 0:
            default_seeds = [
                {"name": "Sunflower Seed", "category": "Flower", "price": 25.00, "quantity": 50, "image": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23FFD700'/%3E%3Ccircle cx='50' cy='30' r='5' fill='%23FFA500'/%3E%3Ccircle cx='65' cy='35' r='5' fill='%23FFA500'/%3E%3Ccircle cx='70' cy='50' r='5' fill='%23FFA500'/%3E%3Ccircle cx='65' cy='65' r='5' fill='%23FFA500'/%3E%3Ccircle cx='50' cy='70' r='5' fill='%23FFA500'/%3E%3Ccircle cx='35' cy='65' r='5' fill='%23FFA500'/%3E%3Ccircle cx='30' cy='50' r='5' fill='%23FFA500'/%3E%3Ccircle cx='35' cy='35' r='5' fill='%23FFA500'/%3E%3C/svg%3E"},
                {"name": "Pumpkin Seed", "category": "Vegetable", "price": 20.00, "quantity": 60,
                    "image": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cellipse cx='50' cy='50' rx='35' ry='38' fill='%23FF8C00'/%3E%3Cline x1='50' y1='15' x2='50' y2='85' stroke='%23228B22' stroke-width='2'/%3E%3Cline x1='20' y1='50' x2='80' y2='50' stroke='%23228B22' stroke-width='2'/%3E%3C/svg%3E"},
                {"name": "Sesame Seed", "category": "Herb", "price": 45.00, "quantity": 40, "image": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='30' cy='30' r='8' fill='%23F5DEB3'/%3E%3Ccircle cx='70' cy='30' r='8' fill='%23F5DEB3'/%3E%3Ccircle cx='30' cy='70' r='8' fill='%23F5DEB3'/%3E%3Ccircle cx='70' cy='70' r='8' fill='%23F5DEB3'/%3E%3Ccircle cx='50' cy='50' r='8' fill='%23F5DEB3'/%3E%3C/svg%3E"},
                {"name": "Chia Seed", "category": "Superfood", "price": 30.00, "quantity": 55,
                    "image": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='35' fill='%23333333'/%3E%3Ccircle cx='50' cy='50' r='25' fill='%23555555'/%3E%3C/svg%3E"},
                {"name": "Flaxseed", "category": "Superfood", "price": 15.00, "quantity": 80,
                    "image": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cellipse cx='50' cy='50' rx='15' ry='30' fill='%23CD853F'/%3E%3Cellipse cx='50' cy='50' rx='10' ry='25' fill='%23DEB887'/%3E%3C/svg%3E"},
                {"name": "Quinoa Seed", "category": "Grain", "price": 35.00, "quantity": 45,
                    "image": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='30' fill='%23F5F5DC'/%3E%3Ccircle cx='40' cy='45' r='8' fill='%23DAA520'/%3E%3Ccircle cx='60' cy='45' r='8' fill='%23DAA520'/%3E%3Ccircle cx='50' cy='65' r='8' fill='%23DAA520'/%3E%3C/svg%3E"},
                {"name": "Mustard Seed", "category": "Spice", "price": 40.00, "quantity": 35,
                    "image": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='35' fill='%23B8860B'/%3E%3Ccircle cx='50' cy='50' r='20' fill='%23DAA520'/%3E%3C/svg%3E"},
                {"name": "Cumin Seed", "category": "Spice", "price": 28.00, "quantity": 50,
                    "image": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='20' y='40' width='60' height='20' fill='%238B7355'/%3E%3Ccircle cx='35' cy='50' r='4' fill='%235C4033'/%3E%3Ccircle cx='50' cy='50' r='4' fill='%235C4033'/%3E%3Ccircle cx='65' cy='50' r='4' fill='%235C4033'/%3E%3C/svg%3E"},
                {"name": "Fennel Seed", "category": "Spice", "price": 32.00, "quantity": 60,
                    "image": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cellipse cx='50' cy='50' rx='12' ry='28' fill='%238B7355'/%3E%3Cline x1='40' y1='50' x2='60' y2='50' stroke='%235C4033' stroke-width='2'/%3E%3C/svg%3E"},
                {"name": "Caraway Seed", "category": "Spice", "price": 38.00, "quantity": 55,
                    "image": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cellipse cx='50' cy='50' rx='14' ry='26' fill='%23654321'/%3E%3C/svg%3E"},
                {"name": "Coriander Seed", "category": "Spice", "price": 35.00, "quantity": 65,
                    "image": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='32' fill='%23D2B48C'/%3E%3Ccircle cx='50' cy='50' r='18' fill='%23C19A6B'/%3E%3C/svg%3E"},
                {"name": "Fenugreek Seed", "category": "Herb", "price": 42.00, "quantity": 48, "image": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='30' y='35' width='40' height='30' fill='%238B4513'/%3E%3Cline x1='35' y1='40' x2='65' y2='40' stroke='%23654321' stroke-width='2'/%3E%3Cline x1='35' y1='50' x2='65' y2='50' stroke='%23654321' stroke-width='2'/%3E%3Cline x1='35' y1='60' x2='65' y2='60' stroke='%23654321' stroke-width='2'/%3E%3C/svg%3E"},
                {"name": "Hemp Seed", "category": "Superfood", "price": 50.00, "quantity": 35,
                    "image": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='35' fill='%235C4033'/%3E%3Ccircle cx='50' cy='50' r='22' fill='%238B6F47'/%3E%3C/svg%3E"},
                {"name": "Sesame Seed (Black)", "category": "Herb", "price": 48.00, "quantity": 42,
                 "image": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='30' fill='%23000000'/%3E%3Ccircle cx='50' cy='50' r='15' fill='%23333333'/%3E%3C/svg%3E"},
                {"name": "Sunflower Seed (Striped)", "category": "Flower", "price": 28.00, "quantity": 58,
                 "image": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cellipse cx='50' cy='50' rx='28' ry='35' fill='%23FFD700'/%3E%3Cline x1='25' y1='50' x2='75' y2='50' stroke='%23808080' stroke-width='3'/%3E%3C/svg%3E"},
                {"name": "Pumpkin Seed (Raw)", "category": "Vegetable", "price": 22.00, "quantity": 70,
                 "image": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cellipse cx='50' cy='50' rx='30' ry='32' fill='%23228B22'/%3E%3C/svg%3E"},
                {"name": "Watermelon Seed", "category": "Vegetable", "price": 18.00, "quantity": 75,
                    "image": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cellipse cx='50' cy='50' rx='25' ry='28' fill='%23000000'/%3E%3Cellipse cx='50' cy='50' rx='18' ry='22' fill='%23333333'/%3E%3C/svg%3E"},
                {"name": "Muskmelon Seed", "category": "Vegetable", "price": 19.00, "quantity": 68,
                    "image": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='30' fill='%23F4A460'/%3E%3Ccircle cx='50' cy='50' r='18' fill='%23DEB887'/%3E%3C/svg%3E"},
                {"name": "Poppy Seed", "category": "Herb", "price": 55.00, "quantity": 30,
                    "image": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='32' fill='%23696969'/%3E%3Ccircle cx='50' cy='50' r='18' fill='%23505050'/%3E%3C/svg%3E"},
                {"name": "Nigella Seed", "category": "Spice", "price": 44.00, "quantity": 40,
                    "image": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='28' fill='%23000000'/%3E%3Ccircle cx='45' cy='45' r='4' fill='%23333333'/%3E%3Ccircle cx='55' cy='45' r='4' fill='%23333333'/%3E%3Ccircle cx='50' cy='60' r='4' fill='%23333333'/%3E%3C/svg%3E"},
            ]
            # Insert only seeds that don't already exist (by name)
            existing_names = {n[0].lower() for n in db.query(Seed.name).all()}
            added = 0
            for s in default_seeds:
                if s["name"].lower() not in existing_names:
                    db.add(Seed(**s))
                    existing_names.add(s["name"].lower())
                    added += 1
            if added > 0:
                db.commit()
            print(
                f"Seeded default seeds: {added} new items (of {len(default_seeds)} defaults)")
        else:
            print(f"Database already has {count} seeds; skipping seeding.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

# Include routers
app.include_router(auth.router)
app.include_router(seeds.router)
app.include_router(inventory.router)


@app.get("/")
async def root():
    return {
        "message": "Welcome to Seed Shop Management System API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
