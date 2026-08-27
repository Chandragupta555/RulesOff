import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  Unsubscribe
} from "firebase/firestore";
import { db } from "./config";
import { UserProfile } from "../types/user";

const USERS_COLLECTION = "users";

/**
 * Get doc reference for a user by Auth UID.
 */
export const getUserDocRef = (uid: string) => doc(db, USERS_COLLECTION, uid);

/**
 * Fetch user profile from Firestore once.
 */
export const getUserProfileDoc = async (uid: string): Promise<UserProfile | null> => {
  const docRef = getUserDocRef(uid);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
};

/**
 * Create or update user profile document in Firestore.
 */
export const saveUserProfileDoc = async (
  uid: string,
  profileData: Partial<UserProfile>
): Promise<void> => {
  const docRef = getUserDocRef(uid);
  const cleanData = Object.fromEntries(
    Object.entries({ ...profileData, uid }).filter(([_, value]) => value !== undefined)
  );
  await setDoc(docRef, cleanData, { merge: true });
};

/**
 * Subscribe to real-time updates for a user's Firestore document.
 */
export const subscribeToUserProfile = (
  uid: string,
  onUpdate: (profile: UserProfile | null) => void
): Unsubscribe => {
  const docRef = getUserDocRef(uid);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as UserProfile);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.error("[Firebase users] Real-time snapshot error:", error);
    }
  );
};
