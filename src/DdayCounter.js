// src/DdayCounter.js

import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';

export default function DdayCounter({ db, userId }) {
  const [events, setEvents]     = useState([]);
  const [name, setName]         = useState('');
  const [date, setDate]         = useState('');
  const appId = window.__app_id ?? 'default-app-id';

  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, `artifacts/${appId}/users/${userId}/ddayEvents`));
    const unsub = onSnapshot(q, snapshot => {
      const list = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(list);
    });
    return () => unsub();
  }, [db, userId, appId]);

  const calcDday = (target) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const t = new Date(target);
    t.setHours(0,0,0,0);
    const diff = Math.ceil((t - today) / (1000*60*60*24));
    return diff >= 0 ? `D-${diff}` : `D+${-diff}`;
  };

  const handleAdd = async () => {
    if (!name || !date) return;
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/ddayEvents`), {
        name,
        date
      });
      setName('');
      setDate('');
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/ddayEvents`, id));
  };

  return (
    <div className="space-y-3">
      {/* 입력폼 */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="이벤트 이름"
          value={name}
          onChange={e => setName(e.target.value)}
          className="flex-1 border rounded px-2 py-1"
        />
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-1 bg-blue-600 text-white rounded"
        >
          추가
        </button>
      </div>

      {/* 목록 */}
      <ul className="space-y-1">
        {events.map(ev => (
          <li key={ev.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
            <span>{ev.name} : <strong>{calcDday(ev.date)}</strong></span>
            <button onClick={() => handleDelete(ev.id)} className="text-red-500">삭제</button>
          </li>
        ))}
        {events.length === 0 && <li className="text-gray-500">등록된 D-Day가 없습니다.</li>}
      </ul>
    </div>
  );
}
