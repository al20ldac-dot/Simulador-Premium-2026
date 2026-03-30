import re

with open('c:/Users/Dell/Desktop/app/src/components/quiz/QuizProvider.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State
content = content.replace(
    '  const [identifiedName, setIdentifiedName] = useState<string | null>(null);',
    '''  const [identifiedName, setIdentifiedName] = useState<string | null>(null);
  const [identifiedId, setIdentifiedId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("tic_student_name");
      const storedId = localStorage.getItem("tic_student_id");
      if (storedName && storedId) {
        setIdentifiedName(storedName);
        setIdentifiedId(storedId);
      }
    }
  }, []);'''
)

# 2. Historial query
content = re.sub(
    r'// Listener para Historial Personal\s+useEffect\(\(\) => \{\s+const searchName = identifiedName \|\| user\?.displayName;\s+if \(\!firestore \|\| \!searchName \|\| \!user\) \{\s+if \(\!searchName\) setHistoryData\(\[\]\);\s+return;\s+\}\s+setIsLoadingHistory\(true\);\s+const q = query\(\s+collection\(firestore, \'resultados\'\),\s+where\(\'displayName\', \'==\', searchName\)\s+\);',
    r'''// Listener para Historial Personal
  useEffect(() => {
    const searchId = identifiedId;
    if (!firestore || !searchId) {
      setHistoryData([]);
      return;
    }
    
    setIsLoadingHistory(true);
    const q = query(
      collection(firestore, 'resultados'),
      where('userId', '==', searchId)
    );''',
    content
)
content = content.replace('}, [firestore, user, identifiedName]);', '}, [firestore, identifiedId]);', 1)

# 3. startQuiz
content = content.replace(
'''  const startQuiz = useCallback(async (fullName: string, subjectKey: 'general' | 'is' | 'prog' = 'general', subType?: 'teorico' | 'practico') => {
    const auth = getAuth();
    const cleanName = fullName.trim();
    let currentUser = auth.currentUser;

    if (!currentUser) {
      const userCred = await signInAnonymously(auth);
      currentUser = userCred.user;
    }

    await updateProfile(currentUser, { displayName: cleanName });
    setIdentifiedName(cleanName);
    localStorage.setItem('tic_student_name', cleanName);
    localStorage.setItem('tic_active_subject', subjectKey);
    if (subType) localStorage.setItem('tic_active_subtype', subType);
    
    const now = Date.now();
    localStorage.setItem('tic_quiz_start_time', now.toString());

    if (firestore) {
      await setDoc(doc(firestore, 'users', cleanName), {
        uid: currentUser.uid,
        name: cleanName,
        lastActive: serverTimestamp(),
      }, { merge: true });
    }''',
'''  const startQuiz = useCallback(async (fullName: string, subjectKey: 'general' | 'is' | 'prog' = 'general', subType?: 'teorico' | 'practico') => {
    const auth = getAuth();
    const cleanName = fullName.trim();
    const cleanId = typeof window !== "undefined" && localStorage.getItem("tic_student_id") ? localStorage.getItem("tic_student_id")! : cleanName.toLowerCase().replace(/\s+/g, ' ');
    let currentUser = auth.currentUser;

    if (!currentUser) {
      const userCred = await signInAnonymously(auth);
      currentUser = userCred.user;
    }

    await updateProfile(currentUser, { displayName: cleanName });
    setIdentifiedName(cleanName);
    setIdentifiedId(cleanId);
    localStorage.setItem('tic_student_name', cleanName);
    localStorage.setItem('tic_student_id', cleanId);
    localStorage.setItem('tic_active_subject', subjectKey);
    if (subType) localStorage.setItem('tic_active_subtype', subType);
    
    const now = Date.now();
    localStorage.setItem('tic_quiz_start_time', now.toString());

    if (firestore) {
      await setDoc(doc(firestore, 'users', cleanId), {
        uid: currentUser.uid,
        name: cleanName,
        id: cleanId,
        lastActive: serverTimestamp(),
      }, { merge: true });
    }'''
)
content = content.replace('await saveToCloud(newState, sessionId, cleanName, currentUser.uid, subjectKey);', 'await saveToCloud(newState, sessionId, cleanName, cleanId, subjectKey);')

# 4. other functions (submitAnswer, nextQuestion, completeQuiz, finishQuizEarly)
content = content.replace('const currentName = identifiedName || user?.displayName;', 'const currentName = identifiedName;')
content = content.replace('user?.uid || \'anonymous\'', 'identifiedId || \'anonymous\'')
content = content.replace('if (!activeSessionId || !currentName) return;', 'if (!activeSessionId || !currentName || !identifiedId) return;')
content = content.replace('if (activeSessionId && currentName && state.status === \'in_progress\') {', 'if (activeSessionId && currentName && identifiedId && state.status === \'in_progress\') {')

# 5. logout
content = content.replace(
'''    localStorage.removeItem('tic_student_name');
    setIdentifiedName(null);''',
'''    localStorage.removeItem('tic_student_name');
    localStorage.removeItem('tic_student_id');
    setIdentifiedName(null);
    setIdentifiedId(null);'''
)

with open('c:/Users/Dell/Desktop/app/src/components/quiz/QuizProvider.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
