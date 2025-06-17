// src/TodoList.js

import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function TodoList({ subject, db, userId }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const appId = window.__app_id ?? 'default-app-id';

  // 실시간 구독
  useEffect(() => {
    if (!userId) return;
    const path = `artifacts/${appId}/users/${userId}/subjects/${subject}/tasks`;
    const q = query(collection(db, path));
    const unsub = onSnapshot(q, snapshot => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTasks(list);
    });
    return () => unsub();
  }, [db, userId, subject, appId]);

  // 추가
  const handleAdd = async () => {
    if (!title || !deadline) return;
    const path = `artifacts/${appId}/users/${userId}/subjects/${subject}/tasks`;
    try {
      await addDoc(collection(db, path), { title, deadline, description });
      setTitle(''); setDeadline(''); setDescription('');
    } catch (e) { console.error(e); }
  };

  // 상태 토글
  const toggleDone = async (task) => {
    const { id, done } = task;
    const ref = doc(db, `artifacts/${appId}/users/${userId}/subjects/${subject}/tasks`, id);
    await updateDoc(ref, { done: !done });
  };

  // 삭제
  const handleDelete = async (id) => {
    const ref = doc(db, `artifacts/${appId}/users/${userId}/subjects/${subject}/tasks`, id);
    await deleteDoc(ref);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow space-y-4">
      <h2 className="text-xl font-bold mb-2">{subject} 수행평가 관리</h2>

      {/* 입력 폼 */}
      <div className="space-y-2">
        <input
          type="text" placeholder="평가 제목"
          value={title} onChange={e => setTitle(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
        <input
          type="date"
          value={deadline} onChange={e => setDeadline(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <textarea
          placeholder="설명"
          value={description} onChange={e => setDescription(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
        <button onClick={handleAdd} className="px-4 py-1 bg-blue-600 text-white rounded">
          추가
        </button>
      </div>

      {/* 리스트 */}
      <ul className="space-y-2">
        {tasks.map(task => (
          <li key={task.id} className="flex justify-between items-start bg-gray-50 p-2 rounded">
            <div>
              <h3 className={`font-semibold ${task.done && 'line-through'}`}>{task.title}</h3>
              <p className="text-sm text-gray-600">마감: {task.deadline}</p>
              {task.description && <p className="mt-1 text-gray-800">{task.description}</p>}
            </div>
            <div className="space-x-2">
              <button onClick={() => toggleDone(task)} className="text-green-600">
                {task.done ? '취소' : '완료'}
              </button>
              <button onClick={() => handleDelete(task.id)} className="text-red-600">
                삭제
              </button>
            </div>
          </li>
        ))}
        {tasks.length === 0 && <li className="text-gray-500">등록된 수행평가가 없습니다.</li>}
      </ul>
    </div>
  );
}
