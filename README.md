# 🍬 Seed Shop Management System

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

_Add screenshots of your application here_

## 🤖 My AI Usage

### AI Tools Used
- **Cursor AI** - Used for code generation, suggestions, and debugging throughout the project

### How I Used AI

#### Backend Development
- **Initial Setup**: Used AI to generate FastAPI project structure and boilerplate code
- **Database Models**: AI assisted in creating SQLAlchemy models with proper relationships
- **API Routes**: Used AI to generate initial route handlers, then customized for our needs
- **Authentication**: AI helped with JWT implementation and password hashing patterns
- **Testing**: AI generated test templates and fixtures, then I wrote specific test cases

#### Frontend Development
- **Component Structure**: AI generated React component boilerplate
- **API Integration**: AI helped with Axios configuration and interceptors
- **State Management**: Used AI suggestions for React Context patterns
- **UI Components**: AI assisted with form components and styling

#### Code Review & Debugging
- Used AI to understand error messages and suggest fixes
- AI helped review code for potential security issues
- Used AI to refactor and improve code quality

### Reflection on AI Impact

**Positive Impacts:**
- Significantly accelerated development, especially for boilerplate code
- Helped catch bugs early through code review suggestions
- Provided learning opportunities by explaining complex concepts
- Reduced time on repetitive tasks

**Challenges:**
- Sometimes AI-generated code needed refactoring to fit our architecture
- Had to carefully review AI suggestions to ensure best practices
- Occasionally AI suggested overly complex solutions

**My Approach:**
- Used AI as a pair programming tool, not a replacement for understanding
- Always reviewed and understood AI-generated code before committing
- Used AI for learning and exploration, then implemented solutions manually
- Maintained code quality standards regardless of AI assistance

**Commit History:**
All commits where AI was used include co-author attribution. See git log for details.

## 🚢 Deployment

### Backend Deployment
[Add deployment instructions for backend - Railway, Render, Heroku, etc.]

### Frontend Deployment
[Add deployment instructions for frontend - Vercel, Netlify, etc.]

### Live Application
[Add link to deployed application]

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

[Your License Choice]

## 👤 Author

[Your Name]

---

**Note**: This project was developed as a TDD kata. All code follows clean coding principles and best practices.

