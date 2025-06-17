// src/DashboardView.js

import React, { useState } from 'react';
import DdayCounter from './DdayCounter';
import { format } from 'date-fns';

export default function DashboardView({ onNavigate, db, userId }) {
  // 날짜 선택 상태
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // 과목 버튼 리스트
  const subjects = ['국어','영어','수학','과학','사회','한국사','정보','진로','동아리'];

  return (
    <div className="space-y-6">
      {/* 상단 타이틀 & 날짜 */}
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">윤서의 슬기로운 고등생활</h1>
        <input
          type="date"
          className="border rounded px-2 py-1"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
      </header>

      {/* 과목 버튼 그리드 */}
      <section className="grid grid-cols-3 gap-4">
        {subjects.map(sub => (
          <button
            key={sub}
            className="p-4 bg-white rounded-lg shadow hover:bg-blue-50"
            onClick={() => onNavigate(sub)}
          >
            {sub}
          </button>
        ))}
      </section>

      {/* D-Day 카운터 */}
      <section className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">⭐️ D-Day 카운터</h2>
        <DdayCounter db={db} userId={userId} />
      </section>

      {/* 시간표 예시 */}
      <section className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">🕒 시간표</h2>
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              {['월','화','수','목','금'].map(day => (
                <th key={day} className="border px-2 py-1">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1,2,3,4,5].map(row => (
              <tr key={row} className="even:bg-gray-50">
                {subjects.slice(0,5).map((sub, i) => (
                  <td key={i} className="border px-2 py-1 text-sm">
                    {sub}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
);
}
