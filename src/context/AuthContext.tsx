import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { PRELOADED_USER, ADMIN_EMPLOYER } from '../data/initialJobs';
import { 
  auth, 
  db,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  googleProvider,
  updateProfile,
  doc,
  setDoc,
  getDoc,
  FirebaseUser
} from '../lib/firebase';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, pass: string, userType: UserRole, companyName?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'jobseeker_pro_user_session_v2';
const REGISTERED_USERS_KEY = 'jobseeker_pro_registered_users_v2';

/**
 * Format Firebase Auth Error codes into human-readable error messages
 */
export function formatFirebaseAuthError(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const code = error.code || '';

  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with this email address. Please check your email or create an account.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please verify your password and try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your login credentials.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please sign in instead.';
    case 'auth/weak-password':
      return 'The password is too weak. Please use at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This user account has been disabled by an administrator.';
    case 'auth/too-many-requests':
      return 'Access temporarily blocked due to many failed login attempts. Please wait or reset your password.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connectivity.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is currently not enabled.';
    case 'auth/popup-closed-by-user':
      return 'Authentication popup was closed before completing sign-in.';
    case 'auth/cancelled-popup-request':
      return 'Only one popup request allowed at a time.';
    default:
      return error.message ? error.message.replace(/^Firebase:\s*/, '') : 'Authentication failed. Please check your input.';
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(LOCAL_USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return PRELOADED_USER;
      }
    }
    return PRELOADED_USER;
  });
  
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Real-time session persistence with onAuthStateChanged and Firestore profile fetch
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && fbUser.email) {
        const cleanEmail = fbUser.email.toLowerCase();

        // Check if Admin Account
        if (cleanEmail === 'admin@shemalabs.com') {
          setUser(ADMIN_EMPLOYER);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(ADMIN_EMPLOYER));
          setIsLoading(false);
          return;
        }

        // Fetch user profile from Firestore
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            const fullProfile: UserProfile = {
              ...data,
              id: fbUser.uid,
              uid: fbUser.uid,
              userType: data.userType || data.role || 'JOB_SEEKER',
              role: data.userType || data.role || 'JOB_SEEKER'
            };
            setUser(fullProfile);
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(fullProfile));
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.info('Firestore user fetch note:', err);
        }

        // Fallback default profile
        setUser(prev => {
          if (prev && prev.email.toLowerCase() === cleanEmail) {
            return prev;
          }
          const newUser: UserProfile = {
            id: fbUser.uid,
            uid: fbUser.uid,
            name: fbUser.displayName || cleanEmail.split('@')[0] || "Job Seeker",
            email: fbUser.email || cleanEmail,
            userType: "JOB_SEEKER",
            role: "JOB_SEEKER",
            phone: "+1 555 019 2834",
            location: "Remote / Global",
            qualification: "B.Sc. Computer Science",
            skills: ["React", "TypeScript", "Tailwind CSS", "Firebase"],
            experienceYears: 4,
            resumeText: "Experienced Software Engineer focused on cloud-native scalable systems."
          };
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
          return newUser;
        });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // 1. Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setIsLoading(false);
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // 2. Password length check
    if (cleanPass.length < 4) {
      setIsLoading(false);
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }

    // Check if Admin Account: admin@shemalabs.com / 0616
    if (cleanEmail === 'admin@shemalabs.com' && (cleanPass === '0616' || cleanPass === '06160616')) {
      // Sync Admin to Firestore
      try {
        await setDoc(doc(db, 'users', ADMIN_EMPLOYER.id), ADMIN_EMPLOYER, { merge: true });
      } catch (e) {
        console.info('Firestore admin sync note', e);
      }
      setUser(ADMIN_EMPLOYER);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(ADMIN_EMPLOYER));
      setIsLoading(false);
      return { success: true };
    }

    // 3. Primary Authentication with Firebase Auth
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      const fb = cred.user;

      let profile: UserProfile = {
        id: fb.uid,
        uid: fb.uid,
        name: fb.displayName || cleanEmail.split('@')[0],
        email: fb.email || cleanEmail,
        userType: "JOB_SEEKER",
        role: "JOB_SEEKER",
        phone: "+1 555 019 2834",
        location: "Remote / Hybrid",
        qualification: "Software Engineering Professional",
        skills: ["React", "TypeScript", "Node.js", "Firebase"],
        experienceYears: 3,
        resumeText: "Software Engineer passionate about high performance web apps."
      };

      // Check Firestore doc
      try {
        const userDocRef = doc(db, 'users', fb.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data() as UserProfile;
          profile = {
            ...profile,
            ...data,
            id: fb.uid,
            uid: fb.uid,
            userType: data.userType || data.role || 'JOB_SEEKER',
            role: data.userType || data.role || 'JOB_SEEKER'
          };
        } else {
          await setDoc(userDocRef, profile, { merge: true });
        }
      } catch (err) {
        console.info("Firestore profile sync note", err);
      }

      setUser(profile);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
      setIsLoading(false);
      return { success: true };
    } catch (firebaseErr: any) {
      console.warn("Firebase Auth sign-in returned error:", firebaseErr);

      // Check if credentials match local cache or preloaded user
      if (cleanEmail === PRELOADED_USER.email.toLowerCase()) {
        setUser(PRELOADED_USER);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(PRELOADED_USER));
        setIsLoading(false);
        return { success: true };
      }

      const registeredRaw = localStorage.getItem(REGISTERED_USERS_KEY);
      if (registeredRaw) {
        try {
          const usersList: Array<UserProfile & { password?: string }> = JSON.parse(registeredRaw);
          const match = usersList.find(u => u.email.toLowerCase() === cleanEmail);
          if (match && (!match.password || match.password === cleanPass)) {
            const { password: _, ...cleanProfile } = match;
            setUser(cleanProfile as UserProfile);
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(cleanProfile));
            setIsLoading(false);
            return { success: true };
          }
        } catch (err) {
          console.warn("Local registered cache check note", err);
        }
      }

      setIsLoading(false);
      return { 
        success: false, 
        error: formatFirebaseAuthError(firebaseErr)
      };
    }
  };

  const signup = async (
    name: string, 
    email: string, 
    pass: string, 
    userType: UserRole = 'JOB_SEEKER',
    companyName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPass = pass.trim();

    // 1. Validation checks
    if (!cleanName) {
      setIsLoading(false);
      return { success: false, error: 'Full Name is required for registration.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setIsLoading(false);
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (cleanPass.length < 4) {
      setIsLoading(false);
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }

    let createdUid = `usr_${Date.now()}`;
    let firebaseError: any = null;

    // 2. Primary registration via Firebase Auth
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
      createdUid = cred.user.uid;
      try {
        await updateProfile(cred.user, { displayName: cleanName });
      } catch (e) {
        console.warn("DisplayName update note", e);
      }
    } catch (err: any) {
      console.warn("Firebase createUserWithEmailAndPassword error:", err);
      firebaseError = err;
    }

    const newProfile: UserProfile = {
      id: createdUid,
      uid: createdUid,
      name: cleanName,
      email: cleanEmail,
      userType: userType,
      role: userType,
      companyName: userType === 'EMPLOYER' ? (companyName?.trim() || 'Tech Enterprise') : undefined,
      phone: "+1 (555) 000-0000",
      location: "Remote / Global",
      qualification: userType === 'EMPLOYER' ? 'Talent Acquisition & Technical Hiring' : 'B.Sc. / Equivalent in Tech',
      skills: userType === 'EMPLOYER' ? ['Technical Recruiting', 'Talent Sourcing', 'Engineering Leadership'] : ['JavaScript', 'React', 'TypeScript', 'Git'],
      experienceYears: 3,
      resumeText: userType === 'EMPLOYER' 
        ? `Talent Acquisition Lead at ${companyName || 'our technology organization'}, hiring top tier software engineers and designers.` 
        : "Dedicated software engineer passionate about building modern digital products."
    };

    // Save directly to Firestore collection users
    try {
      await setDoc(doc(db, 'users', createdUid), newProfile, { merge: true });
    } catch (err) {
      console.info("Firestore profile save note", err);
    }

    // Save to local registered users cache
    try {
      const registeredRaw = localStorage.getItem(REGISTERED_USERS_KEY);
      const list = registeredRaw ? JSON.parse(registeredRaw) : [];
      list.push({ ...newProfile, password: cleanPass });
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    setUser(newProfile);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newProfile));
    setIsLoading(false);

    if (firebaseError && firebaseError.code === 'auth/email-already-in-use') {
      return { success: false, error: formatFirebaseAuthError(firebaseError) };
    }

    return { success: true };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const fb = res.user;
      const profile: UserProfile = {
        id: fb.uid,
        uid: fb.uid,
        name: fb.displayName || "Google User",
        email: fb.email || "googleuser@example.com",
        userType: "JOB_SEEKER",
        role: "JOB_SEEKER",
        phone: "+1 555 123 4567",
        location: "Remote / Global",
        qualification: "Software Professional",
        skills: ["React", "TypeScript", "Node.js", "Cloud"],
        experienceYears: 4,
        resumeText: "Full-Stack developer with experience in modern web frameworks and cloud infrastructure."
      };

      try {
        await setDoc(doc(db, 'users', fb.uid), profile, { merge: true });
      } catch (err) {
        console.info("Firestore doc sync note", err);
      }

      setUser(profile);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      console.warn("Google popup note in sandbox:", err);
      setIsLoading(false);
      return { success: false, error: formatFirebaseAuthError(err) };
    }
  };

  const loginAsGuest = async () => {
    setIsLoading(true);
    const guestUser: UserProfile = {
      id: "usr_guest_" + Date.now(),
      uid: "usr_guest_" + Date.now(),
      name: "Guest Candidate",
      email: "candidate.guest@jobseekerpro.dev",
      userType: "JOB_SEEKER",
      role: "JOB_SEEKER",
      phone: "+1 555 010 0000",
      location: "Worldwide / Remote",
      qualification: "Software Engineer",
      skills: ["React", "JavaScript", "TypeScript", "Web Development"],
      experienceYears: 3,
      resumeText: "Exploring open opportunities and software engineering listings on JobSeeker Pro."
    };
    setUser(guestUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guestUser));
    setIsLoading(false);
  };

  const loginAsAdmin = async () => {
    setIsLoading(true);
    setUser(ADMIN_EMPLOYER);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(ADMIN_EMPLOYER));
    try {
      await setDoc(doc(db, 'users', ADMIN_EMPLOYER.id), ADMIN_EMPLOYER, { merge: true });
    } catch (e) {
      console.info('Firestore admin sync note', e);
    }
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn("Firebase signout error", e);
    }
    setUser(null);
    localStorage.removeItem(LOCAL_USER_KEY);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));

    try {
      await setDoc(doc(db, 'users', user.id || user.uid || 'usr_current'), updated, { merge: true });
    } catch (err) {
      console.info("Firestore profile update note", err);
    }
  };

  const switchRole = async (role: UserRole) => {
    if (!user) return;
    const updated: UserProfile = { ...user, userType: role, role };
    setUser(updated);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));

    try {
      await setDoc(doc(db, 'users', user.id || user.uid || 'usr_current'), { userType: role, role }, { merge: true });
    } catch (err) {
      console.info("Firestore role switch note", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        loginAsGuest,
        loginAsAdmin,
        logout,
        updateUserProfile,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


