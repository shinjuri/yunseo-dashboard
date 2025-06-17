// src/SubjectView.js
import React from 'react';

export default function SubjectView({ subject, onNavigate, db, userId }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{subject} 페이지</h1>
      {/* TODO: 과목(subject)에 따라 다른 UI를 렌더링하세요 */}
      <button
        className="px-4 py-2 bg-indigo-500 text-white rounded"
        onClick={() => onNavigate('dashboard')}
      >
        대시보드로 돌아가기
      </button>
    </div>
  );
}
