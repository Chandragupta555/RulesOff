import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase/config';
import { signInWithGoogle, signOutUser, handleRedirectAuthResult, isAllowedSignInEmail } from '../firebase/auth';
import { subscribeToUserProfile, saveUserProfileDoc, getUserProfileDoc } from '../firebase/users';
import { UserProfile, UserContextType, HostelName } from '../types/user';
import { isOwnerAdminEmail, isAdminEmail } from '../config/admin';
import { subscribeToAdminList, DynamicAdminDoc } from '../firebase/adminManagement';

const INITIAL_USER: UserProfile = {
  uid: '',
  name: '',
  email: '',
  hostel: '',
  roomNumber: '',
  isAwake: true,
  deliveryOptIn: true,
  reliabilityScore: 100,
  isVerified: false,
  hasCompletedSetup: false,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const validatePecEmail = (email: string): boolean => {
  if (!email) return false;
  return email.trim().toLowerCase().endsWith('@pec.edu.in');
};

export const parseNameFromPecEmail = (email: string): string => {
  if (!email) return '';
  const cleanEmail = email.trim().toLowerCase();
  const match = cleanEmail.match(/^([a-zA-Z0-9._-]+)bt\d{2}[a-zA-Z]+@pec\.edu\.in$/);
  if (match && match[1]) {
    const rawName = match[1];
    const parts = rawName.replace(/[._]/g, ' ').split(' ').filter(Boolean);
    return parts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
  const atIndex = cleanEmail.indexOf('@');
  if (atIndex > 0) {
    const prefix = cleanEmail.substring(0, atIndex);
    return prefix
      .replace(/bt\d{2}[a-zA-Z]+$/i, '')
      .replace(/[._]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
  return '';
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [loading, setLoading] = useState<boolean>(true);
  const [dynamicAdmins, setDynamicAdmins] = useState<DynamicAdminDoc[]>([]);

  // Real-time subscription to dynamic admins list
  useEffect(() => {
    const unsubAdmins = subscribeToAdminList((items) => {
      setDynamicAdmins(items);
    });
    return () => unsubAdmins();
  }, []);

  const dynamicAdminEmails = dynamicAdmins.map((a) => a.email);
  const isOwnerAdmin = isOwnerAdminEmail(user.email);
  const isAdmin = isAdminEmail(user.email, dynamicAdminEmails);

  // Subscribe to Firebase Auth and Firestore user document
  useEffect(() => {
    let docUnsubscribe: (() => void) | null = null;

    handleRedirectAuthResult().then((res) => {
      if (res && !res.isAllowed) {
        console.warn('[Firebase Auth] Redirect sign in rejected: unauthorized account.');
      }
    });

    const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (docUnsubscribe) {
        docUnsubscribe();
        docUnsubscribe = null;
      }

      if (firebaseUser) {
        const email = (firebaseUser.email || '').trim().toLowerCase();
        isAllowedSignInEmail(email).then((isAllowed) => {
          if (!isAllowed) {
            console.warn('[Firebase Auth] Rejecting unauthorized email session on auth state change:', email);
            signOutUser();
            setUser(INITIAL_USER);
            setLoading(false);
            return;
          }

          console.log('[Firebase Auth] User authenticated via Google:', firebaseUser.uid, email);
          // Subscribe to Firestore user doc
          docUnsubscribe = subscribeToUserProfile(firebaseUser.uid, (firestoreProfile) => {
            if (firestoreProfile) {
              console.log('[Firestore Users] Loaded existing user doc:', firestoreProfile);
              setUser({
                ...INITIAL_USER,
                ...firestoreProfile,
                uid: firebaseUser.uid,
                email: email || firestoreProfile.email || '',
                name: firestoreProfile.name || firebaseUser.displayName || parseNameFromPecEmail(email) || 'Student',
                isVerified: true,
              });
            } else {
              console.log('[Firestore Users] No user doc exists yet. Will be created on setup.');
              const initialDoc: UserProfile = {
                ...INITIAL_USER,
                uid: firebaseUser.uid,
                email: email,
                name: firebaseUser.displayName || parseNameFromPecEmail(email) || 'Student',
                isVerified: true,
                hasCompletedSetup: false,
              };
              setUser(initialDoc);
            }
            setLoading(false);
          });
        });
      } else {
        console.log('[Firebase Auth] User signed out.');
        setUser(INITIAL_USER);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (docUnsubscribe) docUnsubscribe();
    };
  }, []);

  const signInWithGoogleAccount = async (): Promise<UserProfile> => {
    setLoading(true);
    try {
      const { user: firebaseUser, isAllowed } = await signInWithGoogle();
      if (!isAllowed) {
        throw new Error('Access restricted. Please sign in with your PEC college email (@pec.edu.in) or an authorized admin account.');
      }

      const email = (firebaseUser.email || '').trim().toLowerCase();
      const realName = firebaseUser.displayName || parseNameFromPecEmail(email) || 'PEC Student';

      // Check if user document ALREADY exists in Firestore
      const existingDoc = await getUserProfileDoc(firebaseUser.uid);

      if (existingDoc && existingDoc.hasCompletedSetup) {
        console.log('[UserContext] Recognized existing user with completed setup:', existingDoc);
        const existingProfile: UserProfile = {
          ...INITIAL_USER,
          ...existingDoc,
          uid: firebaseUser.uid,
          email: email,
          name: existingDoc.name || realName,
          isVerified: true,
          hasCompletedSetup: true,
        };
        setUser(existingProfile);
        // Save verified status without overwriting hostel/room setup
        await saveUserProfileDoc(firebaseUser.uid, { isVerified: true });
        return existingProfile;
      } else {
        console.log('[UserContext] New user or incomplete setup:', existingDoc);
        const newProfile: UserProfile = {
          ...INITIAL_USER,
          ...(existingDoc || {}),
          uid: firebaseUser.uid,
          email: email,
          name: realName,
          isVerified: true,
          hasCompletedSetup: false,
        };
        setUser(newProfile);
        await saveUserProfileDoc(firebaseUser.uid, newProfile);
        return newProfile;
      }
    } catch (error: any) {
      console.error('[Firebase Auth] Google Sign-In error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const setVerifiedEmail = async (email: string, parsedName: string) => {
    await signInWithGoogleAccount();
  };

  const setHostelAndRoom = async (
    hostel: HostelName,
    roomNumber: string,
    isActualHostelChange: boolean = false
  ) => {
    const raw = roomNumber.trim().toUpperCase();
    const match = raw.match(/^([A-Z]{1,4}\d{2,4})$/);
    const cleaned = match ? match[1] : raw;

    const updated: Partial<UserProfile> = {
      hostel,
      roomNumber: cleaned,
      hasCompletedSetup: true,
    };

    if (isActualHostelChange) {
      updated.lastHostelChangeDate = Date.now();
    }

    setUser((prev) => ({ ...prev, ...updated }));
    if (user.uid) {
      await saveUserProfileDoc(user.uid, updated);
    }
  };

  const toggleAwakeStatus = async () => {
    const nextVal = !user.isAwake;
    setUser((prev) => ({ ...prev, isAwake: nextVal }));
    if (user.uid) {
      await saveUserProfileDoc(user.uid, { isAwake: nextVal });
    }
  };

  const toggleDeliveryOptIn = async () => {
    const nextVal = !user.deliveryOptIn;
    setUser((prev) => ({ ...prev, deliveryOptIn: nextVal }));
    if (user.uid) {
      await saveUserProfileDoc(user.uid, { deliveryOptIn: nextVal });
    }
  };

  const resetUserProfile = async () => {
    setUser(INITIAL_USER);
    await signOutUser();
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        dynamicAdmins: dynamicAdminEmails,
        isOwnerAdmin,
        isAdmin,
        signInWithGoogleAccount,
        setVerifiedEmail,
        setHostelAndRoom,
        toggleAwakeStatus,
        toggleDeliveryOptIn,
        resetUserProfile,
        parseNameFromPecEmail,
        validatePecEmail,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
