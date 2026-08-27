import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './config';
import { HostelName } from '../types/user';

export interface FirestoreListing {
  id?: string;
  sellerUid: string;
  sellerName: string;
  sellerRoom: string;
  hostel: HostelName;
  productId: string;
  productName: string;
  variantSize?: string;
  mrp?: number;
  quantity: number;
  price: number;
  isSellerAwake: boolean;
  deliveryOptIn: boolean;
  deliveryFee?: number;
  isUnverified?: boolean;
  unverifiedProductName?: string;
  createdAt: number;
}

const LISTINGS_COLLECTION = 'listings';

/**
 * Add a new listing to Firestore.
 */
export const createListingDoc = async (
  listingData: Omit<FirestoreListing, 'id' | 'createdAt'>
): Promise<string> => {
  const colRef = collection(db, LISTINGS_COLLECTION);
  const cleanData = Object.fromEntries(
    Object.entries(listingData).filter(([_, value]) => value !== undefined)
  );
  const docRef = await addDoc(colRef, {
    ...cleanData,
    createdAt: Date.now(),
  });
  return docRef.id;
};

/**
 * Update an existing listing in Firestore.
 */
export const updateListingDoc = async (
  id: string,
  updates: Partial<FirestoreListing>
): Promise<void> => {
  const docRef = doc(db, LISTINGS_COLLECTION, id);
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, value]) => value !== undefined)
  );
  await updateDoc(docRef, cleanUpdates);
};

/**
 * Delete a listing from Firestore and cancel any dependent requests.
 */
export const deleteListingDoc = async (id: string): Promise<void> => {
  if (!id) return;
  const docRef = doc(db, LISTINGS_COLLECTION, id);
  await deleteDoc(docRef);

  // Auto-cancel dependent requests pointing to this deleted listing
  try {
    const requestsColRef = collection(db, 'requests');
    const q = query(requestsColRef, where('listingId', '==', id));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.docs.forEach((d) => {
        const reqData = d.data();
        if (reqData.status === 'pending' || reqData.status === 'accepted') {
          batch.update(d.ref, {
            status: 'cancelled',
            cancellationReason: 'Listing removed',
            updatedAt: Date.now(),
          });
        }
      });
      await batch.commit();
    }
  } catch (err) {
    console.error('[Firebase deleteListingDoc] Error auto-cancelling dependent requests:', err);
  }
};

/**
 * Admin Action: Delete ANY listing document permanently for moderation,
 * and auto-cancel any active/pending buyer requests pointing to this listing.
 */
export const adminDeleteListingDoc = async (listingId: string): Promise<void> => {
  if (!listingId) return;
  const listingRef = doc(db, LISTINGS_COLLECTION, listingId);
  await deleteDoc(listingRef);

  // Auto-cancel dependent requests with explicit moderation reason
  try {
    const requestsColRef = collection(db, 'requests');
    const q = query(requestsColRef, where('listingId', '==', listingId));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.docs.forEach((d) => {
        const reqData = d.data();
        if (reqData.status === 'pending' || reqData.status === 'accepted') {
          batch.update(d.ref, {
            status: 'cancelled',
            cancellationReason: 'Listing removed by admin moderation',
            updatedAt: Date.now(),
          });
        }
      });
      await batch.commit();
    }
  } catch (err) {
    console.error('[Firebase adminDeleteListingDoc] Error auto-cancelling dependent requests:', err);
  }
};

/**
 * Subscribe in real-time to a seller's own listings.
 */
export const subscribeToUserListings = (
  sellerUid: string,
  onUpdate: (listings: FirestoreListing[]) => void
): Unsubscribe => {
  const colRef = collection(db, LISTINGS_COLLECTION);
  const q = query(colRef, where('sellerUid', '==', sellerUid));

  return onSnapshot(
    q,
    (snap) => {
      const items: FirestoreListing[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FirestoreListing, 'id'>),
      }));
      onUpdate(items);
    },
    (err) => {
      console.error('[Firebase listings] User listings snapshot error:', err);
    }
  );
};

/**
 * Subscribe in real-time to all listings for a specific hostel.
 */
export const subscribeToHostelListings = (
  hostel: HostelName,
  onUpdate: (listings: FirestoreListing[]) => void
): Unsubscribe => {
  const colRef = collection(db, LISTINGS_COLLECTION);
  const q = query(colRef, where('hostel', '==', hostel));

  return onSnapshot(
    q,
    (snap) => {
      const items: FirestoreListing[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FirestoreListing, 'id'>),
      }));
      onUpdate(items);
    },
    (err) => {
      console.error('[Firebase listings] Hostel listings snapshot error:', err);
    }
  );
};

/**
 * Admin Action: Subscribe in real-time to ALL listings across all hostels for moderation.
 */
export const subscribeToAllListings = (
  onUpdate: (listings: FirestoreListing[]) => void
): Unsubscribe => {
  const colRef = collection(db, LISTINGS_COLLECTION);

  return onSnapshot(
    colRef,
    (snap) => {
      const items: FirestoreListing[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FirestoreListing, 'id'>),
      }));
      items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      onUpdate(items);
    },
    (err) => {
      console.error('[Firebase listings] All listings snapshot error:', err);
    }
  );
};

/**
 * Update `isSellerAwake` across all listings belonging to a seller UID.
 */
export const updateSellerAwakeStatusInListings = async (
  sellerUid: string,
  isSellerAwake: boolean
): Promise<void> => {
  if (!sellerUid) return;
  const colRef = collection(db, LISTINGS_COLLECTION);
  const q = query(colRef, where('sellerUid', '==', sellerUid));
  const snap = await getDocs(q);

  if (snap.empty) return;

  const batch = writeBatch(db);
  snap.docs.forEach((d) => {
    batch.update(d.ref, { isSellerAwake });
  });
  await batch.commit();
};

/**
 * Update `sellerRoom` and `sellerName` across all listings belonging to a seller UID when room/name changes.
 */
export const updateSellerDetailsInListings = async (
  sellerUid: string,
  sellerName: string,
  sellerRoom: string,
  hostel: HostelName
): Promise<void> => {
  if (!sellerUid) return;
  const colRef = collection(db, LISTINGS_COLLECTION);
  const q = query(colRef, where('sellerUid', '==', sellerUid));
  const snap = await getDocs(q);

  if (snap.empty) return;

  const batch = writeBatch(db);
  snap.docs.forEach((d) => {
    batch.update(d.ref, { sellerName, sellerRoom, hostel });
  });
  await batch.commit();
};
