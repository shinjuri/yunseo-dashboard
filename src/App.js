import React, { useState, useEffect, useRef, useCallback } from 'react';

// Firebase Imports
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, query, setDoc, updateDoc, orderBy, serverTimestamp, where, limit } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// --- 아이콘 컴포넌트들 (Heroicons & Custom) ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const PencilAltIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ChevronDownIcon = ({ isOpen }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;

// --- Helper Functions & Hooks ---

/**
 * Custom hook for debouncing a value.
 * @param {any} value - The value to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {any} The debounced value.
 */
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

// --- Custom Confirmation Modal Component ---
const ConfirmationModal = ({ show, title, message, onConfirm, onCancel }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Firebase Abstraction Layer ---
// Defines the base application ID and paths for various collections in Firestore and Storage.
// These paths ensure data is organized correctly based on whether it's public or user-specific.
const appId = 'yunseo-pro-dashboard';
const dbPaths = {
    studyPlanner: (userId) => `artifacts/${appId}/users/${userId}/studyPlanner`,
    readingLog: (userId) => `artifacts/${appId}/users/${userId}/readingLog`,
    diary: (userId) => `artifacts/${appId}/users/${userId}/diary`,
    notices: (userId) => `artifacts/${appId}/users/${userId}/notices`,
    familyBoard: () => `artifacts/${appId}/public/data/familyBoard`, // Public collection
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
    const [isLoading, setIsLoading] = useState(true); // Initial loading state
    const [firebaseInitError, setFirebaseInitError] = useState(false); // New state for Firebase init errors
    const [expandedSemester, setExpandedSemester] = useState('고1 1학기'); // Default expanded semester

    // Defines the academic structure, including semesters and their subjects.
    // This data drives the "Academics" navigation section.
    const academicStructure = [
        { name: '고1 1학기', subjects: ['국어', '수학', '영어', '통합사회', '통합과학', '한국사', '정보', '진로', '동아리'] },
        { name: '고1 2학기', subjects: ['국어', '수학', '영어', '통합사회', '통합과학', '한국사', '정보', '진로', '동아리'] },
        { name: '고2 1학기', subjects: ['문학', '수학Ⅰ', '영어Ⅰ', '사회탐구', '과학탐구Ⅰ'] },
        { name: '고2 2학기', subjects: ['독서', '수학Ⅱ', '영어Ⅱ', '사회탐구', '과학탐구Ⅰ'] },
        { name: '고3 1학기', subjects: ['화법과 작문', '미적분', '영어 독해와 작문', '사회탐구', '과학탐구Ⅱ'] },
        { name: '고3 2학기', subjects: ['언어와 매체', '기하', '심화 영어', '사회탐구', '과학탐구Ⅱ'] },
    ];
    // Extracts all unique subjects from the academic structure for use in dropdowns, etc.
    const allSubjects = [...new Set(academicStructure.flatMap(s => s.subjects))];

    // Initializes Firebase on component mount.
    // It sets up Firestore (db) and Storage (storage) instances.
    // Handles user authentication, prioritizing custom token sign-in if available,
    // otherwise falling back to anonymous sign-in.
    useEffect(() => {
        const initFirebase = async () => {
            try {
                let firebaseConfigString = window.__firebase_config || process.env.REACT_APP_FIREBASE_CONFIG;
                if (!firebaseConfigString) {
                    console.error("Firebase config not found. Please ensure __firebase_config is set.");
                    setFirebaseInitError(true); // Set error flag
                    setIsLoading(false); // Stop loading
                    return;
                }
                const firebaseConfig = JSON.parse(firebaseConfigString);
                const app = initializeApp(firebaseConfig);
                const auth = getAuth(app);

                // Set Firebase instances immediately
                setDb(getFirestore(app));
                setStorage(getStorage(app));

                const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
                    if (user) {
                        setUserId(user.uid);
                        // Do not set isLoading(false) here, it's handled by the separate useEffect below
                    } else {
                        // If no user, attempt to sign in with a custom token if available.
                        const initialAuthToken = window.__initial_auth_token;
                        if (initialAuthToken) {
                            try {
                                await signInWithCustomToken(auth, initialAuthToken);
                            } catch (e) {
                                console.error("Error signing in with custom token, signing in anonymously:", e);
                                await signInAnonymously(auth).catch(anonError => {
                                    console.error("Anonymous auth error:", anonError);
                                    setFirebaseInitError(true); // Indicate auth failure
                                    setIsLoading(false);
                                });
                            }
                        } else {
                            // Fallback to anonymous sign-in if no custom token is available.
                            await signInAnonymously(auth).catch(e => {
                                console.error("Anonymous auth error:", e);
                                setFirebaseInitError(true); // Indicate auth failure
                                setIsLoading(false);
                            });
                        }
                    }
                });
                return () => unsubscribeAuth(); // Cleanup auth listener
            } catch (e) {
                console.error("Firebase Initialization Error:", e);
                setFirebaseInitError(true); // Set error flag for any init exception
                setIsLoading(false); // Stop loading on error
            }
        };

        initFirebase();
    }, []); // Empty dependency array ensures this effect runs only once on mount.

    // New useEffect to manage isLoading state based on Firebase instances and userId
    useEffect(() => {
        // App is ready when db, storage, and userId are all available, and no init error
        if (db && storage && userId && !firebaseInitError) {
            setIsLoading(false);
        }
        // If there's a firebaseInitError, ensure isLoading is false to show error message
        if (firebaseInitError) {
            setIsLoading(false);
        }
    }, [db, storage, userId, firebaseInitError]); // Dependencies: db, storage, userId, and firebaseInitError

    // Displays loading or error messages based on state.
    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-800 text-xl font-semibold">애플리케이션 로딩 중...</div>;
    }

    if (firebaseInitError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-800 text-center p-4">
                <p className="text-xl font-semibold">
                    😭 오류 발생: Firebase 초기화 또는 사용자 인증에 실패했습니다.
                    <br />
                    콘솔 로그를 확인하거나 관리자에게 문의해주세요.
                </p>
            </div>
        );
    }

    // Defines the main navigation items for the sidebar.
    const navigationItems = [
        { name: '오늘의 기록', page: 'today', icon: <HomeIcon /> },
        { name: '스터디 플래너', page: 'planner', icon: <ClipboardListIcon /> },
        { name: '독서 기록장', page: 'readinglog', icon: <BookOpenIcon /> },
        { name: '데일리 다이어리', page: 'diary', icon: <PencilAltIcon /> },
        { name: '알림장', page: 'notices', icon: <BellIcon /> },
        { name: '가족 소통 보드', page: 'family', icon: <UsersIcon /> },
    ];

    /**
     * Renders the appropriate page component based on the current `page` state.
     * Uses a switch statement to conditionally render views.
     */
    const renderPage = () => {
        // Render a placeholder or error if essential Firebase instances aren't ready
        // (even if isLoading is false, implying init *attempted* but some part failed).
        if (!db || !userId || !storage) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center p-4">
                    <p className="text-lg font-medium mb-2">데이터 로딩 중...</p>
                    <p className="text-sm">필수 서비스 연결이 지연되고 있습니다. 잠시 기다려주세요.</p>
                </div>
            );
        }

        switch (page) {
            case 'today': return <DashboardView db={db} userId={userId} setPage={setPage} />;
            case 'planner': return <StudyPlannerView db={db} userId={userId} subjects={allSubjects} />;
            case 'readinglog': return <ReadingLogView db={db} userId={userId} storage={storage} />;
            case 'diary': return <DiaryView db={db} userId={userId} storage={storage} />;
            case 'notices': return <NoticeBoardView db={db} userId={userId} />;
            case 'family': return <FamilyBoardView db={db} userId={userId} />;
            default:
                // If the page matches a subject name, render the SubjectDetailView.
                if (allSubjects.includes(page)) {
                    return <SubjectDetailView subject={page} db={db} userId={userId} storage={storage} />;
                }
                // Default to DashboardView if no other page matches.
                return <DashboardView db={db} userId={userId} setPage={setPage} />;
        }
    };

    /**
     * Toggles the expansion state of a semester in the academic navigation.
     * If the clicked semester is already expanded, it collapses it; otherwise, it expands it.
     * @param {string} semesterName - The name of the semester to toggle.
     */
    const handleSemesterClick = (semesterName) => {
        setExpandedSemester(prev => (prev === semesterName ? null : semesterName));
    };

    return (
        <div className="flex h-screen bg-white font-sans">
            {/* Tailwind CSS CDN - Ensure it's loaded for styles to apply */}
            {/* IMPORTANT: In a real React project, Tailwind is typically built/bundled,
                but for a self-contained Canvas immersive, including the CDN is often necessary. */}
            <script src="https://cdn.tailwindcss.com"></script>

            {/* Custom CSS for font import and background color */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Merriweather:wght@400;700&display=swap');
                .main-content-bg { background-color: #f8fafc; }
                /* Custom scrollbar for better aesthetics */
                ::-webkit-scrollbar {
                    width: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb {
                    background: #cbd5e1; /* gray-300 */
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8; /* gray-400 */
                }
            `}</style>

            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white border-r border-gray-200 flex-col flex shadow-lg z-10">
                <div className="h-20 flex flex-col items-center justify-center border-b border-gray-200 px-4">
                    <div className="flex items-center">
                        <img src="https://i.postimg.cc/ZnST53NL/yunseo.png" alt="Yunseo's character" className="h-10 w-10 rounded-full" />
                        <h1 className="ml-3 text-xl font-bold text-gray-800" style={{ fontFamily: "'Merriweather', serif" }}>Yunseo's Edutopia</h1>
                    </div>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {/* Main Navigation Items */}
                    {navigationItems.map(item => (
                        <a key={item.name} href="#" onClick={() => setPage(item.page)} className={`flex items-center px-4 py-2 text-gray-600 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors ${page === item.page ? 'bg-green-100 text-green-800 font-semibold' : ''}`}>
                            <span className="text-green-500">{item.icon}</span>
                            <span className="ml-3">{item.name}</span>
                        </a>
                    ))}
                    {/* Academic Structure Navigation */}
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

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6">
                    <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Merriweather', serif" }}>
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

/**
 * CalendarWidget component displays a monthly calendar with D-Day events.
 * Users can navigate months and add new D-Day events.
 * Events are fetched from Firestore and displayed on the corresponding dates.
 */
const CalendarWidget = ({ db, userId }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);

    // Fetches D-Day events from Firestore when userId or db changes.
    // Uses a real-time listener (onSnapshot) to keep events updated.
    useEffect(() => {
        if (!userId || !db) return;
        const q = query(collection(db, dbPaths.dDayEvents(userId)));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedEvents = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date.toDate() // Convert Firestore Timestamp to Date object
            }));
            setEvents(fetchedEvents);
        });
        return unsubscribe; // Cleanup the listener on component unmount
    }, [userId, db]);

    /**
     * Changes the displayed month by a given offset.
     * @param {number} offset - The number of months to add or subtract (e.g., -1 for previous month).
     */
    const changeMonth = (offset) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    /**
     * Handles adding a new D-Day event to Firestore.
     * @param {string} name - The name of the event.
     * @param {string} date - The date of the event in 'YYYY-MM-DD' format.
     */
    const handleAddEvent = async (name, date) => {
        try {
            await addDoc(collection(db, dbPaths.dDayEvents(userId)), {
                name,
                date: new Date(date) // Store as a Date object which Firestore converts to Timestamp
            });
            setShowAddForm(false); // Hide the form after adding
        } catch (error) {
            console.error("Error adding D-Day event:", error);
        }
    };

    // Calculate calendar days for the current month.
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDay = new Date(year, month, 1).getDay(); // Day of the week (0 for Sunday, 6 for Saturday)
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Number of days in the current month

    const calendarDays = [];
    // Add empty divs for leading blank days in the calendar grid.
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="p-1 border border-gray-200 bg-gray-50"></div>);
    }
    // Add divs for each day of the month.
    for (let i = 1; i <= daysInMonth; i++) {
        const day = new Date(year, month, i);
        const isToday = day.toDateString() === new Date().toDateString(); // Check if it's today's date
        // Filter events for the current day.
        const dayEvents = events.filter(e => e.date.toDateString() === day.toDateString());

        calendarDays.push(
            <div key={i} className={`p-1 border border-gray-200 h-24 flex flex-col ${isToday ? 'bg-green-100' : 'bg-white'} rounded-md`}>
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
            <div className="grid grid-cols-7 gap-1">{calendarDays}</div> {/* Added gap for better spacing */}
            <button onClick={() => setShowAddForm(!showAddForm)} className="mt-4 w-full text-sm py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">D-Day 추가</button>
            {showAddForm && <AddDdayForm onAdd={handleAddEvent} />}
        </div>
    );
};

/**
 * AddDdayForm component for adding new D-Day events.
 * @param {function} onAdd - Callback function to add the event.
 */
const AddDdayForm = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !date) return; // Basic validation
        onAdd(name, date);
        setName('');
        setDate('');
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 p-2 bg-gray-100 rounded-lg flex gap-2">
            <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="이벤트 이름"
                className="flex-grow p-1 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500"
            />
            <input
                value={date}
                onChange={e => setDate(e.target.value)}
                type="date"
                className="p-1 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500"
            />
            <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded-md text-sm font-semibold hover:bg-green-700">저장</button>
        </form>
    );
};

/**
 * TimetableWidget displays a fixed weekly schedule.
 * This is a static component and does not interact with Firebase.
 */
const TimetableWidget = () => {
    // Static schedule data.
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

/**
 * TodoListWidget displays a summary of uncompleted tasks from the study planner.
 * It links to the full study planner page.
 */
const TodoListWidget = ({ db, userId, setPage }) => {
    const [tasks, setTasks] = useState([]);

    // Fetches a limited number of uncompleted tasks from the study planner.
    useEffect(() => {
        if (!userId || !db) return;
        const q = query(
            collection(db, dbPaths.studyPlanner(userId)),
            orderBy("createdAt", "desc"), // Order by creation date to get recent tasks
            limit(20) // Limit the initial fetch to a reasonable number
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Filter and slice to show only a few uncompleted tasks.
            const uncompletedTasks = allTasks.filter(task => !task.completed).slice(0, 5);
            setTasks(uncompletedTasks);
        }, (error) => {
            console.error("Error fetching todo list for dashboard:", error);
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

/**
 * QuickMemoWidget allows users to quickly jot down notes.
 * The notes are saved to the daily diary entry for the current day, with debouncing for performance.
 */
const QuickMemoWidget = ({ db, userId }) => {
    const [memo, setMemo] = useState('');
    const debouncedMemo = useDebounce(memo, 1000); // Debounce memo updates by 1 second.
    const todayId = new Date().toISOString().slice(0, 10); //YYYY-MM-DD format for document ID

    // Fetches today's memo when component mounts or userId/db changes.
    useEffect(() => {
        if (!userId || !db) return;
        const memoDocRef = doc(db, dbPaths.diary(userId), todayId);
        const unsubscribe = onSnapshot(memoDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setMemo(docSnap.data().content);
            } else {
                setMemo(''); // Clear memo if no entry exists for today.
            }
        }, (error) => {
            console.error("Error fetching quick memo:", error);
        });
        return unsubscribe;
    }, [userId, db, todayId]);

    // Saves the debounced memo content to Firestore.
    // Uses setDoc with merge: true to avoid overwriting other fields in the diary entry.
    useEffect(() => {
        // Only save if debouncedMemo is defined and userId exists to prevent initial empty saves
        // or saves before auth is ready.
        if (debouncedMemo !== undefined && userId && db) {
            const memoDocRef = doc(db, dbPaths.diary(userId), todayId);
            setDoc(memoDocRef, { content: debouncedMemo, createdAt: serverTimestamp() }, { merge: true })
                .catch(error => console.error("Error saving quick memo:", error));
        }
    }, [debouncedMemo, userId, db, todayId]); // Depends on debouncedMemo, userId, db, and todayId

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

/**
 * DashboardView is the landing page displaying various widgets:
 * Calendar, Timetable, Todo List summary, and Quick Memo.
 */
const DashboardView = ({ db, userId, setPage }) => {
    return (
        <div className="space-y-6">
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm text-center">
                <h3 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "'Merriweather', serif" }}>오늘의 한 걸음이 내일의 역사가 됩니다.</h3>
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
    );
};

/**
 * StudyPlannerView allows users to add, manage, and track study tasks.
 * Tasks are stored in Firestore and can be marked as completed or deleted.
 */
const StudyPlannerView = ({ db, userId, subjects }) => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [subject, setSubject] = useState(subjects[0] || ''); // Default subject to the first available one

    // Fetches study planner tasks from Firestore.
    // Orders tasks by creation date and then sorts them by completion status in memory.
    useEffect(() => {
        if (!userId || !db) return;
        // Query tasks, ordered by createdAt.
        const q = query(collection(db, dbPaths.studyPlanner(userId)), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort tasks in memory: uncompleted tasks first, then completed tasks.
            fetchedTasks.sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);
            setTasks(fetchedTasks);
        }, (error) => {
            console.error("Error fetching study plan:", error);
        });
        return unsubscribe; // Cleanup the listener
    }, [userId, db]);

    /**
     * Adds a new study task to Firestore.
     * @param {Event} e - The form submission event.
     */
    const addTask = async (e) => {
        e.preventDefault();
        if (newTask.trim() === '') return; // Prevent adding empty tasks
        try {
            await addDoc(collection(db, dbPaths.studyPlanner(userId)), {
                text: newTask,
                subject: subject,
                completed: false,
                createdAt: serverTimestamp(), // Use server timestamp for consistent ordering
            });
            setNewTask(''); // Clear input after adding
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    /**
     * Toggles the completion status of a task in Firestore.
     * @param {string} id - The ID of the task to toggle.
     * @param {boolean} completed - The current completion status of the task.
     */
    const toggleTask = async (id, completed) => {
        try {
            await updateDoc(doc(db, dbPaths.studyPlanner(userId), id), { completed: !completed });
        } catch (error) {
            console.error("Error toggling task:", error);
        }
    };

    /**
     * Deletes a task from Firestore after user confirmation.
     * @param {string} id - The ID of the task to delete.
     */
    const deleteTask = async (id) => {
        // Show confirmation modal instead of window.confirm
        setConfirmationModal({
            show: true,
            title: "할 일 삭제",
            message: "이 할 일을 정말 삭제하시겠습니까?",
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, dbPaths.studyPlanner(userId), id));
                } catch (error) {
                    console.error("Error deleting task:", error);
                } finally {
                    setConfirmationModal({ show: false });
                }
            },
            onCancel: () => setConfirmationModal({ show: false })
        });
    };

    // State for the confirmation modal
    const [confirmationModal, setConfirmationModal] = useState({ show: false });


    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            {/* Confirmation Modal */}
            <ConfirmationModal
                show={confirmationModal.show}
                title={confirmationModal.title}
                message={confirmationModal.message}
                onConfirm={confirmationModal.onConfirm}
                onCancel={confirmationModal.onCancel}
            />

            <form onSubmit={addTask} className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <input
                    type="text"
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    placeholder="새로운 학습 목표를 입력하세요..."
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button type="submit" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">추가</button>
            </form>
            <ul className="space-y-3">
                {tasks.map(task => (
                    <li key={task.id} className={`flex items-center justify-between p-4 rounded-lg transition-all ${task.completed ? 'bg-gray-100' : 'bg-green-50'}`}>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(task.id, task.completed)}
                                className="h-5 w-5 rounded-md border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                            />
                            <div className="ml-4">
                                <p className={`text-lg ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{task.text}</p>
                                <span className="text-sm font-medium text-white bg-green-500 px-2 py-0.5 rounded-full">{task.subject}</span>
                            </div>
                        </div>
                        <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

/**
 * ReadingLogView allows users to record books they've read, including cover images and notes.
 * It integrates with Firestore for book data and Firebase Storage for cover images.
 */
const ReadingLogView = ({ db, userId, storage }) => {
    const [books, setBooks] = useState([]);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null); // Ref for resetting the file input
    const [confirmationModal, setConfirmationModal] = useState({ show: false }); // State for confirmation modal

    // Fetches books from Firestore and updates the state.
    useEffect(() => {
        if (!userId || !db) return;
        // Orders books by creation date.
        const q = query(collection(db, dbPaths.readingLog(userId)), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("Error fetching reading log:", error);
        });
        return unsubscribe;
    }, [userId, db]);

    /**
     * Adds a new book entry to Firestore, optionally uploading a cover image to Storage.
     * @param {Event} e - The form submission event.
     */
    const addBook = async (e) => {
        e.preventDefault();
        if (title.trim() === '' || author.trim() === '') return; // Basic validation
        setIsUploading(true);

        let coverImageUrl = '';
        let imageRefPath = '';

        if (coverImage) {
            // Create a storage reference with a unique name for the image.
            const imageRef = ref(storage, `reading-log-covers/${userId}/${Date.now()}_${coverImage.name}`);
            imageRefPath = imageRef.fullPath; // Store full path for easy deletion
            try {
                const snapshot = await uploadBytes(imageRef, coverImage); // Upload the file
                coverImageUrl = await getDownloadURL(snapshot.ref); // Get the public URL
            } catch (error) {
                console.error("Error uploading image:", error);
                setIsUploading(false);
                return;
            }
        }

        try {
            await addDoc(collection(db, dbPaths.readingLog(userId)), {
                title,
                author,
                notes: '', // Initialize notes field
                coverImageUrl,
                imageRefPath, // Store reference path for easy deletion later
                createdAt: serverTimestamp(),
            });
            // Reset form fields after successful addition
            setTitle('');
            setAuthor('');
            setCoverImage(null);
            if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input
        } catch (error) {
            console.error("Error adding book record:", error);
        } finally {
            setIsUploading(false);
        }
    };

    /**
     * Debounced function to update book notes in Firestore.
     * Prevents excessive writes when user types.
     */
    const debouncedUpdateNotes = useCallback((id, newNotes) => {
        const timeoutId = setTimeout(async () => {
            try {
                await updateDoc(doc(db, dbPaths.readingLog(userId), id), { notes: newNotes });
            } catch (error) {
                console.error("Error updating book notes:", error);
            }
        }, 1000); // 1-second debounce delay
        return () => clearTimeout(timeoutId); // Cleanup function for previous timeout
    }, [db, userId]); // Dependencies for useCallback

    /**
     * Deletes a book record and its associated cover image (if any) from Firestore and Storage.
     * Uses a custom confirmation modal.
     * @param {object} book - The book object to delete.
     */
    const deleteBook = async (book) => {
        setConfirmationModal({
            show: true,
            title: "독서 기록 삭제",
            message: `'${book.title}' 기록을 정말 삭제하시겠습니까?`,
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, dbPaths.readingLog(userId), book.id)); // Delete document from Firestore
                    if (book.imageRefPath) {
                        const imageRef = ref(storage, book.imageRefPath);
                        await deleteObject(imageRef).catch(e => console.error("Error deleting image from Storage:", e));
                    }
                } catch (error) {
                    console.error("Error deleting book record:", error);
                } finally {
                    setConfirmationModal({ show: false });
                }
            },
            onCancel: () => setConfirmationModal({ show: false })
        });
    };

    return (
        <div className="space-y-6">
            {/* Confirmation Modal */}
            <ConfirmationModal
                show={confirmationModal.show}
                title={confirmationModal.title}
                message={confirmationModal.message}
                onConfirm={confirmationModal.onConfirm}
                onCancel={confirmationModal.onCancel}
            />

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <form onSubmit={addBook} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label htmlFor="book-title" className="block text-sm font-medium text-gray-700">책 제목</label>
                        <input id="book-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    </div>
                    <div className="md:col-span-1">
                        <label htmlFor="book-author" className="block text-sm font-medium text-gray-700">저자</label>
                        <input id="book-author" type="text" value={author} onChange={e => setAuthor(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
                    </div>
                    <div className="md:col-span-1">
                        <label htmlFor="book-cover" className="block text-sm font-medium text-gray-700">책 표지 이미지</label>
                        <input id="book-cover" type="file" ref={fileInputRef} onChange={e => setCoverImage(e.target.files[0])} accept="image/*" className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
                    </div>
                    <button type="submit" disabled={isUploading} className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                        {isUploading ? "업로드 중..." : "기록 추가"}
                    </button>
                </form>
            </div>
            <div className="space-y-4">
                {books.map(book => (
                    <div key={book.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-5 items-start">
                        <div className="w-full sm:w-28 flex-shrink-0">
                            {book.coverImageUrl ? (
                                <img
                                    src={book.coverImageUrl}
                                    alt={`${book.title} 표지`}
                                    className="w-full h-40 object-cover rounded-md shadow-md"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/112x160/cbd5e1/4b5563?text=No+Image'; }} // Fallback image
                                />
                            ) : (
                                <div className="w-full h-40 bg-gray-200 rounded-md flex items-center justify-center text-center text-gray-400 text-sm">이미지 없음</div>
                            )}
                        </div>
                        <div className="flex-grow w-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Merriweather', serif" }}>{book.title}</h4>
                                    <p className="text-gray-600">저자: {book.author}</p>
                                </div>
                                <button onClick={() => deleteBook(book)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                            </div>
                            <textarea
                                defaultValue={book.notes}
                                onChange={(e) => debouncedUpdateNotes(book.id, e.target.value)}
                                placeholder="이 책에 대한 감상이나 중요한 구절을 기록해보세요..."
                                className="mt-4 w-full h-24 p-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 resize-y"
                            />
                        </div>
                    </div>
                ))}
                {books.length === 0 && (
                    <p className="text-center text-gray-500 p-4">아직 기록된 독서 활동이 없습니다. 첫 책을 추가해보세요!</p>
                )}
            </div>
        </div>
    );
};

/**
 * DiaryView allows users to write daily diary entries and attach a single image.
 * It displays today's entry and a list of past entries.
 */
const DiaryView = ({ db, userId, storage }) => {
    const [entry, setEntry] = useState({ content: '', imageUrl: '', imageRefPath: '' });
    const [pastEntries, setPastEntries] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null); // Ref for the file input element
    const [confirmationModal, setConfirmationModal] = useState({ show: false }); // State for confirmation modal

    const todayId = new Date().toISOString().slice(0, 10); //YYYY-MM-DD format for today's diary document ID

    // Fetches today's diary entry and a list of past entries from Firestore.
    useEffect(() => {
        if (!userId || !db) return;

        // Listener for today's diary entry (real-time updates)
        const todayDocRef = doc(db, dbPaths.diary(userId), todayId);
        const unsubscribeToday = onSnapshot(todayDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setEntry(docSnap.data());
            } else {
                setEntry({ content: '', imageUrl: '', imageRefPath: '' }); // Reset if no entry for today
            }
        }, (error) => console.error("Error fetching today's diary entry:", error));

        // Listener for past diary entries (real-time updates, excluding today's)
        const q = query(collection(db, dbPaths.diary(userId)), orderBy("createdAt", "desc"));
        const unsubscribePast = onSnapshot(q, (snapshot) => {
            const entries = snapshot.docs
                .filter(doc => doc.id !== todayId) // Exclude today's entry from past entries
                .map(doc => ({ id: doc.id, ...doc.data() }));
            setPastEntries(entries);
        }, (error) => console.error("Error fetching past diary entries:", error));

        // Cleanup function for both listeners
        return () => {
            unsubscribeToday();
            unsubscribePast();
        };
    }, [userId, db, todayId]); // Re-run effect if userId, db, or todayId changes

    /**
     * Handles saving the diary entry, including uploading/updating an image if a new one is selected.
     */
    const handleSave = async () => {
        if (!userId || !db || !storage) return; // Ensure Firebase services are ready
        setIsUploading(true);
        const todayDocRef = doc(db, dbPaths.diary(userId), todayId);

        let newImageUrl = entry.imageUrl;
        let newImageRefPath = entry.imageRefPath;

        if (imageFile) {
            // If a new image file is selected, delete the old one from storage if it exists.
            if (entry.imageRefPath) {
                const oldImageRef = ref(storage, entry.imageRefPath);
                await deleteObject(oldImageRef).catch(e => console.error("Could not delete old diary image:", e));
            }

            // Upload the new image.
            const imageRef = ref(storage, `diary-images/${userId}/${todayId}_${imageFile.name}`);
            newImageRefPath = imageRef.fullPath;
            try {
                const snapshot = await uploadBytes(imageRef, imageFile);
                newImageUrl = await getDownloadURL(snapshot.ref);
            } catch (error) {
                console.error("Error uploading new diary image:", error);
                setIsUploading(false);
                return;
            }
        }

        // Data to save to Firestore.
        const dataToSave = {
            content: entry.content,
            imageUrl: newImageUrl,
            imageRefPath: newImageRefPath,
            createdAt: serverTimestamp(), // Ensures a timestamp for ordering
        };

        try {
            await setDoc(todayDocRef, dataToSave, { merge: true }); // Use merge: true to update existing fields without overwriting the whole document
            setImageFile(null); // Clear selected file after upload
            if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input element
        } catch (error) {
            console.error("Error saving diary entry:", error);
        } finally {
            setIsUploading(false);
        }
    };

    /**
     * Handles removing the currently attached image from the diary entry and Storage.
     * Uses a custom confirmation modal.
     */
    const removeImage = async () => {
        if (!entry.imageRefPath || !userId || !db || !storage) return; // Ensure image exists and services are ready

        setConfirmationModal({
            show: true,
            title: "사진 삭제",
            message: "이 사진을 정말 삭제하시겠습니까?",
            onConfirm: async () => {
                try {
                    const imageRef = ref(storage, entry.imageRefPath);
                    await deleteObject(imageRef); // Delete image from Storage
                    const todayDocRef = doc(db, dbPaths.diary(userId), todayId);
                    // Update Firestore document to remove image references
                    await updateDoc(todayDocRef, {
                        imageUrl: '',
                        imageRefPath: ''
                    });
                    setImageFile(null); // Clear any pending new image selection
                    if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input element
                } catch (error) {
                    console.error("Error deleting diary image:", error);
                } finally {
                    setConfirmationModal({ show: false });
                }
            },
            onCancel: () => setConfirmationModal({ show: false })
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Confirmation Modal */}
            <ConfirmationModal
                show={confirmationModal.show}
                title={confirmationModal.title}
                message={confirmationModal.message}
                onConfirm={confirmationModal.onConfirm}
                onCancel={confirmationModal.onCancel}
            />

            <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Merriweather', serif" }}>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}의 기록</h3>
                    <button onClick={handleSave} disabled={isUploading} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors">
                        {isUploading ? "저장 중..." : "기록 저장"}
                    </button>
                </div>

                <div className="mb-4">
                    {entry.imageUrl ? (
                        <div className="relative group">
                            <img
                                src={entry.imageUrl}
                                alt="오늘의 사진"
                                className="w-full h-64 object-cover rounded-lg shadow-md"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x256/cbd5e1/4b5563?text=Error+Loading+Image'; }} // Fallback image
                            />
                            <button onClick={removeImage} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <label htmlFor="diary-image-upload" className="cursor-pointer flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                                <CameraIcon />
                                <span>오늘의 사진 추가</span>
                            </label>
                            <input id="diary-image-upload" type="file" ref={fileInputRef} onChange={e => setImageFile(e.target.files[0])} accept="image/*" className="hidden" />
                            {imageFile && <span className="text-sm text-gray-600">{imageFile.name}</span>}
                        </div>
                    )}
                </div>

                <textarea
                    value={entry.content || ''} // Ensure it's a controlled component
                    onChange={e => setEntry({ ...entry, content: e.target.value })}
                    placeholder="오늘 하루는 어땠나요? 생각, 감정, 배운 점 등 무엇이든 자유롭게 기록해보세요."
                    className="w-full flex-1 p-4 text-lg leading-relaxed border-none focus:ring-0 bg-gray-50 rounded-md resize-y"
                />
            </div>

            <div className="lg:col-span-1 bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 flex-shrink-0">지난 기록들</h4>
                <div className="space-y-4 overflow-y-auto">
                    {pastEntries.length > 0 ? pastEntries.map(e => (
                        <div key={e.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex gap-4">
                            {e.imageUrl && (
                                <img
                                    src={e.imageUrl}
                                    className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                                    alt="기록 사진"
                                    onError={(el) => { el.target.onerror = null; el.target.src = 'https://placehold.co/64x64/e2e8f0/64748b?text=Img'; }} // Fallback for past entry image
                                />
                            )}
                            <div>
                                <p className="font-semibold text-green-700">{e.id}</p> {/* Display date as ID */}
                                <p className="mt-1 text-gray-600 text-sm truncate">{e.content}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500">지난 기록이 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * NoticeBoardView displays school and personal notices.
 * Notices are fetched from a user-specific Firestore collection.
 */
const NoticeBoardView = ({ db, userId }) => {
    const [notices, setNotices] = useState([]);

    // Fetches notices from Firestore.
    useEffect(() => {
        if (!userId || !db) return;
        const q = query(collection(db, dbPaths.notices(userId)), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setNotices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("Error fetching notices:", error);
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
    );
};

/**
 * FamilyBoardView provides a real-time communication board for family members.
 * Messages are stored in a public Firestore collection.
 */
const FamilyBoardView = ({ db, userId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [author, setAuthor] = useState('윤서'); // Default author
    const messagesEndRef = useRef(null); // Ref to scroll to the latest message

    // Fetches messages from the public family board collection in real-time.
    useEffect(() => {
        if (!db) return;
        // Queries messages ordered by creation time in ascending order for chat-like display.
        const q = query(collection(db, dbPaths.familyBoard()), orderBy("createdAt", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("Error fetching family board messages:", error);
        });
        return unsubscribe;
    }, [db]);

    // Scrolls to the latest message whenever messages are updated.
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    /**
     * Sends a new message to the family board.
     * @param {Event} e - The form submission event.
     */
    const sendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return; // Prevent sending empty messages
        try {
            await addDoc(collection(db, dbPaths.familyBoard()), {
                text: newMessage,
                author,
                userId: userId, // Include userId for identification as required for multi-user apps
                createdAt: serverTimestamp()
            });
            setNewMessage(''); // Clear input after sending
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.author === '윤서' ? 'justify-end' : 'justify-start'}`}>
                            {/* Display author initial if not '윤서' and include userId for multi-user app requirement */}
                            {msg.author !== '윤서' && (
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-white text-sm">{msg.author.charAt(0)}</div>
                                    {msg.userId && <span className="text-xs text-gray-500 mt-1 truncate max-w-[80px]">{msg.userId.substring(0, 5)}...</span>} {/* Show truncated userId */}
                                </div>
                            )}
                            <div className={`max-w-md p-3 rounded-2xl ${msg.author === '윤서' ? 'bg-green-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                            {/* Display '윤서' initial if author is '윤서' and include userId */}
                            {msg.author === '윤서' && (
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold text-white text-sm">윤</div>
                                    {msg.userId && <span className="text-xs text-gray-500 mt-1 truncate max-w-[80px]">{msg.userId.substring(0, 5)}...</span>}
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} /> {/* Dummy div for auto-scrolling */}
                </div>
            </div>
            <form onSubmit={sendMessage} className="flex items-center gap-2">
                <select value={author} onChange={e => setAuthor(e.target.value)} className="p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
                    <option>윤서</option>
                    <option>엄마</option>
                    <option>아빠</option>
                </select>
                <input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    type="text"
                    placeholder="메시지를 입력하세요..."
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <button type="submit" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">전송</button>
            </form>
        </div>
    );
};

/**
 * SubjectDetailView provides a comprehensive management interface for a specific subject.
 * It includes sections for assessments, materials, mistake logs, and resource links.
 */
const SubjectDetailView = ({ subject, db, userId, storage }) => {
    const [assessments, setAssessments] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [mistakes, setMistakes] = useState([]);
    const [links, setLinks] = useState([]);
    const [confirmationModal, setConfirmationModal] = useState({ show: false }); // State for confirmation modal

    // Fetches data for assessments, materials, mistakes, and links for the current subject.
    // Data is sorted in memory after fetching from Firestore to avoid index issues with orderBy().
    useEffect(() => {
        if (!userId || !db) return;

        /**
         * Creates a real-time Firestore subscription for a given path and filters by subject.
         * Optionally sorts the fetched items in memory.
         * @param {string} path - The Firestore collection path.
         * @param {string} filterField - The field to filter by (e.g., "subject").
         * @param {string} [sortField] - Optional field to sort by in memory.
         * @param {function} setter - The state setter function for the data.
         * @returns {function} The unsubscribe function for the listener.
         */
        const createSubscription = (path, filterField, sortField, setter) => {
            const q = query(collection(db, path), where(filterField, "==", subject));
            return onSnapshot(q, snapshot => {
                let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Sort items in memory if a sortField is provided.
                if (sortField) {
                    items.sort((a, b) => {
                        const valA = a[sortField]?.toDate ? a[sortField].toDate() : a[sortField] || 0;
                        const valB = b[sortField]?.toDate ? b[sortField].toDate() : b[sortField] || 0;
                        return valB - valA; // Descending order for dates/timestamps
                    });
                }
                setter(items);
            }, error => console.error(`Error fetching ${path}:`, error));
        };

        // Set up subscriptions for all subject-specific data types.
        const unsubAssessments = createSubscription(dbPaths.assessments(userId), "subject", "dueDate", setAssessments);
        const unsubMaterials = createSubscription(dbPaths.materials(userId), "subject", "createdAt", setMaterials);
        const unsubMistakes = createSubscription(dbPaths.mistakeLog(userId), "subject", "createdAt", setMistakes);
        const unsubLinks = createSubscription(dbPaths.resourceLinks(userId), "subject", "createdAt", setLinks);

        // Cleanup function to unsubscribe from all listeners when the component unmounts or dependencies change.
        return () => {
            unsubAssessments();
            unsubMaterials();
            unsubMistakes();
            unsubLinks();
        };
    }, [userId, db, subject]); // Re-run effect if userId, db, or subject changes

    /**
     * Generic handler for adding new documents to Firestore.
     * Automatically adds subject and createdAt fields.
     * @param {string} path - The Firestore collection path.
     * @param {object} data - The data to add.
     */
    const handleAdd = async (path, data) => {
        try {
            await addDoc(collection(db, path), { ...data, subject, createdAt: serverTimestamp() });
        } catch (error) {
            console.error("Error adding document:", error);
        }
    };

    /**
     * Generic handler for deleting documents from Firestore.
     * @param {string} path - The Firestore collection path.
     * @param {string} id - The ID of the document to delete.
     */
    const handleDelete = async (path, id) => {
        setConfirmationModal({
            show: true,
            title: "항목 삭제",
            message: "이 항목을 정말 삭제하시겠습니까?",
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, path, id));
                } catch (error) {
                    console.error("Error deleting document:", error);
                } finally {
                    setConfirmationModal({ show: false });
                }
            },
            onCancel: () => setConfirmationModal({ show: false })
        });
    };

    /**
     * Handler for deleting documents that also have associated files in Firebase Storage.
     * @param {string} path - The Firestore collection path.
     * @param {object} item - The item object containing the ID and file path.
     * @param {string} filePathField - The field name in the item object that holds the file reference path.
     */
    const handleDeleteWithFile = async (path, item, filePathField) => {
        setConfirmationModal({
            show: true,
            title: "항목 및 파일 삭제",
            message: "이 항목과 관련된 파일을 정말 삭제하시겠습니까?",
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, path, item.id)); // Delete document first
                    if (item[filePathField] && storage) {
                        const fileRef = ref(storage, item[filePathField]);
                        await deleteObject(fileRef).catch(e => console.error("File deletion error:", e));
                    }
                } catch (error) {
                    console.error("Error deleting item with file:", error);
                } finally {
                    setConfirmationModal({ show: false });
                }
            },
            onCancel: () => setConfirmationModal({ show: false })
        });
    };

    return (
        <div className="space-y-8">
            {/* Confirmation Modal */}
            <ConfirmationModal
                show={confirmationModal.show}
                title={confirmationModal.title}
                message={confirmationModal.message}
                onConfirm={confirmationModal.onConfirm}
                onCancel={confirmationModal.onCancel}
            />

            <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Merriweather', serif" }}>{subject} 학습 관리</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 수행평가 관리 (Assessment Management) */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">수행평가 관리</h3>
                    <AddAssessmentForm onAdd={(data) => handleAdd(dbPaths.assessments(userId), data)} />
                    <ul className="space-y-3 max-h-96 overflow-y-auto">
                        {assessments.length > 0 ? assessments.map(item => (
                            <li key={item.id} className="p-3 bg-green-50 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-700">{item.name}</p>
                                    <p className="text-sm text-gray-500">마감: {item.dueDate}</p>
                                </div>
                                <button onClick={() => handleDelete(dbPaths.assessments(userId), item.id)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                            </li>
                        )) : <p className="text-sm text-gray-500">등록된 수행평가가 없습니다.</p>}
                    </ul>
                </div>

                {/* 수업 자료 (Class Materials) */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">수업 자료</h3>
                    <AddMaterialForm onAdd={(data) => handleAdd(dbPaths.materials(userId), data)} userId={userId} storage={storage} />
                    <ul className="space-y-3 max-h-96 overflow-y-auto">
                        {materials.length > 0 ? materials.map(item => (
                            <li key={item.id} className="p-3 bg-green-50 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-700">{item.topic}</p>
                                    {item.fileUrl && <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline">파일 보기</a>}
                                </div>
                                <button onClick={() => handleDeleteWithFile(dbPaths.materials(userId), item, 'fileRefPath')} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                            </li>
                        )) : <p className="text-sm text-gray-500">등록된 수업 자료가 없습니다.</p>}
                    </ul>
                </div>

                {/* 오답 노트 (Mistake Log) */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">오답 노트</h3>
                    <AddMistakeForm onAdd={(data) => handleAdd(dbPaths.mistakeLog(userId), data)} userId={userId} storage={storage} />
                    <ul className="space-y-3 max-h-96 overflow-y-auto">
                        {mistakes.length > 0 ? mistakes.map(item => (
                            <li key={item.id} className="p-3 bg-red-50 rounded-md flex flex-col">
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold text-gray-700">{item.topic}</p>
                                    <button onClick={() => handleDeleteWithFile(dbPaths.mistakeLog(userId), item, 'imageRefPath')} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{item.analysis}</p>
                                {item.imageUrl && (
                                    <img
                                        src={item.imageUrl}
                                        alt="오답 문제"
                                        className="mt-2 rounded-md max-h-48 object-contain"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x100/fecaca/991b1b?text=Error'; }}
                                    />
                                )}
                            </li>
                        )) : <p className="text-sm text-gray-500">등록된 오답이 없습니다.</p>}
                    </ul>
                </div>

                {/* 관련 링크 (Resource Links) */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">관련 링크</h3>
                    <AddLinkForm onAdd={(data) => handleAdd(dbPaths.resourceLinks(userId), data)} />
                    <ul className="space-y-3 max-h-96 overflow-y-auto">
                        {links.length > 0 ? links.map(item => (
                            <li key={item.id} className="p-3 bg-yellow-50 rounded-md flex justify-between items-center">
                                <div>
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-yellow-700 hover:underline">{item.title}</a>
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                </div>
                                <button onClick={() => handleDelete(dbPaths.resourceLinks(userId), item.id)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                            </li>
                        )) : <p className="text-sm text-gray-500">등록된 링크가 없습니다.</p>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

// --- Helper Components for SubjectDetailView Forms ---

/**
 * AddAssessmentForm allows users to add new assessment entries.
 * @param {function} onAdd - Callback function to add the assessment data.
 */
const AddAssessmentForm = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !dueDate) return; // Basic validation
        onAdd({ name, dueDate, status: '예정' }); // Default status for new assessment
        setName('');
        setDueDate('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-gray-50 rounded-md">
            <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="수행평가 이름"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
            <input
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
            <button type="submit" className="w-full py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors">수행평가 추가</button>
        </form>
    );
};

/**
 * AddMaterialForm allows users to upload class materials (files).
 * It handles file upload to Firebase Storage and stores file URL/path in Firestore.
 * @param {function} onAdd - Callback function to add the material data.
 * @param {string} userId - Current user's ID for Storage path.
 * @param {object} storage - Firebase Storage instance.
 */
const AddMaterialForm = ({ onAdd, userId, storage }) => {
    const [topic, setTopic] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!topic) return; // Topic is required
        setIsUploading(true);
        let fileUrl = '';
        let fileRefPath = '';

        if (file && userId && storage) {
            const fileRef = ref(storage, `materials/${userId}/${Date.now()}_${file.name}`);
            fileRefPath = fileRef.fullPath;
            try {
                await uploadBytes(fileRef, file);
                fileUrl = await getDownloadURL(fileRef);
            } catch (error) {
                console.error("Error uploading material file:", error);
                setIsUploading(false);
                return;
            }
        }

        onAdd({ topic, fileUrl, fileRefPath });
        setTopic('');
        setFile(null); // Clear file input
        setIsUploading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-gray-50 rounded-md">
            <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="자료 주제"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
            <input
                type="file"
                onChange={e => setFile(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            <button type="submit" disabled={isUploading} className="w-full py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400">
                {isUploading ? "업로드 중..." : "자료 추가"}
            </button>
        </form>
    );
};

/**
 * AddMistakeForm allows users to log mistakes, including analysis and an image of the problem.
 * It integrates with Firebase Storage for image uploads.
 * @param {function} onAdd - Callback function to add the mistake log data.
 * @param {string} userId - Current user's ID for Storage path.
 * @param {object} storage - Firebase Storage instance.
 */
const AddMistakeForm = ({ onAdd, userId, storage }) => {
    const [topic, setTopic] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [image, setImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!topic) return; // Topic is required
        setIsUploading(true);
        let imageUrl = '';
        let imageRefPath = '';

        if (image && userId && storage) {
            const imageRef = ref(storage, `mistakes/${userId}/${Date.now()}_${image.name}`);
            imageRefPath = imageRef.fullPath;
            try {
                await uploadBytes(imageRef, image);
                imageUrl = await getDownloadURL(imageRef);
            } catch (error) {
                console.error("Error uploading mistake image:", error);
                setIsUploading(false);
                return;
            }
        }

        onAdd({ topic, analysis, imageUrl, imageRefPath });
        setTopic('');
        setAnalysis('');
        setImage(null); // Clear image input
        setIsUploading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-gray-50 rounded-md">
            <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="틀린 문제 주제"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            />
            <textarea
                value={analysis}
                onChange={e => setAnalysis(e.target.value)}
                placeholder="오답 원인 분석"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                rows="3"
            />
            <input
                type="file"
                onChange={e => setImage(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
            />
            <button type="submit" disabled={isUploading} className="w-full py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 disabled:bg-gray-400">
                {isUploading ? '업로드 중...' : '오답 기록'}
            </button>
        </form>
    );
};

/**
 * AddLinkForm allows users to add new resource links.
 * @param {function} onAdd - Callback function to add the link data.
 */
const AddLinkForm = ({ onAdd }) => {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !url) return; // Title and URL are required
        onAdd({ title, url, description });
        setTitle('');
        setUrl('');
        setDescription('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-gray-50 rounded-md">
            <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="링크 제목"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            />
            <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="URL 주소"
                type="url"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            />
            <input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="간단한 설명"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            />
            <button type="submit" className="w-full py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors">링크 추가</button>
        </form>
    );
};
