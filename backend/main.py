from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel
import uuid
import os
from datetime import datetime, timedelta

app = FastAPI(title="QuizChat API")

# Allow the React frontend (usually running on Vite port 5173) to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["quizchat_db"]

# Pydantic models for request validation
class AnswerSubmission(BaseModel):
    session_id: str
    question_id: int
    selected_option: str
    shown_timestamp: str
    submitted_timestamp: str
    duration_ms: int

@app.get("/api/flow")
def get_flow():
    """Returns the Exam -> Subject -> Chapter hierarchy."""
    exams = list(db["exams"].find({}, {"_id": 0}))
    subjects = list(db["subjects"].find({}, {"_id": 0}))
    chapters = list(db["chapters"].find({}, {"_id": 0}))
    return {"exams": exams, "subjects": subjects, "chapters": chapters}

@app.get("/api/chapters/{chapter_id}/questions")
def get_questions(chapter_id: int):
    """Start a session and fetch questions for a chapter."""
    questions = list(db["questions"].find({"chapter_id": chapter_id}, {"_id": 0, "correct_answer": 0}))
    session_id = str(uuid.uuid4())
    
    db["quiz_sessions"].insert_one({
        "session_id": session_id,
        "chapter_id": chapter_id,
        "start_time": datetime.utcnow().isoformat(),
        "completed": False
    })
    
    db["analytics"].insert_one({
        "type": "served",
        "session_id": session_id,
        "count": len(questions)
    })
    
    return {"session_id": session_id, "questions": questions}

@app.post("/api/submit")
def submit_answer(submission: AnswerSubmission):
    """Evaluate answer and store timestamps/duration."""
    question = db["questions"].find_one({"question_id": submission.question_id})
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    is_correct = (question["correct_answer"] == submission.selected_option)
    
    db["analytics"].insert_one({
        "type": "answered",
        "session_id": submission.session_id,
        "question_id": submission.question_id,
        "is_correct": is_correct,
        "selected": submission.selected_option,
        "shown_timestamp": submission.shown_timestamp,
        "submitted_timestamp": submission.submitted_timestamp,
        "duration_ms": submission.duration_ms
    })
    return {"correct": is_correct, "correct_answer": question["correct_answer"]}

@app.post("/api/sessions/{session_id}/complete")
def complete_session(session_id: str):
    db["quiz_sessions"].update_one({"session_id": session_id}, {"$set": {"completed": True}})
    return {"status": "success"}

@app.get("/api/analytics")
def get_analytics():
    """Get comprehensive analytics for the Dashboard."""
    answered_count = db["analytics"].count_documents({"type": "answered"})
    
    served_agg = list(db["analytics"].aggregate([{"$match": {"type": "served"}}, {"$group": {"_id": None, "total": {"$sum": "$count"}}}]))
    served_count = served_agg[0]["total"] if served_agg else 0

    avg_time_agg = list(db["analytics"].aggregate([{"$match": {"type": "answered"}}, {"$group": {"_id": None, "avg_time": {"$avg": "$duration_ms"}}}]))
    avg_time_sec = round((avg_time_agg[0]["avg_time"] or 0) / 1000, 2) if avg_time_agg else 0
    
    total_sessions = db["quiz_sessions"].count_documents({})
    completed_sessions = db["quiz_sessions"].count_documents({"completed": True})
    completion_rate = round((completed_sessions / total_sessions * 100), 2) if total_sessions > 0 else 0
    drop_offs = total_sessions - completed_sessions
    
    avg_qs_per_session = round(answered_count / total_sessions, 2) if total_sessions > 0 else 0
    
    yesterday = (datetime.utcnow() - timedelta(days=1)).isoformat()
    dau_pipeline = [
        {"$match": {"start_time": {"$gte": yesterday}}},
        {"$group": {"_id": "$user_id"}}
    ]
    dau = len(list(db["quiz_sessions"].aggregate(dau_pipeline)))

    return {
        "questions_answered": answered_count,
        "questions_served": served_count,
        "average_response_time": avg_time_sec,
        "quiz_completion_rate": completion_rate,
        "drop_offs": drop_offs,
        "average_questions_per_session": avg_qs_per_session,
        "daily_active_users": dau
    }
