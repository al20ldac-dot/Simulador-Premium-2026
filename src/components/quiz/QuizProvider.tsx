"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { QuizState, UserResponse, Question } from '@/types/quiz';
import { useRouter, usePathname } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { doc, setDoc, getDoc, collection, serverTimestamp, query, limit, onSnapshot, where, deleteDoc, getDocs, orderBy } from 'firebase/firestore';
import { getAuth, updateProfile, signInAnonymously } from 'firebase/auth';
import officialQuestions from '@/data/official-questions.json';
import subjectIS from '@/data/subject-is.json';
import subjectProg from '@/data/subject-prog.json';

interface QuizContextType {
  state: QuizState;
  history: any[];
  ranking: any[];
  startQuiz: (fullName: string, subjectKey?: 'general' | 'is' | 'prog', subType?: 'teorico' | 'practico') => Promise<void>;
  submitAnswer: (answer: 'A' | 'B' | 'C' | 'D') => void;
  nextQuestion: () => void;
  restartQuiz: () => void;
  finishQuizEarly: () => Promise<void>;
  completeQuiz: () => Promise<void>;
  cancelQuizByOffline: () => void;
  deleteResult: (id: string) => Promise<void>;
  logout: () => Promise<void>;
  setIdentity: (name: string, id: string) => void;

  isLoadingHistory: boolean;
  activeSessionId: string | null;
  identifiedName: string | null;
  isOnline: boolean;
  quizWasCancelledByOffline: boolean;
  lastFeedback: { 
    isCorrect: boolean; 
    showCorrect: boolean; 
    selectedKey?: string;
    isFinished: boolean;
  } | null;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { firestore, user } = useFirebase();
  const isOnline = useOnlineStatus();

  // ─── MONITOR GLOBAL DE CONEXIÓN (TODO EL SISTEMA) ───────────────────────
  useEffect(() => {
    // Si se pierde el internet en cualquier parte del sistema, mandamos a /offline
    // exceptuando si ya estamos en esa página para evitar bucles.
    if (!isOnline && pathname !== '/offline') {
      router.push('/offline');
    }
  }, [isOnline, pathname, router]);
  // ─────────────────────────────────────────────────────────────────────────

  // ─── PROTECCIÓN CONTRA PÉRDIDA DE INTERNET ───────────────────────────────
  // connectionLostRef: una vez en true, NUNCA vuelve a false durante esa sesión.
  // Esto garantiza que aunque vuelva internet, el intento sigue siendo inválido.
  const connectionLostRef = useRef<boolean>(false);
  const [quizWasCancelledByOffline, setQuizWasCancelledByOffline] = useState(false);
  // ─────────────────────────────────────────────────────────────────────────

  const [state, setState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    responses: [],
    status: 'idle',
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const [lastFeedback, setLastFeedback] = useState<QuizContextType['lastFeedback']>(null);
  const [ranking, setRanking] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [identifiedName, setIdentifiedName] = useState<string | null>(null);
  const [identifiedId, setIdentifiedId] = useState<string | null>(null);

  // Cargar identificadores globales locales al iniciar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('tic_student_name');
      const storedId = localStorage.getItem('tic_student_id');
      
      if (storedName && storedId) {
        setIdentifiedName(storedName);
        setIdentifiedId(storedId);
      }
    }
  }, []);

  const toTitleCase = (str: string) => {
    return str.toLowerCase().replace(/\s+/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const setIdentity = useCallback((name: string, id: string) => {
    setIdentifiedName(toTitleCase(name));
    setIdentifiedId(id);
  }, []);

  // ─── WATCHER: si se pierde internet durante el examen → intento inválido ──
  // Usamos useRef para acceder al estado actual sin regenerar el efecto.
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  useEffect(() => {
    // Solo actuar si hay un examen en progreso
    if (!isOnline && stateRef.current.status === 'in_progress') {
      connectionLostRef.current = true; // BANDERA PERMANENTE — nunca se revierte
    }
  }, [isOnline]);
  // ─────────────────────────────────────────────────────────────────────────

    // Listener en tiempo real para el Ranking (Solo General)
    useEffect(() => {
      if (!firestore || !user) return; // REGLA DE ORO: Solo si hay un usuario autenticado
      
      const q = query(
        collection(firestore, 'ranking'), 
        where('subjectKey', '==', 'general')
      );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filtro para solo considerar puntajes de 70 o más
      const filtered = data.filter((item: any) => (item.percentage || 0) >= 70);
      const sorted = filtered.sort((a: any, b: any) => {
        const percA = a.percentage || 0;
        const percB = b.percentage || 0;
        if (percB !== percA) return percB - percA;
        
        const durA = a.duration || 999999;
        const durB = b.duration || 999999;
        return durA - durB;
      }).slice(0, 50);
      
      setRanking(sorted);
    }, (err) => {
      console.warn("Fallo de sincronización ranking:", err.message);
    });
    return () => unsubscribe();
  }, [firestore, user, identifiedId]);

  // Listener para Historial Personal (Vínculo Directo por Nombre)
  useEffect(() => {
    if (!firestore || !user || !identifiedId) {
      setHistoryData([]);
      return;
    }
    
    setIsLoadingHistory(true);
    
    const q = query(
      collection(firestore, 'resultados'),
      where('userId', '==', identifiedId),
      where('status', '==', 'completed')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sorted = data.sort((a: any, b: any) => {
        const timeA = a.lastUpdate?.toMillis?.() || 0;
        const timeB = b.lastUpdate?.toMillis?.() || 0;
        return timeB - timeA;
      });
      setHistoryData(sorted);
      setIsLoadingHistory(false);
    }, (err) => {
      console.warn("Fallo de sincronización historial:", err);
      setIsLoadingHistory(false);
    });
    
    return () => unsubscribe();
  }, [firestore, user, identifiedId]);

  const updateRankingEntry = useCallback(async (name: string, globalId: string, perc: number, dur: number, aciertos: number) => {
    if (!firestore) return;
    
    try {
      // El usuario pidió explícitamente no gastar recursos escribiendo si no llega al 70
      if (perc < 70) return;

      const rankingRef = doc(firestore, 'ranking', globalId);
      const rankingSnap = await getDoc(rankingRef);

      let shouldUpdate = false;

      if (!rankingSnap.exists()) {
        shouldUpdate = true;
      } else {
        const existingData = rankingSnap.data();
        const existingPerc = existingData.percentage || 0;
        const existingDur = existingData.duration || 999999;

        if (perc > existingPerc) {
          shouldUpdate = true;
        } else if (perc === existingPerc && dur < existingDur) {
          shouldUpdate = true;
        }
      }

      if (shouldUpdate) {
        await setDoc(rankingRef, {
          userId: globalId,
          displayName: toTitleCase(name),
          percentage: perc,
          correctAnswersCount: aciertos,
          duration: dur,
          lastUpdate: serverTimestamp(),
          subjectKey: 'general' 
        }, { merge: true });
      }
    } catch (error) {
      console.warn("Fallo crítico en actualización de ranking:", error);
    }
  }, [firestore]);

  const saveToCloud = useCallback(async (currentState: QuizState, sessionId: string, name: string, globalId: string, subjectKey: string) => {
    // ── BLOQUEO TOTAL: si la conexión se perdió alguna vez, NUNCA escribir ──
    if (connectionLostRef.current) {
      console.warn('[Quiz] saveToCloud bloqueado: intento inválido por pérdida de conexión.');
      return;
    }
    if (!firestore || !name || !sessionId || !globalId) return;

    const uniqueResponsesMap = new Map();
    currentState.responses.forEach(r => uniqueResponsesMap.set(r.questionId, r));
    const uniqueResponses = Array.from(uniqueResponsesMap.values());
    
    const correctCount = uniqueResponses.filter(r => r.isCorrect).length;
    const totalQuestions = currentState.questions.length || 1; // Evitar división por cero
    const percentage = Math.min(Math.round((correctCount / totalQuestions) * 100), 100);
    
    const now = Date.now();
    const storedStart = parseInt(localStorage.getItem('tic_quiz_start_time') || now.toString());
    const duration = Math.floor((now - storedStart) / 1000);

    const resultData = {
      id: sessionId,
      userId: globalId,
      device_id: localStorage.getItem('tic_universal_id'), // Huella digital persistente
      displayName: toTitleCase(name),
      score: correctCount,
      percentage,
      correctAnswersCount: correctCount,
      totalAnswered: uniqueResponses.length,
      totalQuestions: totalQuestions,
      status: currentState.status,
      subjectKey: subjectKey,
      duration: duration > 0 ? duration : 0,
      lastUpdate: serverTimestamp()
    };

    try {
      await setDoc(doc(firestore, 'resultados', sessionId), resultData, { merge: true });
      
      // La regla de porcentaje >= 70 ya está validada dentro de updateRankingEntry para no gastar recursos
      if (subjectKey === 'general' && currentState.status === 'completed') {
        await updateRankingEntry(name, globalId, percentage, resultData.duration, correctCount);
      }
    } catch (e) {
      console.warn("Error al guardar en la nube:", e);
    }
  }, [firestore, updateRankingEntry]);

  const startQuiz = useCallback(async (fullName: string, subjectKey: 'general' | 'is' | 'prog' = 'general', subType?: 'teorico' | 'practico') => {
    // 1. REINICIO INMEDIATO DE BANDERAS (CRÍTICO para evitar bloqueos)
    connectionLostRef.current = false;
    setQuizWasCancelledByOffline(false);
    
    const cleanName = toTitleCase(fullName);
    const normalizedNameForId = cleanName.toLowerCase().trim().replace(/\s+/g, ' ');
    const globalId = normalizedNameForId;

    // 2. ACTUALIZACIÓN DE IDENTIDAD INMEDIATA (Local)
    setIdentifiedName(cleanName);
    setIdentifiedId(globalId);
    
    localStorage.setItem('tic_student_name', cleanName);
    localStorage.setItem('tic_student_id', globalId);
    localStorage.setItem('tic_active_subject', subjectKey);
    if (subType) localStorage.setItem('tic_active_subtype', subType);
    
    const now = Date.now();
    localStorage.setItem('tic_quiz_start_time', now.toString());

    // 3. PREPARACIÓN DEL POOL (Operación síncrona rápida)
    let pool: Question[] = [];
    if (subjectKey === 'general') pool = [...officialQuestions] as Question[];
    if (subjectKey === 'is') pool = [...subjectIS] as Question[];
    if (subjectKey === 'prog') pool = [...subjectProg] as Question[];

    if (subType) {
      pool = pool.filter(q => q.subType === subType);
    }

    if (!pool || pool.length === 0) {
      console.warn("Error: El banco de preguntas para esta materia está vacío.");
      return; 
    }

    // Mezclado (Fisher-Yates)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    
    let finalPool = pool.slice(0, 100).map((q: any) => {
      const rawOptions = (Object.entries(q.opciones) as [('A' | 'B' | 'C' | 'D'), string][])
        .filter(([_, value]) => value && typeof value === 'string' && value.trim() !== "" && value !== "N/A");
      let shuffledOptions = [...rawOptions];
      if (rawOptions.length === 4) {
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }
      }
      return { ...q, displayOptions: shuffledOptions };
    });

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setActiveSessionId(sessionId);

    const newState: QuizState = {
      questions: finalPool,
      currentQuestionIndex: 0,
      responses: [],
      status: 'in_progress',
    };

    // 4. TRANSICIÓN DE UI INMEDIATA (Sin esperar a Firebase)
    setState(newState);
    setLastFeedback(null);
    router.push('/simulador');

    // 5. OPERACIONES DE FONDO (Auth y Registro en Firestore sin bloquear al usuario)
    (async () => {
      try {
        const auth = getAuth();
        let currentUser = auth.currentUser;
        if (!currentUser) {
          const userCred = await signInAnonymously(auth);
          currentUser = userCred.user;
        }
        await updateProfile(currentUser, { displayName: cleanName });
        
        if (firestore) {
          await setDoc(doc(firestore, 'users', globalId), {
            uid: currentUser.uid,
            name: cleanName,
            id: globalId,
            lastActive: serverTimestamp(),
          }, { merge: true });
        }
      } catch (error) {
        console.warn("Registro secundario en segundo plano falló, pero la simulación continúa:", error);
      }
    })();
  }, [router, firestore]);

  const submitAnswer = useCallback((answer: 'A' | 'B' | 'C' | 'D') => {
    // ── Bloquear si el intento ya fue invalidado ──
    if (connectionLostRef.current) return;

    const currentName = identifiedName;
    const globalId = identifiedId;
    if (!activeSessionId || !currentName || !globalId) return;
    
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) return;

    if (state.responses.some(r => r.questionId === currentQuestion.id)) return;
    if (lastFeedback && lastFeedback.isFinished) return;

    const isCorrect = answer === currentQuestion.correcta;

    const feedback = { isCorrect, showCorrect: true, selectedKey: answer, isFinished: true };
    setLastFeedback(feedback);
    
    const updatedResponses: UserResponse[] = [...state.responses, {
      questionId: currentQuestion.id,
      attemptsUsed: 1,
      isCorrect,
      selectedOption: answer,
    }];
    
    // ── Solo actualiza estado local, NO escribe a Firebase ──
    const newState = { ...state, responses: updatedResponses };
    setState(newState);
  }, [state, lastFeedback, activeSessionId, identifiedName, identifiedId]);

  const nextQuestion = useCallback(() => {
    // ── Bloquear si el intento ya fue invalidado ──
    if (connectionLostRef.current) return;

    const currentName = identifiedName;
    const globalId = identifiedId;
    const subjectKey = localStorage.getItem('tic_active_subject') || 'general';
    if (!activeSessionId || !currentName || !globalId) return;
    
    setLastFeedback(null);
    
    if (state.currentQuestionIndex + 1 < state.questions.length) {
      setState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }));
    } else {
      // Última pregunta: guardar en Firebase SOLO si nunca se perdió la conexión
      const completedState = { ...state, status: 'completed' as const };
      setState(completedState);
      saveToCloud(completedState, activeSessionId, currentName, globalId, subjectKey);
      localStorage.removeItem('tic_quiz_start_time');
      router.push('/resultados');
    }
  }, [state, router, saveToCloud, activeSessionId, identifiedName, identifiedId]);

  const completeQuiz = useCallback(async () => {
    const currentName = identifiedName;
    const globalId = identifiedId;
    const subjectKey = localStorage.getItem('tic_active_subject') || 'general';
    if (activeSessionId && currentName && globalId && state.status === 'in_progress') {
      const completedState = { ...state, status: 'completed' as const };
      setState(completedState);
      // saveToCloud ya tiene el bloqueo interno si connectionLostRef === true
      await saveToCloud(completedState, activeSessionId, currentName, globalId, subjectKey);
      localStorage.removeItem('tic_quiz_start_time');
      router.push('/resultados');
    }
  }, [state, saveToCloud, activeSessionId, router, identifiedName, identifiedId]);

  // ─── CANCELACIÓN POR PÉRDIDA DE INTERNET ─────────────────────────────────
  const cancelQuizByOffline = useCallback(() => {
    connectionLostRef.current = true; // Marcar permanentemente como inválido
    setQuizWasCancelledByOffline(true);
    // Limpiar todo el estado local — NO tocar Firebase
    setState({ questions: [], currentQuestionIndex: 0, responses: [], status: 'idle' });
    setActiveSessionId(null);
    setLastFeedback(null);
    localStorage.removeItem('tic_quiz_start_time');
    // Redirigir a la página exclusiva de error offline animada
    router.push('/offline');
  }, [router]);
  // ─────────────────────────────────────────────────────────────────────────

  const finishQuizEarly = useCallback(async () => {
    const currentName = identifiedName;
    const globalId = identifiedId;
    const subjectKey = localStorage.getItem('tic_active_subject') || 'general';
    if (activeSessionId && currentName && globalId && state.status === 'in_progress') {
      const finalState = { ...state, status: 'completed' as const };
      // Solo guarda si nunca se perdió la conexión (el bloqueo está dentro de saveToCloud)
      await saveToCloud(finalState, activeSessionId, currentName, globalId, subjectKey);
    }
    setState({ questions: [], currentQuestionIndex: 0, responses: [], status: 'idle' });
    setActiveSessionId(null);
    localStorage.removeItem('tic_quiz_start_time');
    router.push('/');
  }, [state, saveToCloud, activeSessionId, router, identifiedName, identifiedId]);

  const deleteResult = useCallback(async (id: string) => {
    if (!firestore) return;
    try {
      const docRef = doc(firestore, 'resultados', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const dataResult = snap.data();
        const { displayName, subjectKey, userId } = dataResult;
        await deleteDoc(docRef);
        
        if (userId && subjectKey === 'general') {
          // Buscamos todos los resultados generales del usuario universal
          const q = query(
            collection(firestore, 'resultados'),
            where('userId', '==', userId),
            where('subjectKey', '==', 'general'),
            where('status', '==', 'completed')
          );
          const allUserSnap = await getDocs(q);
          
          if (!allUserSnap.empty) {
            const results = allUserSnap.docs.map(d => d.data());
            // Encontramos el mejor en memoria y garantizamos que sea al menos 70 para valer la pena
            const validResults = results.filter((r: any) => (r.percentage || 0) >= 70);
            
            if (validResults.length > 0) {
              validResults.sort((a: any, b: any) => {
                if (b.percentage !== a.percentage) return b.percentage - a.percentage;
                return a.duration - b.duration;
              });
              const best = validResults[0];
              
              await setDoc(doc(firestore, 'ranking', userId), {
                userId: best.userId,
                displayName: best.displayName,
                percentage: best.percentage,
                correctAnswersCount: best.correctAnswersCount,
                duration: best.duration,
                lastUpdate: best.lastUpdate,
                subjectKey: 'general'
              }, { merge: true });
            } else {
               // Si ningún intento restante llega al 70%, se elimina del ranking si permanecía ahí
               await deleteDoc(doc(firestore, 'ranking', userId));
            }
          } else {
            // Si ya no tiene intentos, se borra su récord general
            await deleteDoc(doc(firestore, 'ranking', userId));
          }
        }
      }
    } catch (e) {
      console.warn("Error al eliminar resultado:", e);
    }
  }, [firestore]);

  const restartQuiz = useCallback(() => {
    // Resetear bandera de conexión para el próximo intento
    connectionLostRef.current = false;
    setQuizWasCancelledByOffline(false);
    setState({ questions: [], currentQuestionIndex: 0, responses: [], status: 'idle' });
    setActiveSessionId(null);
    localStorage.removeItem('tic_quiz_start_time');
    router.push('/');
  }, [router]);

  const logout = useCallback(async () => {
    const auth = getAuth();
    if (auth.currentUser) {
      await auth.signOut();
    }
    localStorage.removeItem('tic_student_name');
    localStorage.removeItem('tic_student_id');
    setIdentifiedName(null);
    setIdentifiedId(null);
    setHistoryData([]);
    router.push('/');
  }, [router]);

  const contextValue = React.useMemo(() => ({
    state, history: historyData, ranking, startQuiz, submitAnswer, nextQuestion, restartQuiz, finishQuizEarly, completeQuiz, cancelQuizByOffline, deleteResult, logout, setIdentity,
    lastFeedback, isLoadingHistory, activeSessionId, identifiedName, isOnline, quizWasCancelledByOffline
  }), [state, historyData, ranking, startQuiz, submitAnswer, nextQuestion, restartQuiz, finishQuizEarly, completeQuiz, cancelQuizByOffline, deleteResult, logout, setIdentity, lastFeedback, isLoadingHistory, activeSessionId, identifiedName, isOnline, quizWasCancelledByOffline]);

  return (
    <QuizContext.Provider value={contextValue}>
      {children}
    </QuizContext.Provider>
  );
}

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) throw new Error('useQuiz must be used within QuizProvider');
  return context;
};
