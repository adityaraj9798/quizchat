import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data));
  }, []);

  if (!analytics) return <div className="p-6 text-center text-gray-500">Loading dashboard...</div>;

  const chartData = [
    { name: 'Served', count: analytics.questions_served },
    { name: 'Answered', count: analytics.questions_answered }
  ];

  return (
    <div className="p-6 h-full bg-gray-50 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Analytics Dashboard</h2>
      
      {/* Analytics (7 calculated!) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-xs text-gray-500 font-bold uppercase">Avg Response</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{analytics.average_response_time}s</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-xs text-gray-500 font-bold uppercase">Completion Rate</p>
          <p className="text-2xl font-bold text-green-500 mt-1">{analytics.quiz_completion_rate}%</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-xs text-gray-500 font-bold uppercase">Drop-offs</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{analytics.drop_offs}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-xs text-gray-500 font-bold uppercase">Qs Answered</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{analytics.questions_answered}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-xs text-gray-500 font-bold uppercase">Avg Qs/Session</p>
          <p className="text-2xl font-bold text-yellow-500 mt-1">{analytics.average_questions_per_session}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-xs text-gray-500 font-bold uppercase">Daily Active Users</p>
          <p className="text-2xl font-bold text-indigo-500 mt-1">{analytics.daily_active_users}</p>
        </div>
      </div>

      {/* Bonus Chart visualization */}
      <div className="bg-white p-4 rounded-xl shadow-sm border h-48">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Question Funnel</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip cursor={{fill: '#f3f4f6'}} />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
