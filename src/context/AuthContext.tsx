import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { Member, UserRole } from '../types/database';

const MAJOR_ADMIN_EMAIL = 'admin@anthonybeastmode.online';
const DEFAULT_ADMIN_PASSCODE = '242424';
const MAJOR_ADMIN_UID = 'admin-owner-primary';

interface AuthContextType {
  currentUser: { uid: string; email: string | null; displayName?: string | null } | null;
  memberProfile: Member | null;
  role: UserRole;
  isAdmin: boolean;
  isLoading: boolean;
  is18PlusConfirmed: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  confirm18Plus: () => Promise<void>;
  selectedCityId: string | null;
  setSelectedCityId: (cityId: string | null) => void;
  cookieConsent: 'all' | 'essential' | null;
  setCookieConsent: (consent: 'all' | 'essential') => void;
  signIn: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, pass: string, name: string, cityId?: string, segments?: string[]) => Promise<void>;
  signOut: () => Promise<void>;
  updateMemberProfile: (updates: Partial<Member>) => Promise<void>;
  updateAdminPassword: (currentPass: string, newPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = 'bm_active_member_uid';
const ADMIN_SESSION_KEY = 'bm_admin_authenticated';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [fallbackMemberUid, setFallbackMemberUid] = useState<string | null>(
    () => localStorage.getItem(LOCAL_SESSION_KEY)
  );
  const [adminSessionActive, setAdminSessionActive] = useState<boolean>(
    () => localStorage.getItem(ADMIN_SESSION_KEY) === 'true'
  );
  const [memberProfile, setMemberProfile] = useState<Member | null>(null);
  const [role, setRole] = useState<UserRole>('member');
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [is18PlusConfirmed, setIs18PlusConfirmed] = useState(false);
  const [selectedCityId, setSelectedCityIdState] = useState<string | null>(null);
  const [cookieConsent, setCookieConsentState] = useState<'all' | 'essential' | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('bm_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'light') {
        document.documentElement.classList.add('light-theme');
      }
    }

    const savedAgeConfirm = localStorage.getItem('bm_confirmed_18_plus');
    if (savedAgeConfirm === 'true') {
      setIs18PlusConfirmed(true);
    }

    const savedCity = localStorage.getItem('bm_selected_city');
    if (savedCity) {
      setSelectedCityIdState(savedCity);
    }

    const savedConsent = localStorage.getItem('bm_cookie_consent') as 'all' | 'essential';
    if (savedConsent) {
      setCookieConsentState(savedConsent);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('bm_theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  };

  const setSelectedCityId = (cityId: string | null) => {
    setSelectedCityIdState(cityId);
    if (cityId) {
      localStorage.setItem('bm_selected_city', cityId);
    } else {
      localStorage.removeItem('bm_selected_city');
    }
  };

  const setCookieConsent = (consent: 'all' | 'essential') => {
    setCookieConsentState(consent);
    localStorage.setItem('bm_cookie_consent', consent);
  };

  const activeUid = firebaseUser?.uid || fallbackMemberUid;

  const confirm18Plus = async () => {
    setIs18PlusConfirmed(true);
    localStorage.setItem('bm_confirmed_18_plus', 'true');
    localStorage.setItem('bm_confirmed_18_plus_at', new Date().toISOString());

    if (activeUid) {
      try {
        const memberRef = doc(db, 'members', activeUid);
        await updateDoc(memberRef, {
          confirmed18Plus: true,
          confirmed18PlusAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Failed to persist age flag to profile:', e);
      }
    }
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const docRef = doc(db, 'members', user.uid);
          const snap = await getDoc(docRef);
          const isMajorAdmin =
            user.email?.toLowerCase() === MAJOR_ADMIN_EMAIL ||
            user.email?.toLowerCase() === 'adereraadenike@gmail.com';
          if (!snap.exists()) {
            const newProfile: Member = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'Fan Member',
              role: isMajorAdmin ? 'super_admin' : 'member',
              segments: ['rebel_family'],
              confirmed18Plus: localStorage.getItem('bm_confirmed_18_plus') === 'true',
              language: 'en',
              notificationPrefs: {
                shows: true,
                presales: true,
                music: true,
                offers: false,
                messages: true,
              },
              status: 'active',
              lastLoginAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            };
            await setDoc(docRef, newProfile);
          } else {
            await updateDoc(docRef, {
              lastLoginAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.warn('Member sync check:', err);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener on the active user's member document in Firestore
  useEffect(() => {
    if (!activeUid) {
      setMemberProfile(null);
      setRole(adminSessionActive ? 'super_admin' : 'member');
      return;
    }

    const docRef = doc(db, 'members', activeUid);
    const unsubMember = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Member;
          setMemberProfile(data);
          if (data.confirmed18Plus) {
            setIs18PlusConfirmed(true);
          }
          if (data.cityId && !selectedCityId) {
            setSelectedCityId(data.cityId);
          }
          const isMajorAdmin =
            data.email?.toLowerCase() === MAJOR_ADMIN_EMAIL ||
            data.email?.toLowerCase() === 'adereraadenike@gmail.com' ||
            firebaseUser?.email?.toLowerCase() === MAJOR_ADMIN_EMAIL ||
            adminSessionActive;
          if (isMajorAdmin) {
            setRole('super_admin');
          } else if (data.role) {
            setRole(data.role);
          } else {
            setRole('member');
          }
        } else if (adminSessionActive) {
          setRole('super_admin');
        }
      },
      (err) => {
        console.warn('Member profile listener warning:', err);
      }
    );

    return () => unsubMember();
  }, [activeUid, adminSessionActive, firebaseUser, selectedCityId]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signIn = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Primary Admin Credential Check (admin@anthonybeastmode.online)
    if (cleanEmail === MAJOR_ADMIN_EMAIL) {
      const adminDocRef = doc(db, 'members', MAJOR_ADMIN_UID);
      const adminSnap = await getDoc(adminDocRef);
      const storedAdminPass = adminSnap.exists()
        ? (adminSnap.data() as Member & { password?: string }).password || DEFAULT_ADMIN_PASSCODE
        : DEFAULT_ADMIN_PASSCODE;

      if (pass === storedAdminPass) {
        const adminMember: Member & { password?: string } = {
          uid: MAJOR_ADMIN_UID,
          email: MAJOR_ADMIN_EMAIL,
          displayName: 'Executive Management Admin',
          role: 'super_admin',
          segments: ['rebel_family'],
          confirmed18Plus: true,
          language: 'en',
          notificationPrefs: {
            shows: true,
            presales: true,
            music: true,
            offers: true,
            messages: true,
          },
          status: 'active',
          lastLoginAt: new Date().toISOString(),
          createdAt: adminSnap.exists()
            ? (adminSnap.data() as Member).createdAt || new Date().toISOString()
            : new Date().toISOString(),
          password: storedAdminPass,
        };
        await setDoc(adminDocRef, adminMember, { merge: true });
        localStorage.setItem(LOCAL_SESSION_KEY, MAJOR_ADMIN_UID);
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
        setFallbackMemberUid(MAJOR_ADMIN_UID);
        setAdminSessionActive(true);
        setRole('super_admin');
        return;
      } else {
        throw new Error('Invalid administrative credentials or security passcode.');
      }
    }

    // 2. Check Firestore 'members' collection for accounts registered via form or created by Admin
    const q = query(collection(db, 'members'), where('email', '==', cleanEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const foundDoc = snap.docs[0];
      const data = foundDoc.data() as Member & { password?: string };
      if (data.status === 'suspended' || data.status === 'removed') {
        throw new Error(`This account has been ${data.status} by an administrator.`);
      }
      if (!data.password || data.password === pass) {
        localStorage.setItem(LOCAL_SESSION_KEY, foundDoc.id);
        setFallbackMemberUid(foundDoc.id);
        const isStaffRole =
          data.role === 'super_admin' ||
          data.role === 'content_admin' ||
          data.role === 'tour_admin' ||
          data.role === 'fan_support' ||
          data.role === 'partnerships';
        if (isStaffRole) {
          localStorage.setItem(ADMIN_SESSION_KEY, 'true');
          setAdminSessionActive(true);
        }
        await updateDoc(doc(db, 'members', foundDoc.id), {
          lastLoginAt: new Date().toISOString(),
        });
        return;
      }
      throw new Error('Invalid password for this account.');
    }

    // 3. Fallback to Firebase Auth Email/Password
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    if (cred.user.email?.toLowerCase() === MAJOR_ADMIN_EMAIL) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      setAdminSessionActive(true);
    }
  };

  const updateAdminPassword = async (currentPass: string, newPass: string) => {
    const adminDocRef = doc(db, 'members', MAJOR_ADMIN_UID);
    const adminSnap = await getDoc(adminDocRef);
    const storedPass = adminSnap.exists()
      ? (adminSnap.data() as Member & { password?: string }).password || DEFAULT_ADMIN_PASSCODE
      : DEFAULT_ADMIN_PASSCODE;

    if (currentPass !== storedPass) {
      throw new Error('Current security passcode does not match.');
    }
    if (!newPass || newPass.trim().length < 4) {
      throw new Error('New passcode must be at least 4 characters.');
    }

    await setDoc(
      adminDocRef,
      {
        uid: MAJOR_ADMIN_UID,
        email: MAJOR_ADMIN_EMAIL,
        displayName: 'Executive Management Admin',
        role: 'super_admin',
        status: 'active',
        password: newPass.trim(),
        lastLoginAt: new Date().toISOString(),
      },
      { merge: true }
    );
  };

  const signUp = async (
    email: string,
    pass: string,
    name: string,
    cityId?: string,
    segments: string[] = ['rebel_family']
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    let uid = `member-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      uid = cred.user.uid;
    } catch {
      const existingQuery = query(collection(db, 'members'), where('email', '==', cleanEmail));
      const existingSnap = await getDocs(existingQuery);
      if (!existingSnap.empty) {
        throw new Error('An account with this email address is already registered.');
      }
      localStorage.setItem(LOCAL_SESSION_KEY, uid);
      setFallbackMemberUid(uid);
    }

    const isMajorAdmin = cleanEmail === MAJOR_ADMIN_EMAIL;
    const newMember: Member & { password?: string } = {
      uid,
      email: cleanEmail,
      displayName: name.trim(),
      role: isMajorAdmin ? 'super_admin' : 'member',
      cityId: cityId || undefined,
      segments,
      confirmed18Plus: is18PlusConfirmed,
      confirmed18PlusAt: is18PlusConfirmed ? new Date().toISOString() : undefined,
      language: 'en',
      notificationPrefs: {
        shows: true,
        presales: true,
        music: true,
        offers: false,
        messages: true,
      },
      status: 'active',
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      password: pass,
    };

    await setDoc(doc(db, 'members', uid), newMember);
    setMemberProfile(newMember);
    if (isMajorAdmin) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      setAdminSessionActive(true);
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch {
      // Ignore if not signed in via firebase auth
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setFallbackMemberUid(null);
    setAdminSessionActive(false);
    setMemberProfile(null);
    setRole('member');
  };

  const updateMemberProfile = async (updates: Partial<Member>) => {
    if (!activeUid) return;
    const ref = doc(db, 'members', activeUid);
    await updateDoc(ref, updates);
    setMemberProfile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const currentUser = firebaseUser
    ? { uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName }
    : memberProfile
    ? { uid: memberProfile.uid, email: memberProfile.email || null, displayName: memberProfile.displayName }
    : adminSessionActive
    ? { uid: MAJOR_ADMIN_UID, email: MAJOR_ADMIN_EMAIL, displayName: 'Executive Management Admin' }
    : null;

  const isAdmin =
    adminSessionActive ||
    role === 'super_admin' ||
    role === 'content_admin' ||
    role === 'tour_admin' ||
    role === 'fan_support' ||
    role === 'partnerships';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        memberProfile,
        role,
        isAdmin,
        isLoading,
        is18PlusConfirmed,
        theme,
        toggleTheme,
        confirm18Plus,
        selectedCityId,
        setSelectedCityId,
        cookieConsent,
        setCookieConsent,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        updateMemberProfile,
        updateAdminPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
