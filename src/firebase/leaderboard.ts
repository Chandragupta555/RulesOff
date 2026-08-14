import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  arrayUnion,
  increment,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './config';
import { HostelName } from '../types/user';

export interface WeeklySalesDoc {
  id?: string;
  hostel: HostelName;
  productId: string;
  productName: string;
  totalUnits: number;
  totalRevenue: number;
  updatedAt: number;
}

export interface ProductSuggestionDoc {
  id?: string;
  productId: string;
  productName: string;
  hostel: HostelName;
  voteCount: number;
  voters: string[];
  createdAt: number;
}

const WEEKLY_SALES_COLLECTION = 'weeklySales';
const SUGGESTIONS_COLLECTION = 'productSuggestions';

/**
 * Subscribe to real-time sales for a specific hostel.
 */
export const subscribeToHostelSales = (
  hostel: HostelName,
  onUpdate: (sales: WeeklySalesDoc[]) => void
): Unsubscribe => {
  const colRef = collection(db, WEEKLY_SALES_COLLECTION);
  const q = query(colRef, where('hostel', '==', hostel));

  return onSnapshot(
    q,
    (snap) => {
      const items: WeeklySalesDoc[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<WeeklySalesDoc, 'id'>),
      }));
      onUpdate(items);
    },
    (err) => {
      console.error('[Firebase leaderboard] Hostel sales snapshot error:', err);
    }
  );
};

/**
 * Subscribe to real-time sales across all hostels for cross-hostel rankings.
 */
export const subscribeToAllHostelSales = (
  onUpdate: (sales: WeeklySalesDoc[]) => void
): Unsubscribe => {
  const colRef = collection(db, WEEKLY_SALES_COLLECTION);

  return onSnapshot(
    colRef,
    (snap) => {
      const items: WeeklySalesDoc[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<WeeklySalesDoc, 'id'>),
      }));
      onUpdate(items);
    },
    (err) => {
      console.error('[Firebase leaderboard] All sales snapshot error:', err);
    }
  );
};

/**
 * Subscribe to real-time product suggestions for a specific hostel.
 */
export const subscribeToProductSuggestions = (
  hostel: HostelName,
  onUpdate: (suggestions: ProductSuggestionDoc[]) => void
): Unsubscribe => {
  const colRef = collection(db, SUGGESTIONS_COLLECTION);
  const q = query(colRef, where('hostel', '==', hostel));

  return onSnapshot(
    q,
    (snap) => {
      const items: ProductSuggestionDoc[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ProductSuggestionDoc, 'id'>),
      }));
      // Sort by voteCount descending
      items.sort((a, b) => b.voteCount - a.voteCount);
      onUpdate(items);
    },
    (err) => {
      console.error('[Firebase leaderboard] Suggestions snapshot error:', err);
    }
  );
};

/**
 * Suggest a pre-approved product or upvote if it already exists for this hostel.
 */
export const suggestProductDoc = async (
  hostel: HostelName,
  productId: string,
  productName: string,
  userUid: string
): Promise<void> => {
  const colRef = collection(db, SUGGESTIONS_COLLECTION);
  const q = query(colRef, where('hostel', '==', hostel), where('productId', '==', productId));
  const snap = await getDocs(q);

  if (!snap.empty) {
    // Document exists for this hostel & product
    const existingDoc = snap.docs[0];
    const data = existingDoc.data() as ProductSuggestionDoc;
    if (!data.voters || !data.voters.includes(userUid)) {
      await updateDoc(existingDoc.ref, {
        voteCount: increment(1),
        voters: arrayUnion(userUid),
      });
    }
  } else {
    // Create new suggestion document with 1 initial vote
    await addDoc(colRef, {
      hostel,
      productId,
      productName,
      voteCount: 1,
      voters: [userUid],
      createdAt: Date.now(),
    });
  }
};

/**
 * Upvote an existing product suggestion doc (preventing duplicate votes).
 */
export const voteSuggestionDoc = async (
  suggestionId: string,
  userUid: string
): Promise<void> => {
  const docRef = doc(db, SUGGESTIONS_COLLECTION, suggestionId);
  await updateDoc(docRef, {
    voteCount: increment(1),
    voters: arrayUnion(userUid),
  });
};
