// src/App.js

import React, { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { ChevronLeft, ChevronRight, Trash2, BookOpen, Paperclip, X } from 'lucide-react';
import { firebaseConfig } from './firebaseConfig';
import DashboardView from './DashboardView';
import SubjectView from './SubjectView';
import DdayCounter from './DdayCounter';

// Chart.js 등록
Chart.register(...registerables);

// Firebase 초기화
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

export default function App() {
  const [page, setPage]         = useState('dashboard');
  const [userId, setUserId]     = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (user) setUserId(user.uid);
      else signInAnonymously(auth).catch(console.error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation/Header 생략 */}
        {page === 'dashboard' ? (
          <DashboardView onNavigate={setPage} db={db} userId={userId} />
        ) : (
          <SubjectView subject={page} onNavigate={setPage} db={db} userId={userId} />
        )}
      </div>
    </div>
  );
}
