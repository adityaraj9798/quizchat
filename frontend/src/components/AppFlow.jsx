import React, { useState } from 'react';
import QuizChat from './QuizChat';
import Dashboard from './Dashboard';

export default function AppFlow() {
  const [view, setView] = useState('quiz');

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center py-8">
      <nav className="w-full max-w-md flex justify-between items-center bg-white p-4 rounded-t-xl shadow-sm border-b">
        <h1 className="text-xl font-bold text-green-600">QuizChat</h1>
        <div>
          <button 
            onClick={() => setView('quiz')}
            className={`mr-2 px-4 py-1.5 rounded-full font-medium transition ${view === 'quiz' ? 'bg-green-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Chat
          </button>
          <button 
            onClick={() => setView('dashboard')}
            className={`px-4 py-1.5 rounded-full font-medium transition ${view === 'dashboard' ? 'bg-green-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Dashboard
          </button>
        </div>
      </nav>
      
      <main className="w-full max-w-md bg-white shadow-lg rounded-b-xl overflow-hidden flex-1 flex flex-col h-[75vh]">
        {view === 'quiz' ? <QuizChat /> : <Dashboard />}
      </main>
    </div>
  );
}
