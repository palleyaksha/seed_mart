import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.models.seed import Seed
from app.utils.auth import get_password_hash, create_access_token
from datetime import timedelta
from app.config import settings

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={
                       "check_same_thread": False})
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session):
    """Create a test user"""
    user = User(
        email="test@example.com",
        password_hash=get_password_hash("testpassword123"),
        role="user"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_admin(db_session):
    """Create a test admin user"""
    admin = User(
        email="admin@example.com",
        password_hash=get_password_hash("adminpassword123"),
        role="admin"
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture
def user_token(test_user):
    """Get JWT token for test user"""
    access_token_expires = timedelta(
        minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        data={"sub": test_user.id, "email": test_user.email,
              "role": test_user.role},
        expires_delta=access_token_expires
    )
    return token


@pytest.fixture
def admin_token(test_admin):
    """Get JWT token for test admin"""
    access_token_expires = timedelta(
        minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        data={"sub": test_admin.id, "email": test_admin.email,
              "role": test_admin.role},
        expires_delta=access_token_expires
    )
    return token


@pytest.fixture
def test_seed(db_session):
    """Create a test seed"""
    seed = Seed(
        name="Sample Seed",
        category="Sample",
        price=2.50,
        quantity=100
    )
    db_session.add(seed)
    db_session.commit()
    db_session.refresh(seed)
    return seed


@pytest.fixture
def test_sweet(test_seed):
    """Compatibility alias: legacy fixture name used in some tests"""
    return test_seed
