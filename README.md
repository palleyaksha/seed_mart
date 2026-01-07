# Seed Shop Management System
Inventory & Sales Management Web Application for Agricultural Seed Stores

A full-stack web application for managing a seed shop's inventory, built with **Python + FastAPI** (backend) and **React + TypeScript** (frontend).


## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.8+
- **Database**: SQLite
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: pytest, pytest-cov

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router
- **HTTP Client**: Axios

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from env.example)
# Set JWT_SECRET_KEY to a strong secret (min 32 chars)

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
python -m uvicorn app.main:app --reload --host localhost --port 8000
```

Backend will be available at: http://localhost:8000
API Documentation: http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will be available at: http://localhost:5173

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Seeds (Protected)
- `GET /api/seeds` - Get all seeds
- `GET /api/seeds/search` - Search seeds (name, category, price range)
- `POST /api/seeds` - Create seed (Admin only)
- `PUT /api/seeds/:id` - Update seed
- `DELETE /api/seeds/:id` - Delete seed (Admin only)

### Inventory (Protected)
 - `POST /api/seeds/:id/purchase` - Purchase a seed
 - `POST /api/seeds/:id/restock` - Restock seed (Admin only)

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest                    # Run all tests
pytest --cov=app          # With coverage
pytest tests/test_auth.py # Specific test file
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📁 Project Structure

```
seed-project/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── routers/         # API route handlers
│   │   ├── utils/           # Utilities (auth helpers)
│   │   └── middleware/      # Auth middleware
│   ├── tests/               # Test files
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context (Auth)
│   │   └── services/        # API service layer
│   └── package.json
└── README.md
```

## 🎯 Features

- ✅ User authentication (Register/Login)
- ✅ JWT-based authentication
- ✅ View all seeds
- ✅ Search and filter seeds
- ✅ Purchase seeds (decreases quantity)
- ✅ Admin features (Create, Update, Delete seeds)
- ✅ Restock functionality (Admin only)
- ✅ Responsive UI
- ✅ Comprehensive test coverage

## 📸 Screenshots

1.Login Page

<img width="1915" height="915" alt="Screenshot 2026-01-06 120146" src="https://github.com/user-attachments/assets/c15f7c1c-9ce5-4959-b362-0702320f1b56" />

2.Home Page(Dashboard)

<img width="1889" height="947" alt="Screenshot 2026-01-06 120000" src="https://github.com/user-attachments/assets/01224b98-ca36-44cd-a2f0-574b96d344b6" />

3.Cart

<img width="1882" height="939" alt="Screenshot 2026-01-06 120052" src="https://github.com/user-attachments/assets/a183448d-1fab-43ba-b128-8ef039570388" />

4.Placing Order

<img width="1917" height="490" alt="Screenshot 2026-01-06 120119" src="https://github.com/user-attachments/assets/2f17f351-262a-4509-8852-de046607861e" />

5.Backend UI

<img width="1901" height="963" alt="Screenshot 2026-01-06 120551" src="https://github.com/user-attachments/assets/eea558f3-dce4-4df0-b811-709884e332e8" />

<img width="1897" height="880" alt="Screenshot 2026-01-06 120605" src="https://github.com/user-attachments/assets/30dc60aa-1fa2-47c2-8796-7f6addc83f46" />

## 📝 Development Process

This project was developed using **Test-Driven Development (TDD)**:
1. Write a failing test (Red)
2. Write minimal code to pass (Green)
3. Refactor for quality (Refactor)
4. Repeat

The git commit history demonstrates this pattern throughout development.

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected routes with middleware
- Input validation with Pydantic
- SQL injection prevention with SQLAlchemy ORM

## 📄 License

This project is licensed under the MIT License.

## 📞 Contact

- Palle Yaksha Reddy - palleyaksha28@gmail.com

- Project Link: https://github.com/palleyaksha/seed_mart

