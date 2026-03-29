import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, getDocs, collection,
  query, where, serverTimestamp
} from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function generateCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, name) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    return cred.user;
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    setClassInfo(null);
    setUserProfile(null);
    localStorage.removeItem('yb_classId');
    return signOut(auth);
  }

  async function createClass(className, batch) {
    const code = generateCode();
    const classRef = doc(collection(db, 'classes'));
    await setDoc(classRef, {
      name: className,
      batch,
      secretCode: code,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp()
    });
    return { id: classRef.id, code };
  }

  async function joinClass(secretCode) {
    const q = query(collection(db, 'classes'), where('secretCode', '==', secretCode.toUpperCase()));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('Invalid class code');
    const classDoc = snap.docs[0];
    return { id: classDoc.id, ...classDoc.data() };
  }

  async function saveProfile(classId, profileData) {
    const memberRef = doc(db, 'classes', classId, 'members', currentUser.uid);
    await setDoc(memberRef, {
      ...profileData,
      userId: currentUser.uid,
      joinedAt: serverTimestamp()
    }, { merge: true });
    setUserProfile({ ...profileData, userId: currentUser.uid });
    setClassInfo(prev => prev ? { ...prev, id: classId } : { id: classId });
    localStorage.setItem('yb_classId', classId);
  }

  async function loadClassInfo(classId) {
    const classDoc = await getDoc(doc(db, 'classes', classId));
    if (classDoc.exists()) {
      setClassInfo({ id: classDoc.id, ...classDoc.data() });
    }
  }

  async function loadUserProfile(classId, userId) {
    const memberDoc = await getDoc(doc(db, 'classes', classId, 'members', userId));
    if (memberDoc.exists()) {
      setUserProfile(memberDoc.data());
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const savedClassId = localStorage.getItem('yb_classId');
        if (savedClassId) {
          try {
            await loadClassInfo(savedClassId);
            await loadUserProfile(savedClassId, user.uid);
          } catch (e) {
            console.error('Failed to load class/profile:', e);
          }
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = {
    currentUser,
    classInfo,
    userProfile,
    loading,
    signup,
    login,
    logout,
    createClass,
    joinClass,
    saveProfile,
    loadClassInfo,
    loadUserProfile,
    setClassInfo,
    setUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
