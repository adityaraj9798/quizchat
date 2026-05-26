# Full-Stack Quiz Platform & Analytics Dashboard

A comprehensive, full-stack quiz application built for an internship assignment. It features a hierarchical exam flow, robust data tracking, and a dynamic analytics dashboard.

## 🚀 Tech Stack
- **Frontend:** React.js (Vite), Tailwind CSS, Recharts
- **Backend:** FastAPI (Python), Uvicorn
- **Database:** MongoDB (PyMongo)

---

## 🧠 Architecture & Design (Evaluation Criteria)

### 1. Backend Architecture & API Quality
Built with **FastAPI**, the backend handles requests asynchronously and ensures type safety using Pydantic models for request validation (e.g., `AnswerSubmission`). The API provides clean, distinct endpoints for fetching hierarchical data (`/api/flow`), handling quiz mechanics (`/api/submit`), and calculating heavy dashboard metrics (`/api/analytics`).

### 2. Database Design
Uses **MongoDB** with a highly structured schema tailored for performance and analytics tracking:
- **Hierarchy Collections:** `exams`, `subjects`, `chapters`, `questions`.
- **Session Tracking:** The `quiz_sessions` collection tracks when a user starts and either completes or drops off from a quiz.
- **Analytics Tracking:** The `analytics` collection logs granular, event-based data including `shown_timestamp`, `submitted_timestamp`, `duration_ms`, and `is_correct` for deep data insights.

### 3. Analytics Thinking
The backend features complex aggregation pipelines to exceed the minimum requirement, calculating **7 actionable metrics**:
1. **Daily Active Users (DAU)**
2. **Questions Served**
3. **Questions Answered**
4. **Average Response Time** (calculated using exact millisecond differentials)
5. **Quiz Completion Rate**
6. **Drop-off Analysis**
7. **Average Questions per Session**

### 4. Frontend Implementation & Code Structure
The React frontend acts as a responsive Single Page Application (SPA). 
- **State Management:** Manages step-by-step navigation state (Exam -> Subject -> Chapter -> Quiz -> Results).
- **UI/UX:** Styled completely with Tailwind CSS for a modern, mobile-friendly interface.
- **Data Visualization:** Utilizes `recharts` to render a visual funnel of Served vs. Answered questions.

---

## 🛠️ Local Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js & npm
- MongoDB (running locally on port 27017)

### 1. Backend Setup & Seeding
Navigate to the backend directory, install dependencies, seed the dummy data, and start the server:
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # (On Windows)
pip install fastapi uvicorn pymongo pydantic

# Seed the database with users, hierarchy, and dummy analytics
python seed.py

# Start the API
uvicorn main:app --reload
```

### 2. Frontend Setup
In a new terminal window, navigate to the frontend, install packages, and run the development server:
```bash
cd frontend
npm install
npm run dev
```

### 3. Usage
Open your browser to `http://localhost:5173`. 
- Navigate through the course selection to begin a quiz.
- Deliberately abandon a quiz mid-way to see the Drop-off metric update!
- Click the "Dashboard" view to see the live metrics updated from your session.