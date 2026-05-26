import React, { useState, useEffect } from 'react';

export default function QuizChat() {
  const [flow, setFlow] = useState({ exams: [], subjects: [], chapters: [] });
  const [step, setStep] = useState('exam');
  const [selection, setSelection] = useState({ exam: null, subject: null, chapter: null });
  
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [shownTimestamp, setShownTimestamp] = useState(null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    fetch(`${API_URL}/api/flow`)
      .then(res => res.json())
      .then(data => setFlow(data));
  }, []);

  const startQuiz = async (chapterId) => {
    const res = await fetch(`${API_URL}/api/chapters/${chapterId}/questions`);
    const data = await res.json();
    setSession(data.session_id);
    setQuestions(data.questions);
    setStep('quiz');
    setShownTimestamp(new Date().toISOString());
  };

  const handleNext = async () => {
    if (!selectedOption) return;
    
    const submittedTime = new Date();
    const duration = submittedTime.getTime() - new Date(shownTimestamp).getTime();

    await fetch(`${API_URL}/api/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: session,
        question_id: questions[currentQIndex].question_id,
        selected_option: selectedOption,
        shown_timestamp: shownTimestamp,
        submitted_timestamp: submittedTime.toISOString(),
        duration_ms: duration
      })
    });

    const nextIndex = currentQIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQIndex(nextIndex);
      setSelectedOption(null);
      setShownTimestamp(new Date().toISOString());
    } else {
      await fetch(`${API_URL}/api/sessions/${session}/complete`, { method: 'POST' });
      setStep('result');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6 overflow-y-auto">
      {step === 'exam' && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-800">Select Exam</h2>
          {flow.exams.length === 0 && (
            <div className="text-red-600 bg-red-50 p-4 rounded-xl border border-red-200">
              No exams loaded. Make sure your backend is running and you ran <code>python seed.py</code>.
            </div>
          )}
          {flow.exams.map(e => (
            <button key={e.exam_id} onClick={() => { setSelection({...selection, exam: e.exam_id}); setStep('subject'); }} className="w-full text-left bg-white p-4 rounded-xl shadow-sm border mb-3 hover:border-green-500">
              {e.name}
            </button>
          ))}
        </div>
      )}

      {step === 'subject' && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-800">Select Subject</h2>
          {flow.subjects.filter(s => s.exam_id === selection.exam).map(s => (
            <button key={s.subject_id} onClick={() => { setSelection({...selection, subject: s.subject_id}); setStep('chapter'); }} className="w-full text-left bg-white p-4 rounded-xl shadow-sm border mb-3 hover:border-green-500">
              {s.name}
            </button>
          ))}
        </div>
      )}

      {step === 'chapter' && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-800">Select Chapter</h2>
          {flow.chapters.filter(c => c.subject_id === selection.subject).map(c => (
            <button key={c.chapter_id} onClick={() => { setSelection({...selection, chapter: c.chapter_id}); startQuiz(c.chapter_id); }} className="w-full text-left bg-white p-4 rounded-xl shadow-sm border mb-3 hover:border-green-500">
              {c.name}
            </button>
          ))}
        </div>
      )}

      {step === 'quiz' && questions.length > 0 && (
        <div className="flex flex-col h-full">
          <div className="mb-4 text-sm text-gray-500 font-bold tracking-wider uppercase">Question {currentQIndex + 1} of {questions.length}</div>
          <h2 className="text-lg font-bold text-gray-800 mb-6">{questions[currentQIndex].text}</h2>
          
          <div className="space-y-3 flex-1">
            {questions[currentQIndex].options.map(opt => (
              <button 
                key={opt} 
                onClick={() => setSelectedOption(opt)}
                className={`w-full text-left p-4 rounded-xl shadow-sm border transition ${selectedOption === opt ? 'border-green-500 bg-green-50' : 'bg-white hover:bg-gray-50'}`}
              >
                {opt}
              </button>
            ))}
          </div>

          <button 
            onClick={handleNext}
            disabled={!selectedOption}
            className={`mt-6 w-full py-3 rounded-xl font-bold text-white transition ${selectedOption ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            {currentQIndex === questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      )}

      {step === 'result' && (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete! 🎉</h2>
          <p className="text-gray-500 mb-6">Your answers and response times have been recorded.</p>
          <button onClick={() => { setStep('exam'); setCurrentQIndex(0); setSelectedOption(null); }} className="px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700">
            Take Another
          </button>
        </div>
      )}
    </div>
  );
}
