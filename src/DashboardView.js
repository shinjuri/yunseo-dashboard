// src/DashboardView.js
import React from 'react';

export default function DashboardView({ onNavigate, db, userId }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">대시보드</h1>
      {/* TODO: 여기에 실제 대시보드 위젯들(차트, 일정, 메모 등)을 넣으세요 */}
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => onNavigate('someOtherPage')}
      >
        다른 페이지로 이동
      </button>
    </div>
  );
}
