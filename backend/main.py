from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel

app = FastAPI(title="QuizChat API")

# Allow the React frontend (usually running on Vite port 5173) to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
client = MongoClient("mongodb://localhost:27017/")
db = client["quizchat_db"]

# Pydantic models for request validation
class AnswerSubmission(BaseModel):
    question_id: int
    selected_option: str

@app.get("/api/questions")
def get_all_questions():
    """Fetch all quiz questions for the chat flow."""
    questions = list(db["questions"].find({}, {"_id": 0}))
    return {"questions": questions}

@app.post("/api/submit")
def submit_answer(submission: AnswerSubmission):
    """Evaluate the submitted answer and save it to analytics."""
    question = db["questions"].find_one({"question_id": submission.question_id})
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    is_correct = (question["correct_answer"] == submission.selected_option)
    
    # Save the result to the analytics collection
    db["analytics"].insert_one({
        "question_id": submission.question_id,
        "is_correct": is_correct,
        "selected": submission.selected_option
    })

    return {
        "correct": is_correct,
        "correct_answer": question["correct_answer"],
        "message": "Correct! 🎉" if is_correct else "Oops, that's incorrect! 😅"
    }

@app.get("/api/analytics")
def get_analytics():
    """Get basic analytics for the React Dashboard component."""
    total_answers = db["analytics"].count_documents({})
    correct_answers = db["analytics"].count_documents({"is_correct": True})
    
    score = (correct_answers / total_answers * 100) if total_answers > 0 else 0
    
    return {
        "total_answered": total_answers,
        "correct_answers": correct_answers,
        "overall_score_percentage": round(score, 2)
    }
