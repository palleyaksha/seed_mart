"""Script to create an admin user"""
from app.database import SessionLocal, init_db
from app.models.user import User
from app.utils.auth import get_password_hash

# Initialize database
init_db()

# Create database session
db = SessionLocal()

try:
    # Check if admin already exists
    existing_admin = db.query(User).filter(User.email == "admin@example.com").first()
    if existing_admin:
        print("Admin user already exists!")
    else:
        # Create admin user
        admin = User(
            email="admin@example.com",
            password_hash=get_password_hash("admin123"),
            role="admin"
        )
        db.add(admin)
        db.commit()
        print("Admin user created successfully!")
        print("   Email: admin@example.com")
        print("   Password: admin123")
except Exception as e:
    print(f"Error creating admin: {e}")
    db.rollback()
finally:
    db.close()

