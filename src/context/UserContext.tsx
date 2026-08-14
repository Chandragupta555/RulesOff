import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase/config';
import { authenticatePecUser, signOutUser } from '../firebase/auth';
import { subscribeToUserProfile, saveUserProfileDoc } from '../firebase/users';
import { UserProfile, UserContextType, HostelName } from '../types/user';
import { syncUserListingWithProfile } from '../data/mockCatalog';

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
  const pecRegex = /^[a-zA-Z0-9._-]+bt\d{2}[a-zA-Z]+@pec\.edu\.in$/i;
  return pecRegex.test(email.trim());
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

  // Subscribe to Firebase Auth and Firestore user document
  useEffect(() => {
    let docUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (docUnsubscribe) {
        docUnsubscribe();
        docUnsubscribe = null;
      }

      if (firebaseUser) {
        console.log('[Firebase Auth] User authenticated:', firebaseUser.uid, firebaseUser.email);
        // Subscribe to Firestore user doc
        docUnsubscribe = subscribeToUserProfile(firebaseUser.uid, (firestoreProfile) => {
          if (firestoreProfile) {
            console.log('[Firestore Users] Loaded user doc:', firestoreProfile);
            setUser({
              ...INITIAL_USER,
              ...firestoreProfile,
              uid: firebaseUser.uid,
              email: firebaseUser.email || firestoreProfile.email || '',
              isVerified: true,
            });
            syncUserListingWithProfile(
              firestoreProfile.roomNumber || '',
              firestoreProfile.isAwake ?? true,
              firestoreProfile.deliveryOptIn ?? true
            );
          } else {
            console.log('[Firestore Users] No existing user doc found, seeding initial profile.');
            const initialDoc: UserProfile = {
              ...INITIAL_USER,
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              isVerified: true,
            };
            setUser(initialDoc);
            saveUserProfileDoc(firebaseUser.uid, initialDoc);
          }
          setLoading(false);
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

  const setVerifiedEmail = async (email: string, parsedName: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = parsedName.trim() || parseNameFromPecEmail(cleanEmail);

    setLoading(true);
    try {
      const firebaseUser = await authenticatePecUser(cleanEmail, cleanName);
      const updatedProfile: UserProfile = {
        ...user,
        uid: firebaseUser.uid,
        email: cleanEmail,
        name: cleanName,
        isVerified: true,
      };
      setUser(updatedProfile);
      await saveUserProfileDoc(firebaseUser.uid, updatedProfile);
    } catch (error) {
      console.error('[Firebase Auth] Failed to authenticate email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const setHostelAndRoom = async (hostel: HostelName, roomNumber: string) => {
    const raw = roomNumber.trim().toUpperCase();
    const match = raw.match(/([A-Z]\d{3})/);
    const cleaned = match ? match[1] : raw;

    const updated: Partial<UserProfile> = {
      hostel,
      roomNumber: cleaned,
      hasCompletedSetup: true,
      lastHostelChangeDate: Date.now(),
    };

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
