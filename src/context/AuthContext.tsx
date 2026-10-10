import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { Member, UserRole } from '../types/database';

interface AuthContextType {
  currentUser: User | null;
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
  signUp: (email: string, pass: string, name: string, cityId?: string, segments?: string[]) => Promise<void>;
  signOut: () => Promise<void>;
  updateMemberProfile: (updates: Partial<Member>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [memberProfile, setMemberProfile] = useState<Member | null>(null);
  const [role, setRole] = useState<UserRole>('member');
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [is18PlusConfirmed, setIs18PlusConfirmed] = useState(false);
  const [selectedCityId, setSelectedCityIdState] = useState<string | null>(null);
  const [cookieConsent, setCookieConsentState] = useState<'all' | 'essential' | null>(null);

  // Initialize theme, 18+ gate & preferences from localStorage
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

  const confirm18Plus = async () => {
    setIs18PlusConfirmed(true);
    localStorage.setItem('bm_confirmed_18_plus', 'true');
    localStorage.setItem('bm_confirmed_18_plus_at', new Date().toISOString());

    if (currentUser) {
      try {
        const memberRef = doc(db, 'members', currentUser.uid);
        await updateDoc(memberRef, {
          confirmed18Plus: true,
          confirmed18PlusAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Failed to persist age flag to profile:', e);
      }
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Admin check: runtime email or token
        const isAdminEmail = user.email === 'adereraadenike@gmail.com';
        if (isAdminEmail) {
          setRole('super_admin');
        } else {
          setRole('member');
        }

        try {
          const docRef = doc(db, 'members', user.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data() as Member;
            setMemberProfile(data);
            if (data.confirmed18Plus) {
              setIs18PlusConfirmed(true);
            }
            if (data.cityId && !selectedCityId) {
              setSelectedCityId(data.cityId);
            }
          }
        } catch (err) {
          console.warn('Could not fetch member doc:', err);
        }
      } else {
        setMemberProfile(null);
        setRole('member');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedCityId]);

  const signIn = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUp = async (email: string, pass: string, name: string, cityId?: string, segments: string[] = ['fan_club']) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const newMember: Member = {
      uid: cred.user.uid,
      email,
      displayName: name,
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
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'members', cred.user.uid), newMember);
      setMemberProfile(newMember);
    } catch (e) {
      console.warn('Could not write new member doc to firestore:', e);
    }
  };

  const signOut = async () => {
    await fbSignOut(auth);
    setMemberProfile(null);
    setRole('member');
  };

  const updateMemberProfile = async (updates: Partial<Member>) => {
    if (!currentUser) return;
    const ref = doc(db, 'members', currentUser.uid);
    await updateDoc(ref, updates);
    setMemberProfile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const isAdmin = role === 'super_admin' || role === 'content_admin' || role === 'tour_admin' || role === 'fan_support';

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
        signUp,
        signOut,
        updateMemberProfile,
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
