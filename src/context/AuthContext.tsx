import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase/config';
import { 
  UserProfile, 
  Institution, 
  Mess, 
  Subscription, 
  SubscriptionPlan,
  AdminRecord 
} from '../types';
import { seedInitialDatabaseIfEmpty } from '../firebase/seed';

export const SUPER_ADMIN_EMAIL = 'salvisarthak2007@gmail.com';

interface AdminOnboardingData {
  plan: SubscriptionPlan;
  collegeName: string;
  location: string;
  officialEmail: string;
  contactPhone?: string;
  messName: string;
  locationBlock?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isStudent: boolean;
  loading: boolean;
  authError: string | null;
  needsProfileSetup: boolean;
  clearError: () => void;
  loginWithEmail: (email: string, pass: string) => Promise<UserProfile | null>;
  loginAdminWithEmail: (email: string, pass: string) => Promise<{ profile: UserProfile | null; needsOnboarding: boolean }>;
  registerAdminWithEmail: (email: string, pass: string, name: string) => Promise<User>;
  completeAdminOnboarding: (data: AdminOnboardingData) => Promise<UserProfile>;
  registerStudentWithEmail: (data: {
    name: string;
    email: string;
    password: string;
    collegeId: string;
    collegeName: string;
    messId: string;
    messName: string;
  }) => Promise<UserProfile>;
  signInWithGoogle: (rolePreference?: 'student' | 'admin') => Promise<{ profile: UserProfile | null; needsOnboarding: boolean }>;
  completeStudentProfile: (data: {
    name: string;
    collegeId: string;
    collegeName: string;
    messId: string;
    messName: string;
  }) => Promise<UserProfile>;
  createNewMess: (collegeId: string, messData: {
    name: string;
    locationBlock?: string;
    description?: string;
    breakfastTime?: string;
    lunchTime?: string;
    snacksTime?: string;
    dinnerTime?: string;
  }) => Promise<Mess>;
  updateSubscriptionPlan: (institutionId: string, newPlan: SubscriptionPlan) => Promise<void>;
  fetchInstitutions: () => Promise<Institution[]>;
  fetchMessesForCollege: (collegeId: string) => Promise<Mess[]>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateUserMess: (messId: string, messName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [needsProfileSetup, setNeedsProfileSetup] = useState<boolean>(false);
  const isAuthenticatingRef = useRef<boolean>(false);

  const clearError = () => setAuthError(null);

  // Check for any redirect auth completion on mount
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          console.log('Redirect authentication completed for:', result.user.email);
        }
      })
      .catch((err) => {
        console.warn('Redirect sign-in notice:', err?.code, err?.message);
        if (err?.code) {
          setAuthError(mapAuthErrorMessage(err.code));
        }
      });
  }, []);

  // Sync auth state listener with trusted backend admin verification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setCurrentUser(user);
      if (user) {
        try {
          const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

          // Fetch user profile from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data() as UserProfile;
            
            // If superadmin, ensure role is admin
            if (isSuperAdmin && data.role !== 'admin') {
              const updatedData: UserProfile = { ...data, role: 'admin' };
              await setDoc(userDocRef, updatedData, { merge: true });
              await setDoc(doc(db, 'admins', user.uid), {
                uid: user.uid,
                email: user.email,
                role: 'admin',
                collegeId: data.collegeId || 'inst-iitb',
                collegeName: data.collegeName || 'IIT Bombay',
                plan: 'pro',
                createdAt: new Date().toISOString()
              }, { merge: true });
              setUserProfile(updatedData);
            } else {
              setUserProfile(data);
            }
            setNeedsProfileSetup(false);
          } else {
            // Profile does not exist in users/{uid}
            if (isSuperAdmin) {
              const adminProfile: UserProfile = {
                uid: user.uid,
                name: user.displayName || 'Super Admin',
                email: user.email || SUPER_ADMIN_EMAIL,
                role: 'admin',
                collegeId: 'inst-iitb',
                collegeName: 'IIT Bombay',
                messId: 'mess-iitb-h12',
                messName: 'Hostel 12 - North Indian Dining',
                createdAt: new Date().toISOString()
              };
              await setDoc(userDocRef, adminProfile, { merge: true });
              await setDoc(doc(db, 'admins', user.uid), {
                uid: user.uid,
                email: user.email,
                role: 'admin',
                collegeId: 'inst-iitb',
                collegeName: 'IIT Bombay',
                plan: 'pro',
                createdAt: new Date().toISOString()
              }, { merge: true });
              setUserProfile(adminProfile);
              setNeedsProfileSetup(false);
            } else {
              // Check if an admin record exists in admins/{uid}
              const adminDocRef = doc(db, 'admins', user.uid);
              const adminDocSnap = await getDoc(adminDocRef);

              if (adminDocSnap.exists()) {
                const aData = adminDocSnap.data();
                const adminProfile: UserProfile = {
                  uid: user.uid,
                  name: user.displayName || user.email?.split('@')[0] || 'Administrator',
                  email: user.email || '',
                  role: 'admin',
                  collegeId: aData.collegeId || '',
                  collegeName: aData.collegeName || 'Campus Institution',
                  messId: aData.messId || '',
                  messName: aData.messName || '',
                  createdAt: aData.createdAt || new Date().toISOString()
                };
                await setDoc(userDocRef, adminProfile, { merge: true });
                setUserProfile(adminProfile);
                setNeedsProfileSetup(false);
              } else {
                // Check if they own an institution in institutions collection
                const instQ = query(collection(db, 'institutions'), where('ownerUid', '==', user.uid));
                const instSnap = await getDocs(instQ);
                if (!instSnap.empty) {
                  const instData = instSnap.docs[0].data();
                  const adminProfile: UserProfile = {
                    uid: user.uid,
                    name: user.displayName || user.email?.split('@')[0] || 'Administrator',
                    email: user.email || '',
                    role: 'admin',
                    collegeId: instSnap.docs[0].id,
                    collegeName: instData.name,
                    messId: '',
                    messName: '',
                    createdAt: new Date().toISOString()
                  };
                  await setDoc(userDocRef, adminProfile, { merge: true });
                  await setDoc(doc(db, 'admins', user.uid), {
                    uid: user.uid,
                    email: user.email,
                    role: 'admin',
                    collegeId: instSnap.docs[0].id,
                    collegeName: instData.name,
                    plan: instData.plan || 'starter',
                    createdAt: new Date().toISOString()
                  }, { merge: true });
                  setUserProfile(adminProfile);
                  setNeedsProfileSetup(false);
                } else {
                  // Fresh user without student profile or admin record
                  setNeedsProfileSetup(true);
                }
              }
            }
          }

          // Trigger background seed check if user is logged in
          seedInitialDatabaseIfEmpty().catch(console.warn);
        } catch (err: any) {
          console.error('Error fetching user profile:', err);
          setAuthError(err.message || 'Failed to load profile.');
        }
      } else {
        setUserProfile(null);
        setNeedsProfileSetup(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch institutions dynamically from Firestore
  const fetchInstitutions = async (): Promise<Institution[]> => {
    try {
      const snap = await getDocs(collection(db, 'institutions'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Institution));
      return list;
    } catch (err) {
      console.warn('Error fetching institutions:', err);
      return [];
    }
  };

  // Fetch messes for a specific college
  const fetchMessesForCollege = async (collegeId: string): Promise<Mess[]> => {
    try {
      const q = query(collection(db, 'messes'), where('collegeId', '==', collegeId));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Mess));
      return list;
    } catch (err) {
      console.warn('Error fetching messes for college:', err);
      return [];
    }
  };

  // Student Email Signup
  const registerStudentWithEmail = async (data: {
    name: string;
    email: string;
    password: string;
    collegeId: string;
    collegeName: string;
    messId: string;
    messName: string;
  }): Promise<UserProfile> => {
    setLoading(true);
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await updateFirebaseProfile(user, { displayName: data.name });

      try {
        await sendEmailVerification(user);
      } catch (e) {
        console.warn('Verification email notice:', e);
      }

      const newProfile: UserProfile = {
        uid: user.uid,
        name: data.name,
        email: data.email,
        role: 'student',
        collegeId: data.collegeId,
        collegeName: data.collegeName,
        messId: data.messId,
        messName: data.messName,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), newProfile);
      setUserProfile(newProfile);
      setNeedsProfileSetup(false);
      setLoading(false);
      return newProfile;
    } catch (err: any) {
      setLoading(false);
      const message = mapAuthErrorMessage(err.code || err.message);
      setAuthError(message);
      throw new Error(message);
    }
  };

  // Student / General Email Login
  const loginWithEmail = async (email: string, pass: string): Promise<UserProfile | null> => {
    setLoading(true);
    setAuthError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        setUserProfile(profile);
        setLoading(false);
        return profile;
      } else {
        setNeedsProfileSetup(true);
        setLoading(false);
        return null;
      }
    } catch (err: any) {
      setLoading(false);
      const message = mapAuthErrorMessage(err.code || err.message);
      setAuthError(message);
      throw new Error(message);
    }
  };

  // Register Admin account with Email & Password
  const registerAdminWithEmail = async (email: string, pass: string, name: string): Promise<User> => {
    setLoading(true);
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateFirebaseProfile(cred.user, { displayName: name });
      setLoading(false);
      return cred.user;
    } catch (err: any) {
      setLoading(false);
      const message = mapAuthErrorMessage(err.code || err.message);
      setAuthError(message);
      throw new Error(message);
    }
  };

  // Admin Email Login (Strictly Email & Password, isolated from Google Sign-In)
  const loginAdminWithEmail = async (email: string, pass: string): Promise<{ profile: UserProfile | null; needsOnboarding: boolean }> => {
    if (isAuthenticatingRef.current) {
      throw new Error('Authentication is already in progress. Please wait a moment.');
    }
    isAuthenticatingRef.current = true;
    setLoading(true);
    setAuthError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const user = userCredential.user;
      const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

      // 1. Fetch user profile from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      // 2. Reject students attempting to enter the Admin Portal
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        if (userData.role === 'student' && !isSuperAdmin) {
          await signOut(auth);
          setUserProfile(null);
          setCurrentUser(null);
          throw new Error('Access Restricted: This account is registered as a student. The Admin Portal is reserved for mess administrators and wardens. Please use "Continue as Student".');
        }
      }

      // 3. Super Admin bypass & bootstrap
      if (isSuperAdmin) {
        const adminProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || 'Super Admin',
          email: user.email || SUPER_ADMIN_EMAIL,
          role: 'admin',
          collegeId: 'inst-iitb',
          collegeName: 'IIT Bombay',
          messId: 'mess-iitb-h12',
          messName: 'Hostel 12 - North Indian Dining',
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, adminProfile, { merge: true });
        await setDoc(doc(db, 'admins', user.uid), {
          uid: user.uid,
          email: user.email,
          role: 'admin',
          collegeId: 'inst-iitb',
          collegeName: 'IIT Bombay',
          plan: 'pro',
          createdAt: new Date().toISOString()
        }, { merge: true });
        setUserProfile(adminProfile);
        setNeedsProfileSetup(false);
        return { profile: adminProfile, needsOnboarding: false };
      }

      // 4. Check admin document
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        const profile: UserProfile = {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Administrator',
          email: user.email || '',
          role: 'admin',
          collegeId: adminData.collegeId || '',
          collegeName: adminData.collegeName || '',
          messId: adminData.messId || '',
          messName: adminData.messName || '',
          createdAt: adminData.createdAt || new Date().toISOString()
        };
        await setDoc(userDocRef, profile, { merge: true });
        setUserProfile(profile);
        setNeedsProfileSetup(false);
        return { profile, needsOnboarding: false };
      }

      // 5. Check if user owns an institution
      const instQ = query(collection(db, 'institutions'), where('ownerUid', '==', user.uid));
      const instSnap = await getDocs(instQ);
      if (!instSnap.empty) {
        const instData = instSnap.docs[0].data();
        const adminProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Administrator',
          email: user.email || '',
          role: 'admin',
          collegeId: instSnap.docs[0].id,
          collegeName: instData.name,
          messId: '',
          messName: '',
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, adminProfile, { merge: true });
        await setDoc(doc(db, 'admins', user.uid), {
          uid: user.uid,
          email: user.email,
          role: 'admin',
          collegeId: instSnap.docs[0].id,
          collegeName: instData.name,
          plan: instData.plan || 'starter',
          createdAt: new Date().toISOString()
        }, { merge: true });
        setUserProfile(adminProfile);
        setNeedsProfileSetup(false);
        return { profile: adminProfile, needsOnboarding: false };
      }

      // 6. User exists with admin role
      if (userDoc.exists() && (userDoc.data() as UserProfile).role === 'admin') {
        const profile = userDoc.data() as UserProfile;
        setUserProfile(profile);
        setNeedsProfileSetup(false);
        return { profile, needsOnboarding: false };
      }

      // 7. User authenticated, but needs to configure college & mess
      return { profile: null, needsOnboarding: true };
    } catch (err: any) {
      const message = mapAuthErrorMessage(err.code || err.message);
      setAuthError(message);
      throw new Error(message);
    } finally {
      isAuthenticatingRef.current = false;
      setLoading(false);
    }
  };

  // Google Sign-In (Admin & Student with safe popup and redirect fallback)
  const signInWithGoogle = async (rolePreference: 'student' | 'admin' = 'student'): Promise<{ profile: UserProfile | null; needsOnboarding: boolean }> => {
    if (isAuthenticatingRef.current) {
      throw new Error('Authentication is already in progress. Please wait a moment.');
    }
    isAuthenticatingRef.current = true;
    setLoading(true);
    setAuthError(null);

    try {
      let result;
      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (popupErr: any) {
        console.warn('Google signInWithPopup notice:', popupErr?.code, popupErr?.message);
        if (popupErr?.code === 'auth/popup-blocked') {
          try {
            await signInWithRedirect(auth, googleProvider);
            return { profile: null, needsOnboarding: false };
          } catch (redirectErr: any) {
            console.warn('Redirect sign-in fallback notice:', redirectErr?.code);
            throw popupErr;
          }
        }
        throw popupErr;
      }

      const user = result.user;
      const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));

      if (rolePreference === 'admin') {
        // Disallow registered students from the Admin Portal
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          if (userData.role === 'student' && !isSuperAdmin) {
            await signOut(auth);
            setUserProfile(null);
            setCurrentUser(null);
            throw new Error('Access Restricted: This Google account is registered as a student. The Admin Portal is reserved for mess administrators.');
          }
        }

        if (adminDoc.exists() && userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          setUserProfile(profile);
          setNeedsProfileSetup(false);
          return { profile, needsOnboarding: false };
        } else if (isSuperAdmin) {
          const adminProfile: UserProfile = {
            uid: user.uid,
            name: user.displayName || 'Super Admin',
            email: user.email || SUPER_ADMIN_EMAIL,
            role: 'admin',
            collegeId: 'inst-iitb',
            collegeName: 'IIT Bombay',
            messId: 'mess-iitb-h12',
            messName: 'Hostel 12 - North Indian Dining',
            createdAt: new Date().toISOString()
          };
          await setDoc(userDocRef, adminProfile, { merge: true });
          await setDoc(doc(db, 'admins', user.uid), {
            uid: user.uid,
            email: user.email,
            role: 'admin',
            collegeId: 'inst-iitb',
            collegeName: 'IIT Bombay',
            plan: 'pro',
            createdAt: new Date().toISOString()
          }, { merge: true });
          setUserProfile(adminProfile);
          setNeedsProfileSetup(false);
          return { profile: adminProfile, needsOnboarding: false };
        } else {
          // Check if user owns an institution
          const instQ = query(collection(db, 'institutions'), where('ownerUid', '==', user.uid));
          const instSnap = await getDocs(instQ);
          if (!instSnap.empty) {
            const instData = instSnap.docs[0].data();
            const adminProfile: UserProfile = {
              uid: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'Administrator',
              email: user.email || '',
              role: 'admin',
              collegeId: instSnap.docs[0].id,
              collegeName: instData.name,
              messId: '',
              messName: '',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, adminProfile, { merge: true });
            await setDoc(doc(db, 'admins', user.uid), {
              uid: user.uid,
              email: user.email,
              role: 'admin',
              collegeId: instSnap.docs[0].id,
              collegeName: instData.name,
              plan: instData.plan || 'starter',
              createdAt: new Date().toISOString()
            }, { merge: true });
            setUserProfile(adminProfile);
            setNeedsProfileSetup(false);
            return { profile: adminProfile, needsOnboarding: false };
          }
          // New admin signup via Google -> ready for subscription & college creation!
          return { profile: null, needsOnboarding: true };
        }
      } else {
        // Student sign-in
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          setUserProfile(profile);
          setNeedsProfileSetup(false);
          return { profile, needsOnboarding: false };
        } else {
          setNeedsProfileSetup(true);
          return { profile: null, needsOnboarding: false };
        }
      }
    } catch (err: any) {
      const message = mapAuthErrorMessage(err.code || err.message);
      setAuthError(message);
      throw new Error(message);
    } finally {
      isAuthenticatingRef.current = false;
      setLoading(false);
    }
  };

  // Complete Admin Onboarding (Creates College, Initial Mess, and Subscription Plan)
  const completeAdminOnboarding = async (data: AdminOnboardingData): Promise<UserProfile> => {
    if (!currentUser) throw new Error('You must be signed in to set up an institution.');
    setLoading(true);
    setAuthError(null);

    try {
      // 1. Generate unique institution ID and Code
      const cleanSlug = data.collegeName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
      const institutionId = `inst-${cleanSlug}-${Math.random().toString(36).substring(2, 6)}`;
      const collegeCode = data.collegeName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 6) || 'COL';

      // 2. Create Institution Document
      const newInstitution: Institution = {
        id: institutionId,
        name: data.collegeName.trim(),
        location: data.location.trim(),
        code: collegeCode,
        officialEmail: (data.officialEmail || currentUser.email || '').trim(),
        contactPhone: (data.contactPhone || '').trim(),
        ownerUid: currentUser.uid,
        status: 'active',
        plan: data.plan,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'institutions', institutionId), newInstitution);

      // 3. Create Subscription Document
      const maxMesses = data.plan === 'starter' ? 1 : 5;
      const priceMonthly = data.plan === 'starter' ? 1500 : 2999;
      const subId = `sub-${institutionId}`;
      const newSubscription: Subscription = {
        id: subId,
        institutionId,
        adminUid: currentUser.uid,
        plan: data.plan,
        priceMonthly,
        maxMesses,
        status: 'trial',
        isDemo: true, // Clearly declared as demo/trial activation
        startDate: new Date().toISOString(),
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      await setDoc(doc(db, 'subscriptions', subId), newSubscription);

      // 4. Create Initial Mess
      const messId = `mess-${institutionId}-1`;
      const newMess: Mess = {
        id: messId,
        collegeId: institutionId,
        name: data.messName.trim() || 'Central Campus Dining Hall',
        locationBlock: (data.locationBlock || 'Main Campus Dining').trim(),
        timezone: 'Asia/Kolkata',
        active: true,
        breakfastTime: '07:30 - 09:30',
        lunchTime: '12:00 - 14:15',
        snacksTime: '16:45 - 18:00',
        dinnerTime: '19:45 - 21:45',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'messes', messId), newMess);

      // 5. Create default starter menus for the new mess
      const sampleDays = [1, 2, 3, 4, 5];
      for (const day of sampleDays) {
        await setDoc(doc(db, 'menus', `menu-${messId}-d${day}-lunch`), {
          id: `menu-${messId}-d${day}-lunch`,
          messId,
          collegeId: institutionId,
          day,
          mealType: 'lunch',
          dishes: 'Dal Makhani / Paneer Masala, Jeera Rice, Tawa Roti, Salad & Sweet',
          labels: 'Balanced Nutrition',
          startTime: '12:00',
          endTime: '14:15',
          createdAt: new Date().toISOString()
        });
        await setDoc(doc(db, 'menus', `menu-${messId}-d${day}-dinner`), {
          id: `menu-${messId}-d${day}-dinner`,
          messId,
          collegeId: institutionId,
          day,
          mealType: 'dinner',
          dishes: 'Mix Vegetable Curry, Yellow Dal Fry, Phulka, Steamed Basmati Rice',
          labels: 'Vegetarian',
          startTime: '19:45',
          endTime: '21:45',
          createdAt: new Date().toISOString()
        });
      }

      // 6. Create Admin & User profile
      const adminRecord: AdminRecord = {
        uid: currentUser.uid,
        email: currentUser.email || data.officialEmail,
        role: 'admin',
        collegeId: institutionId,
        collegeName: data.collegeName.trim(),
        messId,
        plan: data.plan,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'admins', currentUser.uid), adminRecord);

      const userProfile: UserProfile = {
        uid: currentUser.uid,
        name: currentUser.displayName || 'Mess Admin',
        email: currentUser.email || data.officialEmail,
        role: 'admin',
        collegeId: institutionId,
        collegeName: data.collegeName.trim(),
        messId,
        messName: data.messName.trim(),
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', currentUser.uid), userProfile);

      setUserProfile(userProfile);
      setNeedsProfileSetup(false);
      setLoading(false);
      return userProfile;
    } catch (err: any) {
      setLoading(false);
      console.error('Error completing admin onboarding:', err);
      handleFirestoreError(err, OperationType.WRITE, 'institutions');
      throw err;
    }
  };

  // Create a new mess under college with subscription limit checks
  const createNewMess = async (
    collegeId: string, 
    messData: {
      name: string;
      locationBlock?: string;
      description?: string;
      breakfastTime?: string;
      lunchTime?: string;
      snacksTime?: string;
      dinnerTime?: string;
    }
  ): Promise<Mess> => {
    if (!currentUser) throw new Error('Authentication required.');

    // Fetch existing messes for this college to enforce subscription limits
    const existingMessesSnap = await getDocs(query(collection(db, 'messes'), where('collegeId', '==', collegeId)));
    const currentCount = existingMessesSnap.size;

    // Fetch subscription
    const subDoc = await getDoc(doc(db, 'subscriptions', `sub-${collegeId}`));
    const plan = subDoc.exists() ? (subDoc.data() as Subscription).plan : 'starter';
    const maxAllowed = plan === 'starter' ? 1 : 5;

    if (currentCount >= maxAllowed) {
      throw new Error(
        `Plan Limit Reached: Your current ${plan.toUpperCase()} plan allows a maximum of ${maxAllowed} mess(es). Please upgrade to Pro to add additional dining halls.`
      );
    }

    const messId = `mess-${collegeId}-${currentCount + 1}-${Date.now().toString(36)}`;
    const newMess: Mess = {
      id: messId,
      collegeId,
      name: messData.name.trim(),
      locationBlock: (messData.locationBlock || 'Hostel Block').trim(),
      description: (messData.description || '').trim(),
      timezone: 'Asia/Kolkata',
      active: true,
      breakfastTime: messData.breakfastTime || '07:30 - 09:30',
      lunchTime: messData.lunchTime || '12:00 - 14:15',
      snacksTime: messData.snacksTime || '16:45 - 18:00',
      dinnerTime: messData.dinnerTime || '19:45 - 21:45',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'messes', messId), newMess);

    // Seed lunch & dinner for new mess
    await setDoc(doc(db, 'menus', `menu-${messId}-mon-lunch`), {
      id: `menu-${messId}-mon-lunch`,
      messId,
      collegeId,
      day: 1,
      mealType: 'lunch',
      dishes: 'Paneer Butter Masala / Chicken Curry, Dal Tadka, Rice, Chapatis, Salad',
      labels: 'Standard Meal',
      startTime: '12:00',
      endTime: '14:15',
      createdAt: new Date().toISOString()
    });

    return newMess;
  };

  // Upgrade / update subscription plan
  const updateSubscriptionPlan = async (institutionId: string, newPlan: SubscriptionPlan) => {
    if (!currentUser) throw new Error('Not authenticated.');
    const maxMesses = newPlan === 'starter' ? 1 : 5;
    const priceMonthly = newPlan === 'starter' ? 1500 : 2999;

    await updateDoc(doc(db, 'subscriptions', `sub-${institutionId}`), {
      plan: newPlan,
      maxMesses,
      priceMonthly,
      status: 'active',
      isDemo: true
    });

    await updateDoc(doc(db, 'institutions', institutionId), {
      plan: newPlan
    });

    await updateDoc(doc(db, 'admins', currentUser.uid), {
      plan: newPlan
    });
  };

  // Complete profile for newly signed-in Google students
  const completeStudentProfile = async (data: {
    name: string;
    collegeId: string;
    collegeName: string;
    messId: string;
    messName: string;
  }): Promise<UserProfile> => {
    if (!currentUser) throw new Error('No user is currently signed in.');
    setLoading(true);
    try {
      const newProfile: UserProfile = {
        uid: currentUser.uid,
        name: data.name || currentUser.displayName || 'Student',
        email: currentUser.email || '',
        role: 'student',
        collegeId: data.collegeId,
        collegeName: data.collegeName,
        messId: data.messId,
        messName: data.messName,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', currentUser.uid), newProfile);
      setUserProfile(newProfile);
      setNeedsProfileSetup(false);
      setLoading(false);
      return newProfile;
    } catch (err: any) {
      setLoading(false);
      handleFirestoreError(err, OperationType.CREATE, `users/${currentUser.uid}`);
      throw err;
    }
  };

  // Password Reset
  const sendPasswordReset = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      const message = mapAuthErrorMessage(err.code || err.message);
      setAuthError(message);
      throw new Error(message);
    }
  };

  // Resend Email Verification
  const resendVerificationEmail = async () => {
    if (!currentUser) throw new Error('No user signed in.');
    try {
      await sendEmailVerification(currentUser);
    } catch (err: any) {
      const message = mapAuthErrorMessage(err.code || err.message);
      setAuthError(message);
      throw new Error(message);
    }
  };

  // Switch student mess
  const updateUserMess = async (messId: string, messName: string) => {
    if (!currentUser || !userProfile) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        messId,
        messName,
        updatedAt: new Date().toISOString()
      });
      setUserProfile((prev) => prev ? { ...prev, messId, messName } : null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUserProfile(null);
      setNeedsProfileSetup(false);
      setAuthError(null);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = userProfile?.role === 'admin' || currentUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  const isStudent = userProfile?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        isStudent,
        loading,
        authError,
        needsProfileSetup,
        clearError,
        loginWithEmail,
        loginAdminWithEmail,
        registerAdminWithEmail,
        completeAdminOnboarding,
        registerStudentWithEmail,
        signInWithGoogle,
        completeStudentProfile,
        createNewMess,
        updateSubscriptionPlan,
        fetchInstitutions,
        fetchMessesForCollege,
        sendPasswordReset,
        resendVerificationEmail,
        updateUserMess,
        logout
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

// Friendly message mapping for common Firebase Auth error codes
function mapAuthErrorMessage(codeOrMessage: string): string {
  if (!codeOrMessage) return 'An unexpected error occurred. Please try again.';
  if (codeOrMessage.includes('auth/invalid-credential') || codeOrMessage.includes('auth/wrong-password')) {
    return 'Invalid email or password. Please verify your credentials and try again.';
  }
  if (codeOrMessage.includes('auth/user-not-found')) {
    return 'No registered account found with this email.';
  }
  if (codeOrMessage.includes('auth/email-already-in-use')) {
    return 'This email is already registered. Please sign in instead.';
  }
  if (codeOrMessage.includes('auth/weak-password')) {
    return 'Password should be at least 6 characters long.';
  }
  if (codeOrMessage.includes('auth/popup-closed-by-user')) {
    return 'Sign-in popup was closed before completing. Please try again or use Email & Password login.';
  }
  if (codeOrMessage.includes('auth/popup-blocked')) {
    return 'The Google sign-in popup was blocked by your browser. Please enable popups or sign in with your Email & Password.';
  }
  if (codeOrMessage.includes('auth/unauthorized-domain')) {
    return 'This domain is not authorized in Firebase Authentication for Google Sign-In. Please sign in directly using your Admin Email and Password.';
  }
  if (codeOrMessage.includes('auth/network-request-failed')) {
    return 'Network connection issue. Please check your internet connection and try again.';
  }
  if (codeOrMessage.includes('auth/too-many-requests')) {
    return 'Too many unsuccessful attempts. Please wait a few minutes before trying again.';
  }
  if (codeOrMessage.includes('auth/cancelled-popup-request')) {
    return 'Sign-in request was cancelled. Please try again.';
  }
  if (codeOrMessage.includes('auth/operation-not-allowed')) {
    return 'This sign-in method is not enabled. Please contact support or use Email & Password.';
  }
  return codeOrMessage;
}
