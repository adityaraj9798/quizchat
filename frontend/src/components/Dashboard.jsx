import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error("Error fetching analytics", err));
  }, []);

  if (!analytics) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Loading stats...</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full bg-gray-50 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-8 text-gray-800">Your Performance</h2>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        <div className="bg-white p-4 rounded-2xl text-center shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Answered</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{analytics.total_answered}</p>
        </div>
        
        <div className="bg-white p-4 rounded-2xl text-center shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Correct</p>
          <p className="text-3xl font-bold text-green-500 mt-2">{analytics.correct_answers}</p>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-2xl w-full max-w-sm text-center shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Overall Score</p>
        <p className="text-5xl font-extrabold text-purple-600 mt-3">
          {analytics.overall_score_percentage}%
        </p>
      </div>
    </div>
  );
}
