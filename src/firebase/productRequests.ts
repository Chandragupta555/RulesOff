import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  writeBatch,
  deleteField,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './config';
import { Product, ProductCategory, ProductVariant } from '../types/catalog';

export interface ProductRequestDoc {
  id?: string;
  productName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  createdAt: number;
  assignedCategory?: ProductCategory;
  assignedSubcategory?: string;
  size?: string;
  sellingPrice?: number;
  mrp?: number;
}

export interface ApprovedProductDoc {
  id?: string;
  name: string;
  category: ProductCategory;
  subcategory: string;
  variants: ProductVariant[];
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
  submittedBy: string,
  size?: string,
  sellingPrice?: number,
  mrp?: number
): Promise<string> => {
  const colRef = collection(db, PRODUCT_REQUESTS_COLLECTION);
  const payload: any = {
    productName: productName.trim(),
    status: 'pending',
    submittedBy,
    createdAt: Date.now(),
  };
  if (size && size.trim()) payload.size = size.trim();
  if (sellingPrice) payload.sellingPrice = sellingPrice;
  if (mrp) payload.mrp = mrp;

  const docRef = await addDoc(colRef, payload);
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
 * Subscribe in real-time to all approved dynamic products in Firestore with idempotent migration.
 */
export const subscribeToApprovedProducts = (
  onUpdate: (products: Product[]) => void
): Unsubscribe => {
  const colRef = collection(db, APPROVED_PRODUCTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snap) => {
      const items: Product[] = snap.docs.map((d) => {
        const data = d.data() as any;
        const hasVariants = Array.isArray(data.variants) && data.variants.length > 0;
        const hasFlatMrp = data.mrp !== undefined;

        const variants: ProductVariant[] = hasVariants
          ? data.variants
          : [{ size: 'Standard', mrp: typeof data.mrp === 'number' ? data.mrp : 20 }];

        // Idempotent migration check: clean up flat `mrp` and set `variants` in Firestore
        if (!hasVariants || hasFlatMrp) {
          updateDoc(d.ref, {
            variants,
            mrp: deleteField(),
          }).catch((err) => {
            // Silently ignore if auth session isn't admin
          });
        }

        return {
          id: d.id,
          name: data.name,
          category: data.category,
          subcategory: data.subcategory,
          variants,
          mrp: variants[0]?.mrp || 20,
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
 * Admin action: Approve a pending product request as a brand-new catalog product.
 */
export const approveProductRequestDoc = async (
  requestId: string,
  productName: string,
  category: ProductCategory,
  subcategory: string,
  size: string,
  mrp: number
): Promise<string> => {
  const cleanName = productName.trim();
  const cleanSub = subcategory.trim();
  const cleanSize = (size || 'Standard').trim();
  const slugId = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const variant: ProductVariant = { size: cleanSize, mrp: Math.max(1, mrp) };

  // 1. Write to masterProducts collection
  const masterDocRef = doc(db, MASTER_PRODUCTS_COLLECTION, slugId);
  await setDoc(masterDocRef, {
    name: cleanName,
    category,
    subcategory: cleanSub,
    variants: [variant],
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
    variants: [variant],
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
    size: cleanSize,
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
          variantSize: cleanSize,
          mrp: Math.max(1, mrp),
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
 * Admin action: Approve a pending product request by adding it as a NEW VARIANT onto an EXISTING catalog product.
 */
export const approveProductRequestAsVariantDoc = async (
  requestId: string,
  existingProductId: string,
  size: string,
  mrp: number
): Promise<void> => {
  const cleanSize = (size || 'Standard').trim();
  const newVariant: ProductVariant = { size: cleanSize, mrp: Math.max(1, mrp) };

  // 1. Fetch existing master product
  const masterDocRef = doc(db, MASTER_PRODUCTS_COLLECTION, existingProductId);
  const masterSnap = await getDoc(masterDocRef);

  let currentVariants: ProductVariant[] = [];
  let prodName = existingProductId;

  if (masterSnap.exists()) {
    const data = masterSnap.data() as any;
    prodName = data.name || existingProductId;
    currentVariants = Array.isArray(data.variants) && data.variants.length > 0
      ? data.variants
      : [{ size: 'Standard', mrp: data.mrp || 20 }];
  } else {
    currentVariants = [{ size: 'Standard', mrp: Math.max(1, mrp) }];
  }

  // Check if size already exists, update or append
  const existingIdx = currentVariants.findIndex((v) => v.size.toLowerCase() === cleanSize.toLowerCase());
  let updatedVariants: ProductVariant[] = [];

  if (existingIdx >= 0) {
    updatedVariants = currentVariants.map((v, i) => (i === existingIdx ? newVariant : v));
  } else {
    updatedVariants = [...currentVariants, newVariant];
  }

  // Write updated variants to masterProducts
  await updateDoc(masterDocRef, {
    variants: updatedVariants,
    updatedAt: Date.now(),
  });

  // 2. Mark request doc as approved
  const reqRef = doc(db, PRODUCT_REQUESTS_COLLECTION, requestId);
  await updateDoc(reqRef, {
    status: 'approved',
    size: cleanSize,
    mrp: Math.max(1, mrp),
  });

  // 3. Update any listings referencing this request ID or name
  try {
    const listingsColRef = collection(db, LISTINGS_COLLECTION);
    const q = query(listingsColRef, where('productId', '==', requestId));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.docs.forEach((d) => {
        batch.update(d.ref, {
          isUnverified: false,
          productId: existingProductId,
          productName: prodName,
          variantSize: cleanSize,
          mrp: Math.max(1, mrp),
        });
      });
      await batch.commit();
    }
  } catch (err) {
    console.error('[Firebase approveProductRequestAsVariantDoc] Listing sync error:', err);
  }
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
