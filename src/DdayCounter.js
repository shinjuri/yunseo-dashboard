// src/DdayCounter.js
import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';

export default function DdayCounter({ db, userId }) {
  const [events, setEvents] = useState([]);
  const appId = window.__app_id ?? 'default-app-id';

  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, `artifacts/${appId}/users/${userId}/ddayEvents`));
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(list);
    });
    return () => unsub();
  }, [db, userId, appId]);

  const calcDday = dateStr => {
    const today = new Date(); today.setHours(0,0,0,0);
    const target = new Date(dateStr); target.setHours(0,0,0,0);
    const diff = (target - today) / (1000 * 60 * 60 * 24);
    return Math.ceil(diff);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">D-Day 목록</h2>
      <ul className="list-disc pl-5">
        {events.map(e => (
          <li key={e.id} className="mb-1">
            {e.name}: D-{calcDday(e.date)}
          </li>
        ))}
      </ul>
    </div>
  );
}
