from pymongo import MongoClient

# Connect to local MongoDB instance
client = MongoClient("mongodb://localhost:27017/")
db = client["quizchat_db"]
collection = db["questions"]

# Dummy data tailored for a WhatsApp-style chat flow
dummy_questions = [
    {
        "question_id": 1,
        "text": "Hey there! 👋 Let's test your knowledge. What is the primary language used to build React applications?",
        "options": ["Python", "JavaScript", "C++", "Java"],
        "correct_answer": "JavaScript"
    },
    {
        "question_id": 2,
        "text": "Awesome. Next question: Which framework is used for building fast APIs in Python? 🐍",
        "options": ["Django", "Flask", "FastAPI", "Spring"],
        "correct_answer": "FastAPI"
    },
    {
        "question_id": 3,
        "text": "Last one! What database stores data in flexible, JSON-like documents? 🗄️",
        "options": ["PostgreSQL", "MySQL", "MongoDB", "SQLite"],
        "correct_answer": "MongoDB"
    }
]

def seed_db():
    # Clear existing data to avoid duplicates if run multiple times
    collection.delete_many({})
    db["analytics"].delete_many({}) # Clear analytics too
    
    # Insert new dummy data
    collection.insert_many(dummy_questions)
    print(f"✅ Successfully seeded database with {len(dummy_questions)} questions!")

if __name__ == "__main__":
    seed_db()
