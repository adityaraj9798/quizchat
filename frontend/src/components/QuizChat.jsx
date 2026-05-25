import React, { useState, useEffect, useRef } from 'react';

export default function QuizChat() {
  const [questions, setQuestions] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const chatEndRef = useRef(null);

  // Fetch questions on mount
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/questions')
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions);
        if (data.questions.length > 0) {
          setChatHistory([{ 
            sender: 'bot', 
            text: data.questions[0].text, 
            options: data.questions[0].options 
          }]);
        }
      })
      .catch(err => console.error("Error fetching questions:", err));
  }, []);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleOptionClick = async (option) => {
    const question = questions[currentQIndex];
    
    // 1. Add user's selected answer to the chat immediately
    setChatHistory(prev => [...prev, { sender: 'user', text: option }]);

    // 2. Send the answer to the backend
    const res = await fetch('http://127.0.0.1:8000/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: question.question_id, selected_option: option })
    });
    const result = await res.json();

    // 3. Add bot's evaluation message
    setChatHistory(prev => [...prev, { sender: 'bot', text: result.message }]);

    // 4. Progress to next question, or finish
    const nextIndex = currentQIndex + 1;
    if (nextIndex < questions.length) {
      setTimeout(() => {
        setChatHistory(prev => [
          ...prev, 
          { sender: 'bot', text: questions[nextIndex].text, options: questions[nextIndex].options }
        ]);
        setCurrentQIndex(nextIndex);
      }, 1000); // 1 second delay to simulate typing
    } else {
      setTimeout(() => {
        setChatHistory(prev => [...prev, { sender: 'bot', text: "Quiz complete! Head over to the Dashboard to see your score." }]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#efeae2]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-xl shadow-sm ${msg.sender === 'user' ? 'bg-[#dcf8c6] rounded-tr-sm' : 'bg-white rounded-tl-sm'}`}>
              <p className="text-gray-800 text-[15px]">{msg.text}</p>
            </div>
          </div>
        ))}
        
        {/* Render buttons only on the most recent bot message that contains options */}
        {chatHistory.length > 0 && 
         chatHistory[chatHistory.length - 1].sender === 'bot' && 
         chatHistory[chatHistory.length - 1].options && (
          <div className="flex flex-col space-y-2 mt-4 ml-2">
            {chatHistory[chatHistory.length - 1].options.map((opt, i) => (
              <button 
                key={i} 
                onClick={() => handleOptionClick(opt)}
                className="bg-white border border-green-400 text-green-700 font-medium py-2 px-4 rounded-xl shadow-sm hover:bg-green-50 transition w-fit text-left"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}
