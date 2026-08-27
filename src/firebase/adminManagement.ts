import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './config';
import { OWNER_ADMIN_EMAIL, isOwnerAdminEmail } from '../config/admin';

export interface DynamicAdminDoc {
  email: string;
  grantedBy: string;
  createdAt: number;
}

const ADMINS_COLLECTION = 'admins';

/**
 * Async check if an email document exists in the `admins` collection (or is Owner Admin).
 */
export const checkIsAdminEmailAsync = async (email: string): Promise<boolean> => {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) return false;
  if (isOwnerAdminEmail(cleanEmail)) return true;

  try {
    const docRef = doc(db, ADMINS_COLLECTION, cleanEmail);
    const snap = await getDoc(docRef);
    return snap.exists();
  } catch (err) {
    console.error('[Admin Management] Async admin check failed:', err);
    return false;
  }
};

/**
 * Real-time subscription to dynamic admins in Firestore (`admins` collection).
 */
export const subscribeToAdminList = (
  onUpdate: (admins: DynamicAdminDoc[]) => void
): Unsubscribe => {
  const colRef = collection(db, ADMINS_COLLECTION);
  return onSnapshot(
    colRef,
    (snap) => {
      const items: DynamicAdminDoc[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          email: d.id,
          grantedBy: data.grantedBy || 'Owner',
          createdAt: data.createdAt || Date.now(),
        };
      });
      items.sort((a, b) => b.createdAt - a.createdAt);
      onUpdate(items);
    },
    (err) => {
      console.error('[Admin Management] Subscription error:', err);
      onUpdate([]);
    }
  );
};

/**
 * Owner Action: Grant admin rights to any Google email address by creating a doc in `admins`.
 */
export const grantAdminAccess = async (emailToGrant: string, grantedBy: string): Promise<void> => {
  const cleanEmail = emailToGrant.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  if (isOwnerAdminEmail(cleanEmail)) {
    throw new Error('This email is already the permanent Owner Admin.');
  }

  const docRef = doc(db, ADMINS_COLLECTION, cleanEmail);
  await setDoc(docRef, {
    email: cleanEmail,
    grantedBy: grantedBy || OWNER_ADMIN_EMAIL,
    createdAt: Date.now(),
  });
};

/**
 * Owner Action: Revoke admin rights from a dynamic admin by deleting their doc in `admins`.
 */
export const revokeAdminAccess = async (emailToRevoke: string): Promise<void> => {
  const cleanEmail = emailToRevoke.trim().toLowerCase();
  if (!cleanEmail) return;

  if (isOwnerAdminEmail(cleanEmail)) {
    throw new Error('Cannot revoke permanent Owner Admin rights.');
  }

  const docRef = doc(db, ADMINS_COLLECTION, cleanEmail);
  await deleteDoc(docRef);
};
