import React, { useState, useEffect, useRef } from 'react';

// Firebase Imports
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, query, setDoc, updateDoc, orderBy, serverTimestamp, where, limit } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// --- 아이콘 컴포넌트들 (Heroicons & Custom) ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const PencilAltIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>;
const AcademicCapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0l15.482 0m-15.482 0a50.57 50.57 0 01-2.658-.813m2.658.814a60.438 60.438 0 01.491 6.347M18.754 16.495a48.623 48.623 0 01-8.232 4.41m8.232-4.41a60.46 60.46 0 00.491-6.347m-16.174.006l15.482.001" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ChevronDownIcon = ({ isOpen }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;

// --- Helper Functions & Hooks ---
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

// --- Firebase Abstraction Layer ---
const appId = 'yunseo-pro-dashboard';
const dbPaths = {
    studyPlanner: (userId) => `artifacts/${appId}/users/${userId}/studyPlanner`,
    readingLog: (userId) => `artifacts/${appId}/users/${userId}/readingLog`,
    diary: (userId) => `artifacts/${appId}/users/${userId}/diary`,
    notices: (userId) => `artifacts/${appId}/users/${userId}/notices`,
    familyBoard: () => `artifacts/${appId}/public/data/familyBoard`,
    assessments: (userId) => `artifacts/${appId}/users/${userId}/assessments`,
    materials: (userId) => `artifacts/${appId}/users/${userId}/materials`,
    mistakeLog: (userId) => `artifacts/${appId}/users/${userId}/mistakeLog`,
    resourceLinks: (userId) => `artifacts/${appId}/users/${userId}/resourceLinks`,
    dDayEvents: (userId) => `artifacts/${appId}/users/${userId}/dDayEvents`,
};

// --- Main App Component ---
export default function App() {
    const [page, setPage] = useState('today');
    const [db, setDb] = useState(null);
    const [storage, setStorage] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedSemester, setExpandedSemester] = useState('고1 1학기');

    const academicStructure = [
        { name: '고1 1학기', subjects: ['국어', '수학', '영어', '통합사회', '통합과학', '한국사', '정보', '진로', '동아리'] },
        { name: '고1 2학기', subjects: ['국어', '수학', '영어', '통합사회', '통합과학', '한국사', '정보', '진로', '동아리'] },
        { name: '고2 1학기', subjects: ['문학', '수학Ⅰ', '영어Ⅰ', '사회탐구', '과학탐구Ⅰ'] },
        { name: '고2 2학기', subjects: ['독서', '수학Ⅱ', '영어Ⅱ', '사회탐구', '과학탐구Ⅰ'] },
        { name: '고3 1학기', subjects: ['화법과 작문', '미적분', '영어 독해와 작문', '사회탐구', '과학탐구Ⅱ'] },
        { name: '고3 2학기', subjects: ['언어와 매체', '기하', '심화 영어', '사회탐구', '과학탐구Ⅱ'] },
    ];
    const allSubjects = [...new Set(academicStructure.flatMap(s => s.subjects))];


    useEffect(() => {
        try {
            let firebaseConfigString = window.__firebase_config || process.env.REACT_APP_FIREBASE_CONFIG;
            if (!firebaseConfigString) {
                console.error("Firebase config not found.");
                setIsLoading(false);
                return;
            }
            const firebaseConfig = JSON.parse(firebaseConfigString);
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            setDb(getFirestore(app));
            setStorage(getStorage(app));

            onAuthStateChanged(auth, user => {
                if (user) {
                    setUserId(user.uid);
                } else {
                    signInAnonymously(auth).catch(e => console.error("Auth Error", e));
                }
                setIsLoading(false);
            });
        } catch (e) {
            console.error("Firebase Init Error", e);
            setIsLoading(false);
        }
    }, []);

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-800">Loading Application...</div>;
    }

    const navigationItems = [
        { name: '오늘의 기록', page: 'today', icon: <HomeIcon /> },
        { name: '스터디 플래너', page: 'planner', icon: <ClipboardListIcon /> },
        { name: '독서 기록장', page: 'readinglog', icon: <BookOpenIcon /> },
        { name: '데일리 다이어리', page: 'diary', icon: <PencilAltIcon /> },
        { name: '알림장', page: 'notices', icon: <BellIcon /> },
        { name: '가족 소통 보드', page: 'family', icon: <UsersIcon /> },
    ];

    const renderPage = () => {
        switch (page) {
            case 'today': return <DashboardView db={db} userId={userId} setPage={setPage} />;
            case 'planner': return <StudyPlannerView db={db} userId={userId} subjects={allSubjects} />;
            case 'readinglog': return <ReadingLogView db={db} userId={userId} storage={storage} />;
            case 'diary': return <DiaryView db={db} userId={userId} storage={storage} />;
            case 'notices': return <NoticeBoardView db={db} userId={userId} />;
            case 'family': return <FamilyBoardView db={db} userId={userId} />;
            default:
                if(allSubjects.includes(page)){
                    return <SubjectDetailView subject={page} db={db} userId={userId} storage={storage} />;
                }
                return <DashboardView db={db} userId={userId} setPage={setPage} />;
        }
    };
    
    const handleSemesterClick = (semesterName) => {
        setExpandedSemester(prev => (prev === semesterName ? null : semesterName));
    };

    return (
        <div className="flex h-screen bg-white font-sans">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Merriweather:wght@400;700&display=swap');
                .main-content-bg { background-color: #f8fafc; }
            `}</style>
            <aside className="w-64 bg-white border-r border-gray-200 flex-col flex shadow-lg z-10">
                <div className="h-20 flex flex-col items-center justify-center border-b border-gray-200 px-4">
                    <div className="flex items-center">
                        <img src="https://i.postimg.cc/ZnST53NL/yunseo.png" alt="Yunseo's character" className="h-10 w-10 rounded-full" />
                        <h1 className="ml-3 text-xl font-bold text-gray-800" style={{fontFamily: "'Merriweather', serif"}}>Yunseo's Edutopia</h1>
                    </div>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navigationItems.map(item => (
                        <a key={item.name} href="#" onClick={() => setPage(item.page)} className={`flex items-center px-4 py-2 text-gray-600 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors ${page === item.page ? 'bg-green-100 text-green-800 font-semibold' : ''}`}>
                            <span className="text-green-500">{item.icon}</span>
                            <span className="ml-3">{item.name}</span>
                        </a>
                    ))}
                     <div className="pt-4">
                        <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Academics</h3>
                        <div className="mt-2 space-y-1">
                            {academicStructure.map(semester => (
                                <div key={semester.name}>
                                    <button
                                        onClick={() => handleSemesterClick(semester.name)}
                                        className="flex items-center justify-between w-full px-4 py-2 text-left text-sm font-medium text-gray-600 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors"
                                    >
                                        <span>{semester.name}</span>
                                        <ChevronDownIcon isOpen={expandedSemester === semester.name} />
                                    </button>
                                    {expandedSemester === semester.name && (
                                        <ul className="pl-6 pt-1 pb-2 border-l-2 border-green-200 ml-4">
                                            {semester.subjects.map(subject => (
                                                <li key={subject}>
                                                    <a
                                                        href="#"
                                                        onClick={() => setPage(subject)}
                                                        className={`block px-4 py-1.5 text-sm rounded-md ${page === subject ? 'bg-green-100 text-green-800 font-semibold' : 'text-gray-500 hover:text-green-700'}`}
                                                    >
                                                        {subject}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </nav>
            </aside>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6">
                    <h2 className="text-2xl font-bold text-gray-800" style={{fontFamily: "'Merriweather', serif"}}>
                        {navigationItems.find(i => i.page === page)?.name || page}
                    </h2>
                    <div className="text-gray-600 font-medium">{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto main-content-bg p-6">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
}

// --- Dashboard Widgets ---

const CalendarWidget = ({ db, userId }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        if (!userId || !db) return;
        const q = query(collection(db, dbPaths.dDayEvents(userId)));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedEvents = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date.toDate() 
            }));
            setEvents(fetchedEvents);
        });
        return unsubscribe;
    }, [userId, db]);

    const changeMonth = (offset) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const handleAddEvent = async (name, date) => {
        await addDoc(collection(db, dbPaths.dDayEvents(userId)), {
            name,
            date: new Date(date)
        });
        setShowAddForm(false);
    };

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays = [];
    for(let i = 0; i < firstDay; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="p-1 border border-gray-200 bg-gray-50"></div>);
    }
    for(let i = 1; i <= daysInMonth; i++) {
        const day = new Date(year, month, i);
        const isToday = day.toDateString() === new Date().toDateString();
        const dayEvents = events.filter(e => e.date.toDateString() === day.toDateString());

        calendarDays.push(
            <div key={i} className={`p-1 border border-gray-200 h-24 flex flex-col ${isToday ? 'bg-green-100' : 'bg-white'}`}>
                <span className={`text-sm ${isToday ? 'font-bold text-green-600' : 'text-gray-700'}`}>{i}</span>
                <div className="flex-grow overflow-y-auto text-xs">
                    {dayEvents.map(e => (
                        <div key={e.id} className="bg-pink-400 text-white rounded px-1 mt-1 truncate">{e.name}</div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm col-span-1 lg:col-span-2">
             <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-gray-100 text-gray-600"><ChevronLeftIcon /></button>
                <h3 className="font-bold text-lg text-gray-800">{`${year}년 ${month + 1}월`}</h3>
                <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-gray-100 text-gray-600"><ChevronRightIcon /></button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs text-gray-500 font-semibold mb-1">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7">{calendarDays}</div>
            <button onClick={() => setShowAddForm(!showAddForm)} className="mt-4 w-full text-sm py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">D-Day 추가</button>
            {showAddForm && <AddDdayForm onAdd={handleAddEvent} />}
        </div>
    );
};

const AddDdayForm = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if(!name || !date) return;
        onAdd(name, date);
        setName('');
        setDate('');
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 p-2 bg-gray-100 rounded-lg flex gap-2">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="이벤트 이름" className="flex-grow p-1 border border-gray-300 rounded-md text-sm"/>
            <input value={date} onChange={e => setDate(e.target.value)} type="date" className="p-1 border border-gray-300 rounded-md text-sm"/>
            <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded-md text-sm font-semibold">저장</button>
        </form>
    );
};


const TimetableWidget = () => {
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
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-2">주간 시간표</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-center text-xs">
                    <thead>
                        <tr className="font-semibold text-gray-600">
                            <th className="p-1"></th><th className="p-1">월</th><th className="p-1">화</th><th className="p-1">수</th><th className="p-1">목</th><th className="p-1">금</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {schedule.map(({ period, ...days }) => (
                            <tr key={period} className="border-t border-gray-100">
                                <td className="p-1 font-bold text-green-600">{period}</td>
                                {Object.values(days).map((subject, index) => (<td key={index} className="p-1">{subject}</td>))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const TodoListWidget = ({ db, userId, setPage }) => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        if (!userId || !db) return;
        const q = query(
            collection(db, dbPaths.studyPlanner(userId)),
            orderBy("createdAt", "desc"),
            limit(20) 
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const uncompletedTasks = allTasks.filter(task => !task.completed).slice(0, 5);
            setTasks(uncompletedTasks);
        });
        return unsubscribe;
    }, [userId, db]);

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-800">오늘의 할 일</h3>
                <button onClick={() => setPage('planner')} className="text-sm text-green-600 hover:underline">전체 보기</button>
            </div>
            <ul className="space-y-2">
                {tasks.length > 0 ? tasks.map(task => (
                    <li key={task.id} className="text-gray-700 text-sm flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 flex-shrink-0"></span>
                        {task.text}
                    </li>
                )) : <p className="text-sm text-gray-500">모든 할 일을 완료했어요! 🎉</p>}
            </ul>
        </div>
    );
};

const QuickMemoWidget = ({ db, userId }) => {
    const [memo, setMemo] = useState('');
    const debouncedMemo = useDebounce(memo, 1000);
    const todayId = new Date().toISOString().slice(0, 10);

    useEffect(() => {
        if (!userId || !db) return;
        const memoDocRef = doc(db, dbPaths.diary(userId), todayId);
        const unsubscribe = onSnapshot(memoDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setMemo(docSnap.data().content);
            }
        });
        return unsubscribe;
    }, [userId, db, todayId]);

    useEffect(() => {
        if (debouncedMemo !== undefined && userId) {
            const memoDocRef = doc(db, dbPaths.diary(userId), todayId);
            setDoc(memoDocRef, { content: debouncedMemo, createdAt: serverTimestamp() }, { merge: true });
        }
    }, [debouncedMemo, userId, db, todayId]);

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-2">빠른 메모</h3>
            <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="간단한 아이디어나 메모를 기록하세요..."
                className="w-full h-24 p-2 text-sm border-none bg-green-50 rounded-md focus:ring-1 focus:ring-green-500 resize-none"
            />
        </div>
    );
};

// --- Page Components ---

const DashboardView = ({ db, userId, setPage }) => {
    return (
        <div className="space-y-6">
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm text-center">
                <h3 className="text-2xl font-semibold text-gray-800" style={{fontFamily: "'Merriweather', serif"}}>오늘의 한 걸음이 내일의 역사가 됩니다.</h3>
                <p className="mt-2 text-green-600 font-semibold">꿈을 향한 너의 빛나는 오늘을 응원해! ✨</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <CalendarWidget db={db} userId={userId} />
                <div className="space-y-6">
                    <TodoListWidget db={db} userId={userId} setPage={setPage} />
                    <QuickMemoWidget db={db} userId={userId} />
                </div>
            </div>
            <TimetableWidget />
        </div>
    )
};

const StudyPlannerView = ({ db, userId, subjects }) => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [subject, setSubject] = useState(subjects[0] || '');

    useEffect(() => {
        if (!userId || !db) return;
        const q = query(collection(db, dbPaths.studyPlanner(userId)), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            fetchedTasks.sort((a, b) => a.completed - b.completed);
            setTasks(fetchedTasks);
        }, (error) => {
            console.error("Error fetching study plan: ", error);
        });
        return unsubscribe;
    }, [userId, db]);

    const addTask = async (e) => {
        e.preventDefault();
        if (newTask.trim() === '') return;
        await addDoc(collection(db, dbPaths.studyPlanner(userId)), {
            text: newTask,
            subject: subject,
            completed: false,
            createdAt: serverTimestamp(),
        });
        setNewTask('');
    };

    const toggleTask = async (id, completed) => {
        await updateDoc(doc(db, dbPaths.studyPlanner(userId), id), { completed: !completed });
    };
    
    const deleteTask = async (id) => {
         await deleteDoc(doc(db, dbPaths.studyPlanner(userId), id));
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <form onSubmit={addTask} className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="새로운 학습 목표를 입력하세요..." className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"/>
                <select value={subject} onChange={e => setSubject(e.target.value)} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none">
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button type="submit" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">추가</button>
            </form>
            <ul className="space-y-3">
                {tasks.map(task => (
                    <li key={task.id} className={`flex items-center justify-between p-4 rounded-lg transition-all ${task.completed ? 'bg-gray-100' : 'bg-green-50'}`}>
                        <div className="flex items-center">
                            <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id, task.completed)} className="h-5 w-5 rounded-md border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"/>
                            <div className="ml-4">
                               <p className={`text-lg ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{task.text}</p>
                               <span className="text-sm font-medium text-white bg-green-500 px-2 py-0.5 rounded-full">{task.subject}</span>
                            </div>
                        </div>
                        <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-500"><TrashIcon/></button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ReadingLogView = ({ db, userId, storage }) => {
    const [books, setBooks] = useState([]);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!userId || !db) return;
        const q = query(collection(db, dbPaths.readingLog(userId)), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("Error fetching reading log: ", error);
        });
        return unsubscribe;
    }, [userId, db]);

    const addBook = async (e) => {
        e.preventDefault();
        if (title.trim() === '' || author.trim() === '') return;
        setIsUploading(true);

        let coverImageUrl = '';
        let imageRefPath = '';

        if (coverImage) {
            const imageRef = ref(storage, `reading-log-covers/${userId}/${Date.now()}_${coverImage.name}`);
            imageRefPath = imageRef.fullPath;
            try {
                const snapshot = await uploadBytes(imageRef, coverImage);
                coverImageUrl = await getDownloadURL(snapshot.ref);
            } catch (error) {
                console.error("Error uploading image: ", error);
                setIsUploading(false);
                return;
            }
        }

        await addDoc(collection(db, dbPaths.readingLog(userId)), {
            title,
            author,
            notes: '',
            coverImageUrl,
            imageRefPath, 
            createdAt: serverTimestamp(),
        });

        setTitle('');
        setAuthor('');
        setCoverImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setIsUploading(false);
    };

    const debouncedUpdateNotes = useRef(
        (id, newNotes) => {
          const timeoutId = setTimeout(async () => {
            await updateDoc(doc(db, dbPaths.readingLog(userId), id), { notes: newNotes });
          }, 1000);
          return () => clearTimeout(timeoutId);
        }
    ).current;

    const deleteBook = async (book) => {
        if (window.confirm(`'${book.title}' 기록을 정말 삭제하시겠습니까?`)) {
            await deleteDoc(doc(db, dbPaths.readingLog(userId), book.id));
            if (book.imageRefPath) {
                const imageRef = ref(storage, book.imageRefPath);
                await deleteObject(imageRef).catch(e => console.error("Error deleting image:", e));
            }
        }
    };

    return (
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <form onSubmit={addBook} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">책 제목</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg"/>
                    </div>
                     <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">저자</label>
                        <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg"/>
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">책 표지 이미지</label>
                        <input type="file" ref={fileInputRef} onChange={e => setCoverImage(e.target.files[0])} accept="image/*" className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
                    </div>
                    <button type="submit" disabled={isUploading} className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                        {isUploading ? "업로드 중..." : "기록 추가"}
                    </button>
                </form>
            </div>
            <div className="space-y-4">
                {books.map(book => (
                    <div key={book.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex gap-5 items-start">
                        <div className="w-28 flex-shrink-0">
                            {book.coverImageUrl ? (
                                <img src={book.coverImageUrl} alt={`${book.title} 표지`} className="w-full h-40 object-cover rounded-md shadow-md" />
                            ) : (
                                <div className="w-full h-40 bg-gray-200 rounded-md flex items-center justify-center text-center text-gray-400 text-sm">이미지 없음</div>
                            )}
                        </div>
                        <div className="flex-grow">
                           <div className="flex justify-between items-start">
                               <div>
                                    <h4 className="text-xl font-bold text-gray-800" style={{fontFamily: "'Merriweather', serif"}}>{book.title}</h4>
                                    <p className="text-gray-600">저자: {book.author}</p>
                                </div>
                                <button onClick={() => deleteBook(book)} className="text-gray-400 hover:text-red-500"><TrashIcon/></button>
                           </div>
                            <textarea 
                                defaultValue={book.notes} 
                                onChange={(e) => debouncedUpdateNotes(book.id, e.target.value)}
                                placeholder="이 책에 대한 감상이나 중요한 구절을 기록해보세요..."
                                className="mt-4 w-full h-24 p-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DiaryView = ({ db, userId, storage }) => {
    const [entry, setEntry] = useState({ content: '', imageUrl: '', imageRefPath: '' });
    const [pastEntries, setPastEntries] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    
    const todayId = new Date().toISOString().slice(0, 10);

    useEffect(() => {
        if (!userId || !db) return;
        
        const todayDocRef = doc(db, dbPaths.diary(userId), todayId);
        const unsubscribeToday = onSnapshot(todayDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setEntry(docSnap.data());
            } else {
                setEntry({ content: '', imageUrl: '', imageRefPath: '' });
            }
        }, (error) => console.error("Error fetching today's diary entry: ", error));

        const q = query(collection(db, dbPaths.diary(userId)), orderBy("createdAt", "desc"));
        const unsubscribePast = onSnapshot(q, (snapshot) => {
            const entries = snapshot.docs
                .filter(doc => doc.id !== todayId)
                .map(doc => ({ id: doc.id, ...doc.data() }));
            setPastEntries(entries);
        }, (error) => console.error("Error fetching past diary entries: ", error));

        return () => {
            unsubscribeToday();
            unsubscribePast();
        };
    }, [userId, db, todayId]);

    const handleSave = async () => {
        if (!userId) return;
        setIsUploading(true);
        const todayDocRef = doc(db, dbPaths.diary(userId), todayId);

        let newImageUrl = entry.imageUrl;
        let newImageRefPath = entry.imageRefPath;

        if (imageFile) {
            if (entry.imageRefPath) {
                const oldImageRef = ref(storage, entry.imageRefPath);
                await deleteObject(oldImageRef).catch(e => console.error("Could not delete old diary image", e));
            }

            const imageRef = ref(storage, `diary-images/${userId}/${todayId}_${imageFile.name}`);
            newImageRefPath = imageRef.fullPath;
            const snapshot = await uploadBytes(imageRef, imageFile);
            newImageUrl = await getDownloadURL(snapshot.ref);
        }

        const dataToSave = {
            content: entry.content,
            imageUrl: newImageUrl,
            imageRefPath: newImageRefPath,
            createdAt: serverTimestamp(),
        };

        await setDoc(todayDocRef, dataToSave, { merge: true });
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setIsUploading(false);
    };
    
    const removeImage = async () => {
        if (!entry.imageRefPath) return;
         if (window.confirm('사진을 삭제하시겠습니까?')) {
            const imageRef = ref(storage, entry.imageRefPath);
            await deleteObject(imageRef);
            const todayDocRef = doc(db, dbPaths.diary(userId), todayId);
            await updateDoc(todayDocRef, {
                imageUrl: '',
                imageRefPath: ''
            });
         }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-800" style={{fontFamily: "'Merriweather', serif"}}>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}의 기록</h3>
                    <button onClick={handleSave} disabled={isUploading} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                        {isUploading ? "저장 중..." : "기록 저장"}
                    </button>
                </div>

                <div className="mt-4">
                    {entry.imageUrl ? (
                        <div className="relative group">
                            <img src={entry.imageUrl} alt="오늘의 사진" className="w-full h-64 object-cover rounded-lg shadow-md" />
                            <button onClick={removeImage} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ) : (
                         <div className="flex items-center gap-4">
                             <label htmlFor="diary-image-upload" className="cursor-pointer flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                                 <CameraIcon />
                                 <span>오늘의 사진 추가</span>
                             </label>
                             <input id="diary-image-upload" type="file" ref={fileInputRef} onChange={e => setImageFile(e.target.files[0])} accept="image/*" className="hidden"/>
                             {imageFile && <span className="text-sm text-gray-600">{imageFile.name}</span>}
                         </div>
                    )}
                </div>

                <textarea 
                    value={entry.content || ''}
                    onChange={e => setEntry({...entry, content: e.target.value})}
                    placeholder="오늘 하루는 어땠나요? 생각, 감정, 배운 점 등 무엇이든 자유롭게 기록해보세요."
                    className="w-full flex-1 mt-4 p-4 text-lg leading-relaxed border-none focus:ring-0 bg-gray-50 rounded-md resize-none"
                />
            </div>
            <div className="lg:col-span-1 bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col">
                 <h4 className="text-lg font-semibold text-gray-700 mb-4 flex-shrink-0">지난 기록들</h4>
                 <div className="space-y-4 overflow-y-auto">
                    {pastEntries.map(e => (
                        <div key={e.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex gap-4">
                            {e.imageUrl && <img src={e.imageUrl} className="w-16 h-16 object-cover rounded-md flex-shrink-0" alt="" />}
                            <div>
                                <p className="font-semibold text-green-700">{e.id}</p>
                                <p className="mt-1 text-gray-600 text-sm truncate">{e.content}</p>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    )
};


const NoticeBoardView = ({ db, userId }) => {
    const [notices, setNotices] = useState([]);

     useEffect(() => {
        if (!userId || !db) return;
        const q = query(collection(db, dbPaths.notices(userId)), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setNotices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return unsubscribe;
    }, [userId, db]);

    return (
         <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">학교/개인 알림</h3>
            <ul className="divide-y divide-gray-200">
                {notices.map(notice => (
                     <li key={notice.id} className="py-4">
                        <p className="text-lg font-semibold text-gray-800">{notice.title}</p>
                        <p className="text-gray-600 mt-1">{notice.content}</p>
                        <p className="text-xs text-gray-400 mt-2">{notice.createdAt?.toDate().toLocaleDateString('ko-KR')}</p>
                    </li>
                ))}
                {notices.length === 0 && <p className="text-gray-500">새로운 알림이 없습니다.</p>}
            </ul>
        </div>
    )
};

const FamilyBoardView = ({ db, userId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [author, setAuthor] = useState('윤서');

    useEffect(() => {
        if (!db) return;
        const q = query(collection(db, dbPaths.familyBoard()), orderBy("createdAt", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("Error fetching family board: ", error)
        });
        return unsubscribe;
    }, [db]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        await addDoc(collection(db, dbPaths.familyBoard()), {
            text: newMessage,
            author,
            createdAt: serverTimestamp()
        });
        setNewMessage('');
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.author === '윤서' ? 'justify-end' : 'justify-start'}`}>
                             {msg.author !== '윤서' && <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-white">{msg.author.charAt(0)}</div>}
                            <div className={`max-w-md p-3 rounded-2xl ${msg.author === '윤서' ? 'bg-green-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                            {msg.author === '윤서' && <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold text-white">윤</div>}
                        </div>
                    ))}
                </div>
            </div>
            <form onSubmit={sendMessage} className="flex items-center gap-2">
                <select value={author} onChange={e => setAuthor(e.target.value)} className="p-3 border border-gray-300 rounded-lg">
                    <option>윤서</option>
                    <option>엄마</option>
                    <option>아빠</option>
                </select>
                <input value={newMessage} onChange={e => setNewMessage(e.target.value)} type="text" placeholder="메시지를 입력하세요..." className="flex-grow p-3 border border-gray-300 rounded-lg"/>
                <button type="submit" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg">전송</button>
            </form>
        </div>
    )
};

const SubjectDetailView = ({ subject, db, userId, storage }) => {
    const [assessments, setAssessments] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [mistakes, setMistakes] = useState([]);
    const [links, setLinks] = useState([]);
    
    useEffect(() => {
        if (!userId || !db) return;

        const createSubscription = (path, filterField, sortField, setter) => {
            const q = query(collection(db, path), where(filterField, "==", subject));
            return onSnapshot(q, snapshot => {
                const items = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
                if (sortField) {
                    items.sort((a,b) => (b[sortField]?.toDate?.() || 0) - (a[sortField]?.toDate?.() || 0));
                }
                setter(items);
            }, error => console.error(`Error fetching ${path}: `, error));
        };

        const unsubAssessments = createSubscription(dbPaths.assessments(userId), "subject", "dueDate", setAssessments);
        const unsubMaterials = createSubscription(dbPaths.materials(userId), "subject", "createdAt", setMaterials);
        const unsubMistakes = createSubscription(dbPaths.mistakeLog(userId), "subject", "createdAt", setMistakes);
        const unsubLinks = createSubscription(dbPaths.resourceLinks(userId), "subject", "createdAt", setLinks);

        return () => {
            unsubAssessments();
            unsubMaterials();
            unsubMistakes();
            unsubLinks();
        }
    }, [userId, db, subject]);

    const handleAdd = async (path, data) => await addDoc(collection(db, path), {...data, subject, createdAt: serverTimestamp()});
    const handleDelete = async (path, id) => await deleteDoc(doc(db, path, id));

    const handleDeleteWithFile = async (path, item, filePathField) => {
        await handleDelete(path, item.id);
        if(item[filePathField]){
            const fileRef = ref(storage, item[filePathField]);
            await deleteObject(fileRef).catch(e => console.error("File deletion error", e));
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800" style={{fontFamily: "'Merriweather', serif"}}>{subject} 학습 관리</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">수행평가 관리</h3>
                    <AddAssessmentForm onAdd={(data) => handleAdd(dbPaths.assessments(userId), data)} />
                    <ul className="space-y-3">{assessments.map(item => <li key={item.id} className="p-3 bg-green-50 rounded-md flex justify-between items-center"><div><p className="font-semibold text-gray-700">{item.name}</p><p className="text-sm text-gray-500">마감: {item.dueDate}</p></div><button onClick={() => handleDelete(dbPaths.assessments(userId), item.id)} className="text-gray-400 hover:text-red-500"><TrashIcon/></button></li>)}</ul>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                     <h3 className="text-xl font-semibold text-gray-800">수업 자료</h3>
                     <AddMaterialForm onAdd={(data) => handleAdd(dbPaths.materials(userId), data)} userId={userId} storage={storage} />
                     <ul className="space-y-3">{materials.map(item => <li key={item.id} className="p-3 bg-green-50 rounded-md flex justify-between items-center"><div><p className="font-semibold text-gray-700">{item.topic}</p>{item.fileUrl && <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline">파일 보기</a>}</div><button onClick={() => handleDeleteWithFile(dbPaths.materials(userId), item, 'fileRefPath')} className="text-gray-400 hover:text-red-500"><TrashIcon/></button></li>)}</ul>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">오답 노트</h3>
                    <AddMistakeForm onAdd={(data) => handleAdd(dbPaths.mistakeLog(userId), data)} userId={userId} storage={storage}/>
                    <ul className="space-y-3">{mistakes.map(item => <li key={item.id} className="p-3 bg-red-50 rounded-md"><div><p className="font-semibold text-gray-700">{item.topic}</p><p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{item.analysis}</p>{item.imageUrl && <img src={item.imageUrl} alt="오답 문제" className="mt-2 rounded-md max-h-48" />}</div><button onClick={() => handleDeleteWithFile(dbPaths.mistakeLog(userId), item, 'imageRefPath')} className="text-gray-400 hover:text-red-500 mt-2"><TrashIcon/></button></li>)}</ul>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">관련 링크</h3>
                    <AddLinkForm onAdd={(data) => handleAdd(dbPaths.resourceLinks(userId), data)} />
                    <ul className="space-y-3">{links.map(item => <li key={item.id} className="p-3 bg-yellow-50 rounded-md flex justify-between items-center"><div><a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-yellow-700 hover:underline">{item.title}</a><p className="text-sm text-gray-500">{item.description}</p></div><button onClick={() => handleDelete(dbPaths.resourceLinks(userId), item.id)} className="text-gray-400 hover:text-red-500"><TrashIcon/></button></li>)}</ul>
                </div>
            </div>
        </div>
    );
};

// --- Helper Components for SubjectDetailView ---
const AddAssessmentForm = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !dueDate) return;
        onAdd({ name, dueDate, status: '예정' });
        setName('');
        setDueDate('');
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-gray-50 rounded-md">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="수행평가 이름" className="w-full p-2 border border-gray-300 rounded-md" />
            <input value={dueDate} onChange={e => setDueDate(e.target.value)} type="date" className="w-full p-2 border border-gray-300 rounded-md" />
            <button type="submit" className="w-full py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">수행평가 추가</button>
        </form>
    );
};

const AddMaterialForm = ({ onAdd, userId, storage }) => {
    const [topic, setTopic] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!topic) return;
        setIsUploading(true);
        let fileUrl = '';
        let fileRefPath = '';

        if(file) {
            const fileRef = ref(storage, `materials/${userId}/${Date.now()}_${file.name}`);
            fileRefPath = fileRef.fullPath;
            await uploadBytes(fileRef, file);
            fileUrl = await getDownloadURL(fileRef);
        }

        onAdd({ topic, fileUrl, fileRefPath });
        setTopic('');
        setFile(null);
        setIsUploading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-gray-50 rounded-md">
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="자료 주제" className="w-full p-2 border border-gray-300 rounded-md" />
            <input type="file" onChange={e => setFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
            <button type="submit" disabled={isUploading} className="w-full py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400">
                {isUploading ? "업로드 중..." : "자료 추가"}
            </button>
        </form>
    );
};

const AddMistakeForm = ({ onAdd, userId, storage }) => {
    const [topic, setTopic] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [image, setImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!topic) return;
        setIsUploading(true);
        let imageUrl = '';
        let imageRefPath = '';
        if (image) {
            const imageRef = ref(storage, `mistakes/${userId}/${Date.now()}_${image.name}`);
            imageRefPath = imageRef.fullPath;
            await uploadBytes(imageRef, image);
            imageUrl = await getDownloadURL(imageRef);
        }
        onAdd({ topic, analysis, imageUrl, imageRefPath });
        setTopic('');
        setAnalysis('');
        setImage(null);
        setIsUploading(false);
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-gray-50 rounded-md">
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="틀린 문제 주제" className="w-full p-2 border border-gray-300 rounded-md" />
            <textarea value={analysis} onChange={e => setAnalysis(e.target.value)} placeholder="오답 원인 분석" className="w-full p-2 border border-gray-300 rounded-md" rows="3"/>
            <input type="file" onChange={e => setImage(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"/>
            <button type="submit" disabled={isUploading} className="w-full py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 disabled:bg-gray-400">{isUploading ? '업로드 중...' : '오답 기록'}</button>
        </form>
    );
};

const AddLinkForm = ({ onAdd }) => {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if(!title || !url) return;
        onAdd({ title, url, description });
        setTitle('');
        setUrl('');
        setDescription('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-gray-50 rounded-md">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="링크 제목" className="w-full p-2 border border-gray-300 rounded-md"/>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL 주소" type="url" className="w-full p-2 border border-gray-300 rounded-md"/>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="간단한 설명" className="w-full p-2 border border-gray-300 rounded-md"/>
            <button type="submit" className="w-full py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">링크 추가</button>
        </form>
    )
}
