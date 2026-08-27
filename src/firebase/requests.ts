import {
  collection,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  runTransaction,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './config';
import { HostelName } from '../types/user';

export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'fulfilled';

export interface FirestoreRequest {
  id?: string;
  buyerUid: string;
  buyerName: string;
  buyerRoom: string;
  buyerHostel: HostelName;
  sellerUid: string;
  sellerName: string;
  sellerRoom: string;
  sellerHostel: HostelName;
  listingId: string;
  productId: string;
  productName: string;
  quantity: number;
  method: 'pickup' | 'delivery';
  price: number;
  deliveryFee?: number;
  status: RequestStatus;
  createdAt: number;
}

const REQUESTS_COLLECTION = 'requests';
const LISTINGS_COLLECTION = 'listings';
const WEEKLY_SALES_COLLECTION = 'weeklySales';
const USERS_COLLECTION = 'users';

/**
 * Calculate and save a seller's real reliability score in Firestore based on request history.
 * reliabilityScore = (fulfilled requests / accepted+fulfilled requests) * 100
 * Defaults to 100 for sellers with no accepted requests yet.
 */
export const recalculateAndSaveSellerReliabilityScore = async (
  sellerUid: string
): Promise<number> => {
  if (!sellerUid) return 100;

  try {
    const colRef = collection(db, REQUESTS_COLLECTION);
    const q = query(colRef, where('sellerUid', '==', sellerUid));
    const snap = await getDocs(q);

    let acceptedCount = 0;
    let fulfilledCount = 0;

    snap.docs.forEach((d) => {
      const status = d.data().status as RequestStatus;
      if (status === 'accepted' || status === 'fulfilled') {
        acceptedCount++;
        if (status === 'fulfilled') {
          fulfilledCount++;
        }
      }
    });

    const score = acceptedCount > 0 ? Math.round((fulfilledCount / acceptedCount) * 100) : 100;

    // Persist to users/{sellerUid} document in Firestore
    const userDocRef = doc(db, USERS_COLLECTION, sellerUid);
    await setDoc(userDocRef, { reliabilityScore: score }, { merge: true });

    return score;
  } catch (err) {
    console.error('[Firebase requests] Failed to recalculate reliability score:', err);
    return 100;
  }
};

/**
 * Create a direct buyer-to-seller request document in Firestore.
 */
export const createRequestDoc = async (
  requestData: Omit<FirestoreRequest, 'id' | 'createdAt' | 'status'>
): Promise<string> => {
  const colRef = collection(db, REQUESTS_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...requestData,
    status: 'pending',
    createdAt: Date.now(),
  });
  return docRef.id;
};

/**
 * Subscribe in real-time to incoming requests for a seller.
 */
export const subscribeToIncomingRequests = (
  sellerUid: string,
  onUpdate: (requests: FirestoreRequest[]) => void
): Unsubscribe => {
  const colRef = collection(db, REQUESTS_COLLECTION);
  const q = query(colRef, where('sellerUid', '==', sellerUid));

  return onSnapshot(
    q,
    (snap) => {
      const items: FirestoreRequest[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FirestoreRequest, 'id'>),
      }));
      items.sort((a, b) => b.createdAt - a.createdAt);
      onUpdate(items);
    },
    (err) => {
      console.error('[Firebase requests] Incoming snapshot error:', err);
    }
  );
};

/**
 * Subscribe in real-time to outgoing requests for a buyer.
 */
export const subscribeToOutgoingRequests = (
  buyerUid: string,
  onUpdate: (requests: FirestoreRequest[]) => void
): Unsubscribe => {
  const colRef = collection(db, REQUESTS_COLLECTION);
  const q = query(colRef, where('buyerUid', '==', buyerUid));

  return onSnapshot(
    q,
    (snap) => {
      const items: FirestoreRequest[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FirestoreRequest, 'id'>),
      }));
      items.sort((a, b) => b.createdAt - a.createdAt);
      onUpdate(items);
    },
    (err) => {
      console.error('[Firebase requests] Outgoing snapshot error:', err);
    }
  );
};

/**
 * Seller accepts a request.
 */
export const acceptRequestDoc = async (requestId: string): Promise<void> => {
  const docRef = doc(db, REQUESTS_COLLECTION, requestId);
  await updateDoc(docRef, { status: 'accepted' });
};

/**
 * Seller declines a request.
 */
export const declineRequestDoc = async (requestId: string): Promise<void> => {
  const docRef = doc(db, REQUESTS_COLLECTION, requestId);
  await updateDoc(docRef, { status: 'declined' });
};

/**
 * Buyer cancels a pending request.
 */
export const cancelRequestDoc = async (requestId: string): Promise<void> => {
  const docRef = doc(db, REQUESTS_COLLECTION, requestId);
  await updateDoc(docRef, { status: 'cancelled' });
};

/**
 * Seller marks a request as fulfilled.
 * Uses a Firestore TRANSACTION strictly following Firestore's required order:
 * 1) ALL READS FIRST: Request doc, Listing doc, and Weekly Sales doc.
 * 2) ALL WRITES SECOND: Request status update, Listing quantity decrement, and Weekly Sales update/set.
 * 3) Recalculates and updates seller's reliabilityScore in Firestore.
 */
export const fulfillRequestDoc = async (requestId: string): Promise<void> => {
  const reqRef = doc(db, REQUESTS_COLLECTION, requestId);
  let sellerUid = '';

  await runTransaction(db, async (transaction) => {
    // =======================================================
    // PHASE 1: ALL READS FIRST (NO WRITES ALLOWED IN THIS PHASE)
    // =======================================================

    // Read 1: Request document
    const reqSnap = await transaction.get(reqRef);
    if (!reqSnap.exists()) {
      throw new Error('Request document not found.');
    }
    const reqData = reqSnap.data() as FirestoreRequest;
    sellerUid = reqData.sellerUid;

    if (reqData.status !== 'accepted') {
      throw new Error(`Cannot fulfill request with status '${reqData.status}'. Must be accepted.`);
    }

    // Read 2: Listing document (if listingId exists)
    const listingRef = reqData.listingId ? doc(db, LISTINGS_COLLECTION, reqData.listingId) : null;
    const listingSnap = listingRef ? await transaction.get(listingRef) : null;

    // Read 3: Weekly Sales document
    const salesDocId = `${reqData.sellerHostel}_${reqData.productId}`;
    const salesRef = doc(db, WEEKLY_SALES_COLLECTION, salesDocId);
    const salesSnap = await transaction.get(salesRef);

    // =======================================================
    // PHASE 2: ALL WRITES SECOND (NO READS ALLOWED IN THIS PHASE)
    // =======================================================

    // Write 1: Update request status to fulfilled
    transaction.update(reqRef, { status: 'fulfilled' });

    // Write 2: Decrement listing quantity if listing exists
    if (listingRef && listingSnap && listingSnap.exists()) {
      const currentQty = (listingSnap.data().quantity as number) || 0;
      const newQty = Math.max(0, currentQty - reqData.quantity);
      transaction.update(listingRef, { quantity: newQty });
    }

    // Write 3: Record / increment weekly sales
    if (salesSnap.exists()) {
      const prevUnits = (salesSnap.data().totalUnits as number) || 0;
      const prevRevenue = (salesSnap.data().totalRevenue as number) || 0;
      transaction.update(salesRef, {
        totalUnits: prevUnits + reqData.quantity,
        totalRevenue: prevRevenue + reqData.price * reqData.quantity,
        updatedAt: Date.now(),
      });
    } else {
      transaction.set(salesRef, {
        hostel: reqData.sellerHostel,
        productId: reqData.productId,
        productName: reqData.productName,
        totalUnits: reqData.quantity,
        totalRevenue: reqData.price * reqData.quantity,
        updatedAt: Date.now(),
      });
    }
  });

  // Recalculate seller's reliability score immediately after transaction
  if (sellerUid) {
    await recalculateAndSaveSellerReliabilityScore(sellerUid);
  }
};
