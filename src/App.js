import React, { useState, useEffect, useRef } from 'react';

// Firebase Imports
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, query, where } from "firebase/firestore";

// 아이콘 컴포넌트
const ChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const ChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const Trash2 = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const Paperclip = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>;
const X = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

// D-Day Counter Component
const DdayCounter = ({ db, userId }) => {
    const [events, setEvents] = useState([]);
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const appId = typeof window !== 'undefined' && window.__app_id ? window.__app_id : 'default-app-id';

    useEffect(() => {
        if (!userId || !db) return;
        const q = query(collection(db, `artifacts/${appId}/users/${userId}/ddayEvents`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            eventsData.sort((a, b) => new Date(a.date) - new Date(b.date));
            setEvents(eventsData);
        }, (error) => console.error("Error fetching dday events:", error));
        return () => unsubscribe();
    }, [userId, db, appId]);

    const calculateDday = (date) => {
        const today = new Date();
        const targetDate = new Date(date);
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);
        const diffTime = targetDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };
    
    const addEvent = async (e) => {
        e.preventDefault();
        if (eventName.trim() && eventDate && userId) {
            await addDoc(collection(db, `artifacts/${appId}/users/${userId}/ddayEvents`), { name: eventName, date: eventDate });
            setEventName('');
            setEventDate('');
        }
    };
    
    const removeEvent = async (id) => {
        if (userId) {
            await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/ddayEvents`, id));
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
            <h3 className="font-bold text-lg mb-3 text-blue-600">✨ D-Day 카운터</h3>
            <form onSubmit={addEvent} className="flex flex-col sm:flex-row gap-2 mb-4">
                <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="이벤트 이름" className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all shadow">추가</button>
            </form>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {events.map((event) => {
                    const dDay = calculateDday(event.date);
                    const dDayText = dDay === 0 ? 'D-DAY' : dDay > 0 ? `D-${dDay}` : `D+${-dDay}`;
                    const color = dDay < 7 ? 'bg-red-400 text-white' : 'bg-blue-400 text-white';
                    return (
                        <div key={event.id} className={`p-3 rounded-lg flex justify-between items-center shadow-sm ${color}`}>
                            <div>
                                <div className="font-bold">{event.name}</div>
                                <div className="text-sm opacity-90">{event.date}</div>
                            </div>
                           <div className="flex items-center gap-2">
                               <div className="font-black text-xl drop-shadow-sm">{dDayText}</div>
                               <button onClick={() => removeEvent(event.id)} className="text-white/70 hover:text-white"><Trash2 /></button>
                           </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// TodoList Component
const TodoList = ({ db, userId }) => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const appId = typeof window !== 'undefined' && window.__app_id ? window.__app_id : 'default-app-id';

    useEffect(() => {
        if (!userId || !db) return;
        const q = query(collection(db, `artifacts/${appId}/users/${userId}/todos`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const todosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            todosData.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
            setTodos(todosData);
        }, (error) => console.error("Error fetching todos:", error));
        return () => unsubscribe();
    }, [userId, db, appId]);

    const addTodo = async () => {
        if (newTodo.trim() !== '' && userId) {
            await addDoc(collection(db, `artifacts/${appId}/users/${userId}/todos`), { text: newTodo, createdAt: new Date() });
            setNewTodo('');
        }
    };

    const removeTodo = async (id) => {
        if (userId) {
            await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/todos`, id));
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-md h-[500px] flex flex-col border border-gray-200">
            <h3 className="font-bold text-lg mb-3 text-blue-600 flex-shrink-0">📝 To Do List</h3>
            <div className="flex gap-2 mb-3 flex-shrink-0">
                <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTodo()} placeholder="새로운 할 일" className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                <button onClick={addTodo} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all shadow">추가</button>
            </div>
            <div className="flex-grow overflow-y-auto pr-2">
                <ul className="space-y-2">
                    {todos.map((todo) => (
                        <li key={todo.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                            <span className="text-gray-700">{todo.text}</span>
                            <button onClick={() => removeTodo(todo.id)} className="text-gray-400 hover:text-red-500"><Trash2 /></button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// Memo Component
const Memo = () => {
    const [memo, setMemo] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const handleSave = () => { setShowConfirm(true); setTimeout(() => setShowConfirm(false), 2000); };
    return (
        <div className="bg-white p-4 rounded-xl shadow-md h-[500px] flex flex-col border border-gray-200">
            <h3 className="font-bold text-lg mb-3 text-blue-600 flex-shrink-0">💭 자유 메모장</h3>
            <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="잊지 않도록 기록해두세요!" className="w-full flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-2"></textarea>
            <button onClick={handleSave} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all shadow flex-shrink-0">메모 저장</button>
            {showConfirm && <div className="text-center mt-2 text-sm text-green-600">메모가 저장되었습니다!</div>}
        </div>
    );
};

// Timetable Component
const Timetable = () => {
  const schedule = [
    { period: 1, mon: '사회', tue: '과학', wed: '국어', thu: '영어', fri: '정보' },
    { period: 2, mon: '과학', tue: '진로', wed: '수학', thu: '체육', fri: '영어' },
    { period: 3, mon: '음악', tue: '국어', wed: '탐구', thu: '수학', fri: '지리A' },
    { period: 4, mon: '한국사', tue: '한국사', wed: '정보', thu: '체육', fri: '공강' },
    { period: 5, mon: '공강', tue: '정보', wed: '수학', thu: '음악', fri: '금악' },
    { period: 6, mon: '한국사', tue: '사회', wed: '음악', thu: '국어', fri: '동아리' },
    { period: 7, mon: '지리A', tue: '국어', wed: '수학', thu: '정보', fri: '동아리' },
  ];
  return (
    <div className="bg-white p-4 rounded-xl shadow-md h-[500px] flex flex-col border border-gray-200">
      <h3 className="font-bold text-lg mb-2 text-blue-600">🕒 1-4 시간표</h3>
      <table className="w-full text-center text-sm mt-4">
        <thead>
          <tr className="font-bold text-gray-500">
            <th className="py-2"></th><th className="py-2">월</th><th className="py-2">화</th><th className="py-2">수</th><th className="py-2">목</th><th className="py-2">금</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map(({ period, ...days }) => (
            <tr key={period} className="border-t border-gray-100">
              <td className="py-2 font-bold text-blue-500">{period}</td>
              {Object.values(days).map((subject, index) => (<td key={index} className="py-2 text-gray-600">{subject}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Calendar Component
const Calendar = ({events}) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 14));
  const changeMonth = (offset) => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)); };
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const dates = [];
    for (let i = 0; i < firstDay; i++) { dates.push(<div key={`empty-${i}`} className="p-2"></div>); }
    for (let i = 1; i <= lastDate; i++) {
        const today = new Date();
        const isToday = year === today.getFullYear() && month === today.getMonth() && i === today.getDate();
        const isSelected = i === 14 && month === 5 && year === 2025;
        const eventsOnThisDay = (events || []).filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getFullYear() === year && eventDate.getMonth() === month && eventDate.getDate() === i;
        });
        dates.push(
            <div key={i} className={`p-2 h-24 flex flex-col items-center border border-gray-200 rounded-lg ${isSelected ? 'bg-blue-100 border-blue-400' : 'bg-white'} ${isToday ? 'border-2 border-blue-500' : ''}`}>
                <span className={`font-bold ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>{i}</span>
                {eventsOnThisDay.map((event, idx) => (<div key={idx} className="mt-1 text-xs text-white bg-red-400 rounded-full px-2 py-0.5 w-full text-center truncate">{event.name}</div>))}
            </div>
        );
    }
    return dates;
  };
  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100"><ChevronLeft /></button>
                <h2 className="text-2xl font-bold text-gray-700" style={{ fontFamily: "'Gaegu', cursive" }}>
                    {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                </h2>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100"><ChevronRight /></button>
            </div>
            <button onClick={() => setCurrentDate(new Date())} className="bg-gray-200 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-300">Today</button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-500">
            <div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
        </div>
        <div className="grid grid-cols-7 gap-2 mt-2">{renderCalendar()}</div>
    </div>
  );
};


// Main App Component
export default function App() {
    const [page, setPage] = useState('dashboard');
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        try {
            const firebaseConfigStr = typeof window !== 'undefined' ? window.__firebase_config : null;
            if (!firebaseConfigStr) {
                console.error("Firebase config is not defined.");
                setIsLoading(false);
                return;
            }

            const firebaseConfig = JSON.parse(firebaseConfigStr);
            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            const dbInstance = getFirestore(app);
            setDb(dbInstance);
            setAuth(authInstance);

            const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
                if (user) {
                    setUserId(user.uid);
                } else {
                    const authToken = typeof window !== 'undefined' ? window.__initial_auth_token : null;
                    if (authToken) {
                        try {
                           await signInWithCustomToken(authInstance, authToken);
                        } catch (error) {
                           console.error("Custom token sign-in failed, trying anonymous.", error);
                           await signInAnonymously(authInstance);
                        }
                    } else {
                        await signInAnonymously(authInstance);
                    }
                }
                setIsLoading(false);
            });
            return () => unsubscribe();
        } catch (error) {
            console.error("Firebase initialization error:", error);
            setIsLoading(false);
        }
    }, []);

    const handleNavigation = (targetPage) => {
        setPage(targetPage);
    };
    
    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-800">Loading Application...</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-5xl font-extrabold text-blue-600 tracking-wider" style={{fontFamily: "'Gaegu', cursive"}}>
                            윤서의 슬기로운 고등 생활
                        </h1>
                        <p className="text-gray-500 font-semibold mt-1">✨ 흥덕고등학교 1학년 윤서를 위한 페이지 ✨</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="date" defaultValue="2025-06-14" className="p-2 border border-gray-300 rounded-lg" />
                    </div>
                </header>
                
                <main>
                    {page === 'dashboard' ? (
                        <DashboardView onNavigate={handleNavigation} db={db} userId={userId} />
                    ) : (
                        <SubjectView 
                            subject={page} 
                            onNavigate={handleNavigation} 
                            db={db}
                            userId={userId}
                        />
                    )}
                </main>
                 <footer className="text-center mt-12 text-gray-400/80 text-sm">
                    <p>&copy; 2025 Yunseo's Edutopia. All rights reserved.</p>
                </footer>
            </div>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Gaegu&display=swap');
                body { 
                    font-family: 'Noto Sans KR', sans-serif; 
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .html-content-viewer { background-color: #f8fafc; color: #1e293b; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; max-height: 60vh; overflow-y: auto; }
            `}</style>
        </div>
    );
}

// Dashboard View
const DashboardView = ({ onNavigate, db, userId }) => {
    const subjects = ['국어', '영어', '수학', '과학', '사회', '한국사', '정보', '진로', '동아리'];
    const [ddayEvents, setDdayEvents] = useState([]);
    const appId = typeof window !== 'undefined' && window.__app_id ? window.__app_id : 'default-app-id';

    useEffect(() => {
        if (!userId || !db) return;
        const q = query(collection(db, `artifacts/${appId}/users/${userId}/ddayEvents`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDdayEvents(eventsData);
        }, (error) => console.error("Error fetching dday events for calendar:", error));
        return () => unsubscribe();
    }, [userId, db, appId]);

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {subjects.map(subject => (<button key={subject} onClick={() => onNavigate(subject)} className="bg-white p-3 text-lg text-gray-700 font-semibold rounded-xl shadow-md hover:bg-gray-50 hover:shadow-lg hover:-translate-y-1 transition-all border border-gray-200">{subject}</button>))}
            </div>
            <DdayCounter db={db} userId={userId} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Timetable />
                <TodoList db={db} userId={userId} />
                <Memo />
            </div>
             <Calendar events={ddayEvents}/>
        </div>
    );
};

// Form Components
const AddMaterialForm = ({ onAdd }) => {
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [topic, setTopic] = useState('');
    const [htmlContent, setHtmlContent] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type === 'text/html') {
            const reader = new FileReader();
            reader.onload = (event) => {
                setHtmlContent(event.target.result);
            };
            reader.readAsText(file);
        } else {
            setHtmlContent(null);
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!topic.trim()) { 
          // Using a custom modal/alert in a real app is better than window.alert
          console.error('수업 주제를 입력해주세요.'); 
          return; 
        }
        const newMaterial = { date, topic, htmlContent, fileName: fileInputRef.current?.files[0]?.name || null };
        onAdd(newMaterial);
        setTopic('');
        setHtmlContent(null);
        if(fileInputRef.current) { fileInputRef.current.value = ""; }
    };

    return (
       <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
            <h3 className="text-xl font-bold text-blue-700 mb-4" style={{fontFamily: "'Gaegu', cursive"}}>새로운 수업자료 추가 🗒️</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                         <label htmlFor="log-date" className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                         <input type="date" id="log-date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" required />
                     </div>
                     <div>
                         <label htmlFor="log-topic" className="block text-sm font-medium text-gray-700 mb-1">수업 주제/단원</label>
                         <input type="text" id="log-topic" value={topic} onChange={e => setTopic(e.target.value)} placeholder="예: 함수의 극한과 연속성" className="w-full p-2 border border-gray-300 rounded-lg" required />
                     </div>
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">관련 파일 (HTML 파일 포함)</label>
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"/>
                 </div>
                 <button type="submit" className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors shadow">자료 추가</button>
            </form>
        </div>
    )
};

const AddAssessmentForm = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [description, setDescription] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !dueDate) { 
          // Using a custom modal/alert in a real app is better than window.alert
          console.error('수행평가명과 마감일을 모두 입력해주세요.'); 
          return; 
        }
        const newAssessment = { name, dueDate, description, status: '예정' };
        onAdd(newAssessment);
        setName('');
        setDueDate('');
        setDescription('');
    };

    return (
        <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
            <h3 className="text-xl font-bold text-green-700 mb-4" style={{fontFamily: "'Gaegu', cursive"}}>새로운 수행평가 추가 🏆</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="assessment-name" className="block text-sm font-medium text-gray-700 mb-1">수행평가명</label>
                        <input type="text" id="assessment-name" value={name} onChange={e => setName(e.target.value)} placeholder="예: 시 감상문 제출" className="w-full p-2 border border-gray-300 rounded-lg" required />
                    </div>
                    <div>
                        <label htmlFor="due-date" className="block text-sm font-medium text-gray-700 mb-1">마감일</label>
                        <input type="date" id="due-date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" required />
                    </div>
                </div>
                <div>
                     <label htmlFor="assessment-desc" className="block text-sm font-medium text-gray-700 mb-1">상세 내용</label>
                     <textarea id="assessment-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="평가 기준, 준비물 등" rows="3" className="w-full p-2 border border-gray-300 rounded-lg"></textarea>
                </div>
                 <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors shadow">수행평가 추가</button>
            </form>
        </div>
    );
};

// Modal for HTML content
const HtmlViewerModal = ({ content, onClose }) => {
    if (!content) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white text-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h2 className="text-lg font-bold text-gray-700">수업 자료 뷰어</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow html-content-viewer" dangerouslySetInnerHTML={{ __html: content }}></div>
            </div>
        </div>
    );
};

// Detailed Subject View
const SubjectView = ({ subject, onNavigate, db, userId }) => {
    const [materials, setMaterials] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [viewingHtml, setViewingHtml] = useState(null);
    const appId = typeof window !== 'undefined' && window.__app_id ? window.__app_id : 'default-app-id';

    useEffect(() => {
        if (!userId || !db) return;
        
        const unsubscribes = [];

        // Fetch materials for the current subject
        const materialsQuery = query(collection(db, `artifacts/${appId}/users/${userId}/materials`), where("subject", "==", subject));
        unsubscribes.push(onSnapshot(materialsQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            data.sort((a,b) => new Date(b.date) - new Date(a.date));
            setMaterials(data);
        }));

        // Fetch assessments for the current subject
        const assessmentsQuery = query(collection(db, `artifacts/${appId}/users/${userId}/assessments`), where("subject", "==", subject));
        unsubscribes.push(onSnapshot(assessmentsQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            data.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            setAssessments(data);
        }));

        return () => unsubscribes.forEach(unsub => unsub());
    }, [db, userId, subject, appId]);

    const addHandler = (collectionName) => async (newData) => {
        if (!userId) return;
        await addDoc(collection(db, `artifacts/${appId}/users/${userId}/${collectionName}`), { ...newData, subject });
    };
    
    const calculateDday = (date) => {
        const today = new Date();
        const targetDate = new Date(date);
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);
        const diffTime = targetDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <>
            <HtmlViewerModal content={viewingHtml} onClose={() => setViewingHtml(null)} />
            <div className="p-4 sm:p-8 bg-white rounded-xl shadow-lg border border-gray-200 animate-fade-in">
                <button onClick={() => onNavigate('dashboard')} className="mb-6 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">&larr; 대시보드로 돌아가기</button>
                <h1 className="text-5xl font-bold text-blue-600 mb-8" style={{fontFamily: "'Gaegu', cursive"}}>{subject} 학습 페이지</h1>
                
                 <div className="mb-12">
                    <h2 className="text-3xl font-bold text-green-600 mb-4" style={{fontFamily: "'Gaegu', cursive"}}>다가오는 수행평가</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {assessments.filter(item => calculateDday(item.dueDate) >= 0).slice(0, 3).map(item => {
                              const dDay = calculateDday(item.dueDate);
                              const dDayText = dDay === 0 ? 'D-DAY' : `D-${dDay}`;
                              const color = dDay < 4 ? 'bg-red-100 border-red-400' : 'bg-green-100 border-green-400';
                              return (
                                  <div key={item.id} className={`p-4 rounded-lg border-2 ${color}`}>
                                      <div className="flex justify-between items-center">
                                          <span className="font-bold text-gray-800">{item.name}</span>
                                          <span className="font-black text-xl text-gray-800">{dDayText}</span>
                                      </div>
                                      <p className="text-sm text-gray-500 mt-1">{item.dueDate}</p>
                                  </div>
                              )
                          })}
                           {assessments.filter(item => calculateDday(item.dueDate) >= 0).length === 0 && (
                             <p className="text-gray-500 col-span-full">다가오는 수행평가가 없습니다.</p>
                           )}
                      </div>
                 </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-green-600" style={{fontFamily: "'Gaegu', cursive"}}>수행평가 관리</h2>
                        <AddAssessmentForm onAdd={addHandler('assessments')} />
                        <div className="overflow-x-auto bg-white p-4 rounded-lg border border-gray-200">
                             <table className="w-full text-left min-w-[400px]">
                                 <thead>
                                     <tr className="border-b border-gray-200">
                                         <th className="p-3 text-sm font-semibold text-gray-500">수행평가명</th>
                                         <th className="p-3 text-sm font-semibold text-gray-500">마감일</th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     {assessments.map(item => (
                                         <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                             <td className="p-3 text-gray-800">{item.name}</td>
                                             <td className="p-3 text-gray-600">{item.dueDate}</td>
                                         </tr>
                                     ))}
                                     {assessments.length === 0 && (
                                         <tr><td colSpan="2" className="p-4 text-center text-gray-400">등록된 수행평가가 없습니다.</td></tr>
                                     )}
                                 </tbody>
                             </table>
                        </div>
                    </div>

                    <div className="space-y-6">
                         <h2 className="text-3xl font-bold text-blue-600" style={{fontFamily: "'Gaegu', cursive"}}>수업 자료</h2>
                        <AddMaterialForm onAdd={addHandler('materials')} />
                        <div className="space-y-4">
                            {materials.map((entry) => (
                               <div key={entry.id} className="bg-white p-4 rounded-lg border border-gray-200">
                                   <div className="flex justify-between items-center mb-2">
                                       <h3 className="text-xl font-semibold text-gray-800">{entry.topic}</h3>
                                       <span className="text-sm text-gray-500">{entry.date}</span>
                                   </div>
                                   {entry.htmlContent ? (
                                        <button onClick={() => setViewingHtml(entry.htmlContent)} className="text-blue-500 hover:underline mt-2 flex items-center gap-2">
                                           <Paperclip/> {entry.fileName || "HTML 노트 보기"}
                                        </button>
                                   ) : (
                                       entry.fileName && (
                                           <div className="flex items-center gap-2 mt-2 text-gray-500">
                                               <Paperclip/> <span>{entry.fileName}</span>
                                           </div>
                                       )
                                   )}
                               </div>
                            ))}
                             {materials.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-400">기록된 수업 자료가 없습니다.</p>
                                </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
