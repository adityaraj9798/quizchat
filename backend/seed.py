from pymongo import MongoClient
from datetime import datetime, timedelta
import random

# Connect to local MongoDB instance
client = MongoClient("mongodb://localhost:27017/")
db = client["quizchat_db"]

def seed_db():
    # Clear existing data
    for col in ["users", "exams", "subjects", "chapters", "questions", "quiz_sessions", "analytics"]:
        db[col].delete_many({})
    
    # Dummy Users
    users = [{"user_id": i, "name": f"User {i}"} for i in range(1, 11)]
    db["users"].insert_many(users)

    # Flow Hierarchy
    db["exams"].insert_one({"exam_id": 1, "name": "Software Engineering Crash Course"})
    db["subjects"].insert_many([
        {"subject_id": 1, "exam_id": 1, "name": "Frontend"},
        {"subject_id": 2, "exam_id": 1, "name": "Backend"}
    ])
    db["chapters"].insert_many([
        {"chapter_id": 1, "subject_id": 1, "name": "React Fundamentals"},
        {"chapter_id": 2, "subject_id": 2, "name": "FastAPI & Python"}
    ])

    # Questions
    questions = [
        {"question_id": 1, "chapter_id": 1, "text": "What is the primary language used to build React applications?", "options": ["Python", "JavaScript", "C++", "Java"], "correct_answer": "JavaScript"},
        {"question_id": 2, "chapter_id": 1, "text": "Which hook is used to manage state in a functional component?", "options": ["useEffect", "useState", "useContext", "useReducer"], "correct_answer": "useState"},
        {"question_id": 3, "chapter_id": 2, "text": "Which framework is used for building fast APIs in Python?", "options": ["Django", "Flask", "FastAPI", "Spring"], "correct_answer": "FastAPI"},
        {"question_id": 4, "chapter_id": 2, "text": "What database stores data in flexible, JSON-like documents?", "options": ["PostgreSQL", "MySQL", "MongoDB", "SQLite"], "correct_answer": "MongoDB"}
    ]
    db["questions"].insert_many(questions)

    # Generate dummy session & analytics data
    now = datetime.utcnow()
    sessions = []
    analytics = []

    for i in range(50):
        session_id = f"sess_{i}"
        user = random.choice(users)
        chapter_id = random.choice([1, 2])
        is_completed = random.random() > 0.3 # Simulate 30% drop-off rate
        
        sessions.append({
            "session_id": session_id,
            "user_id": user["user_id"],
            "chapter_id": chapter_id,
            "start_time": (now - timedelta(days=random.randint(0, 14))).isoformat(),
            "completed": is_completed
        })

        chapter_qs = [q for q in questions if q["chapter_id"] == chapter_id]
        
        # Log served questions
        analytics.append({
            "type": "served",
            "session_id": session_id,
            "count": len(chapter_qs)
        })

        # Log answered questions with timestamps & duration
        for q in chapter_qs:
            if not is_completed and random.random() > 0.5:
                break # Simulate drop-off mid-quiz
            
            shown = now - timedelta(days=random.randint(0, 14))
            duration = random.randint(2000, 12000)
            submitted = shown + timedelta(milliseconds=duration)
            
            analytics.append({
                "type": "answered",
                "session_id": session_id,
                "question_id": q["question_id"],
                "selected": random.choice(q["options"]),
                "is_correct": random.choice([True, False]),
                "shown_timestamp": shown.isoformat(),
                "submitted_timestamp": submitted.isoformat(),
                "duration_ms": duration
            })

    db["quiz_sessions"].insert_many(sessions)
    if analytics:
        db["analytics"].insert_many(analytics)

    print("✅ Successfully seeded database with Flow hierarchy and Analytics!")

if __name__ == "__main__":
    seed_db()
