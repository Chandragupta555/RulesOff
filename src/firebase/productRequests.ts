import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './config';
import { Product, ProductCategory } from '../types/catalog';

export interface ProductRequestDoc {
  id?: string;
  productName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  createdAt: number;
  assignedCategory?: ProductCategory;
  assignedSubcategory?: string;
  mrp?: number;
}

export interface ApprovedProductDoc {
  id?: string;
  name: string;
  category: ProductCategory;
  subcategory: string;
  mrp: number;
  approvedAt: number;
  requestId?: string;
}

const PRODUCT_REQUESTS_COLLECTION = 'productRequests';
const APPROVED_PRODUCTS_COLLECTION = 'approvedProducts';
const MASTER_PRODUCTS_COLLECTION = 'masterProducts';
const CATALOG_TAXONOMY_COLLECTION = 'catalogTaxonomy';
const LISTINGS_COLLECTION = 'listings';

/**
 * Create a new product request submitted by a user/seller.
 */
export const createProductRequestDoc = async (
  productName: string,
  submittedBy: string
): Promise<string> => {
  const colRef = collection(db, PRODUCT_REQUESTS_COLLECTION);
  const docRef = await addDoc(colRef, {
    productName: productName.trim(),
    status: 'pending',
    submittedBy,
    createdAt: Date.now(),
  });
  return docRef.id;
};

/**
 * Subscribe in real-time to all product requests (used on Admin Screen).
 */
export const subscribeToProductRequests = (
  onUpdate: (requests: ProductRequestDoc[]) => void
): Unsubscribe => {
  const colRef = collection(db, PRODUCT_REQUESTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snap) => {
      const items: ProductRequestDoc[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ProductRequestDoc, 'id'>),
      }));
      items.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return b.createdAt - a.createdAt;
      });
      onUpdate(items);
    },
    (err) => {
      console.error('[Firebase productRequests] Snapshot error:', err);
    }
  );
};

/**
 * Subscribe in real-time to all approved dynamic products in Firestore.
 */
export const subscribeToApprovedProducts = (
  onUpdate: (products: Product[]) => void
): Unsubscribe => {
  const colRef = collection(db, APPROVED_PRODUCTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snap) => {
      const items: Product[] = snap.docs.map((d) => {
        const data = d.data() as ApprovedProductDoc;
        return {
          id: d.id,
          name: data.name,
          category: data.category,
          subcategory: data.subcategory,
          mrp: data.mrp || 20,
          imageUrl:
            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
          iconName: 'new_releases',
          description: `Approved catalog item under ${data.subcategory}`,
          isCustomApproved: true,
        };
      });
      onUpdate(items);
    },
    (err) => {
      console.error('[Firebase approvedProducts] Snapshot error:', err);
    }
  );
};

/**
 * Admin action: Approve a pending product request.
 * 1. Creates a permanent entry in `masterProducts` and `approvedProducts`.
 * 2. Ensures `subcategory` exists in `catalogTaxonomy`.
 * 3. Updates status of `productRequests` doc to 'approved'.
 * 4. Batch updates any existing listings using this product name to remove 'isUnverified'.
 */
export const approveProductRequestDoc = async (
  requestId: string,
  productName: string,
  category: ProductCategory,
  subcategory: string,
  mrp: number
): Promise<string> => {
  const cleanName = productName.trim();
  const cleanSub = subcategory.trim();
  const slugId = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // 1. Write to masterProducts collection
  const masterDocRef = doc(db, MASTER_PRODUCTS_COLLECTION, slugId);
  await setDoc(masterDocRef, {
    name: cleanName,
    category,
    subcategory: cleanSub,
    mrp: Math.max(1, mrp),
    imageUrl:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    iconName: 'new_releases',
    description: `Approved product under ${cleanSub}`,
    isCustomApproved: true,
    approvedAt: Date.now(),
  });

  // 2. Also write to approvedProducts for legacy compatibility
  const approvedColRef = collection(db, APPROVED_PRODUCTS_COLLECTION);
  await addDoc(approvedColRef, {
    name: cleanName,
    category,
    subcategory: cleanSub,
    mrp: Math.max(1, mrp),
    approvedAt: Date.now(),
    requestId,
  });

  // 3. Update taxonomy document to include this subcategory if missing
  try {
    const catSlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const taxonomyRef = doc(db, CATALOG_TAXONOMY_COLLECTION, catSlug);
    const taxSnap = await getDocs(
      query(collection(db, CATALOG_TAXONOMY_COLLECTION), where('name', '==', category))
    );

    if (!taxSnap.empty) {
      const taxDoc = taxSnap.docs[0];
      const existingSubs = (taxDoc.data().subcategories as string[]) || [];
      if (!existingSubs.includes(cleanSub)) {
        await updateDoc(taxDoc.ref, {
          subcategories: [...existingSubs, cleanSub],
        });
      }
    } else {
      await setDoc(taxonomyRef, {
        name: category,
        subcategories: [cleanSub],
        order: Date.now(),
      });
    }
  } catch (err) {
    console.error('[Firebase approveProductRequestDoc] Taxonomy update error:', err);
  }

  // 4. Update request doc status
  const reqRef = doc(db, PRODUCT_REQUESTS_COLLECTION, requestId);
  await updateDoc(reqRef, {
    status: 'approved',
    assignedCategory: category,
    assignedSubcategory: cleanSub,
    mrp: Math.max(1, mrp),
  });

  // 5. Update any listings that used this requested product name or request ID
  try {
    const listingsColRef = collection(db, LISTINGS_COLLECTION);
    const q1 = query(listingsColRef, where('unverifiedProductName', '==', cleanName));
    const snap1 = await getDocs(q1);

    const q2 = query(listingsColRef, where('productId', '==', requestId));
    const snap2 = await getDocs(q2);

    const docRefsToUpdate = new Set<string>();
    snap1.docs.forEach((d) => docRefsToUpdate.add(d.id));
    snap2.docs.forEach((d) => docRefsToUpdate.add(d.id));

    if (docRefsToUpdate.size > 0) {
      const batch = writeBatch(db);
      docRefsToUpdate.forEach((id) => {
        const lRef = doc(db, LISTINGS_COLLECTION, id);
        batch.update(lRef, {
          isUnverified: false,
          productId: slugId,
          productName: cleanName,
        });
      });
      await batch.commit();
    }
  } catch (err) {
    console.error('[Firebase approveProductRequestDoc] Error updating existing listings:', err);
  }

  return slugId;
};

/**
 * Admin action: Reject a pending product request.
 */
export const rejectProductRequestDoc = async (requestId: string): Promise<void> => {
  const reqRef = doc(db, PRODUCT_REQUESTS_COLLECTION, requestId);
  await updateDoc(reqRef, {
    status: 'rejected',
  });
};
