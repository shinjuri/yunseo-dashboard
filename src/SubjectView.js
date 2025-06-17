// src/SubjectView.js

import React, { useState } from 'react';
import TodoList from './TodoList';          // 수행평가 관리
import StudyFiles from './StudyFiles';      // 공부 파일 업로드

export default function SubjectView({ subject, onNavigate, db, userId }) {
  const [tab, setTab] = useState('assignments');

  const renderContent = () => {
    switch (tab) {
      case 'assignments':
        return <TodoList subject={subject} db={db} userId={userId} />;
      case 'files':
        return <StudyFiles subject={subject} db={db} userId={userId} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* 상단 네비게이션 */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{subject} 관리</h1>
        <button
          className="text-blue-500 hover:underline"
          onClick={() => onNavigate('dashboard')}
        >
          대시보드로 돌아가기
        </button>
      </header>

      {/* 탭 선택 */}
      <nav className="flex space-x-4 border-b">
        <button
          className={`py-2 px-4 ${tab === 'assignments' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setTab('assignments')}
        >수행 평가</button>
        <button
          className={`py-2 px-4 ${tab === 'files' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setTab('files')}
        >공부 파일</button>
      </nav>

      {/* 콘텐츠 렌더링 */}
      <section>
        {renderContent()}
      </section>
    </div>
  );
}
