import {
  collection,
  doc,
  setDoc,
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
import { Product, ProductCategory } from '../types/catalog';
import { MOCK_PRODUCTS, PRODUCT_CATEGORIES } from '../data/mockCatalog';

export interface TaxonomyCategoryDoc {
  id?: string;
  name: string;
  subcategories: string[];
  order?: number;
}

const MASTER_PRODUCTS_COLLECTION = 'masterProducts';
const CATALOG_TAXONOMY_COLLECTION = 'catalogTaxonomy';
const LISTINGS_COLLECTION = 'listings';

let isSeedingTriggered = false;

/**
 * Automatic One-Time Seeding: Hydrates Firestore with base catalog if empty.
 */
export const seedMasterCatalogIfEmpty = async (): Promise<void> => {
  if (isSeedingTriggered) return;
  isSeedingTriggered = true;

  try {
    const productsColRef = collection(db, MASTER_PRODUCTS_COLLECTION);
    const snap = await getDocs(productsColRef);

    if (!snap.empty) {
      return; // Already populated in Firestore
    }

    console.log('[Master Catalog] Seeding initial master catalog into Firestore...');
    const batch = writeBatch(db);

    // 1. Seed Taxonomy Categories
    PRODUCT_CATEGORIES.forEach((catName, index) => {
      const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const catRef = doc(db, CATALOG_TAXONOMY_COLLECTION, catSlug);
      const subcats = Array.from(
        new Set(
          MOCK_PRODUCTS.filter((p) => p.category === catName).map(
            (p) => p.subcategory || 'General'
          )
        )
      );

      batch.set(catRef, {
        name: catName,
        subcategories: subcats,
        order: index + 1,
      });
    });

    // 2. Seed Master Products with exact legacy IDs
    MOCK_PRODUCTS.forEach((prod) => {
      const prodRef = doc(db, MASTER_PRODUCTS_COLLECTION, prod.id);
      batch.set(prodRef, {
        name: prod.name,
        category: prod.category,
        subcategory: prod.subcategory || 'General',
        mrp: prod.mrp,
        imageUrl: prod.imageUrl,
        iconName: prod.iconName,
        description: prod.description,
        createdAt: Date.now(),
      });
    });

    await batch.commit();
    console.log('[Master Catalog] Successfully seeded base catalog to Firestore!');
  } catch (err) {
    console.error('[Master Catalog] Seeding error:', err);
  }
};

/**
 * Real-time subscription to master categories & subcategories taxonomy.
 */
export const subscribeToMasterCategories = (
  onUpdate: (categories: TaxonomyCategoryDoc[]) => void
): Unsubscribe => {
  // Trigger check seed
  seedMasterCatalogIfEmpty();

  const colRef = collection(db, CATALOG_TAXONOMY_COLLECTION);
  return onSnapshot(
    colRef,
    (snap) => {
      const items: TaxonomyCategoryDoc[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<TaxonomyCategoryDoc, 'id'>),
      }));
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      onUpdate(items);
    },
    (err) => {
      console.error('[Firebase masterCatalog] Category snapshot error:', err);
    }
  );
};

/**
 * Real-time subscription to all products in master catalog.
 */
export const subscribeToMasterProducts = (
  onUpdate: (products: Product[]) => void
): Unsubscribe => {
  seedMasterCatalogIfEmpty();

  const colRef = collection(db, MASTER_PRODUCTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snap) => {
      const items: Product[] = snap.docs.map((d) => {
        const data = d.data();
        const variants = Array.isArray(data.variants) && data.variants.length > 0
          ? data.variants
          : [{ size: 'Standard', mrp: data.mrp || 20 }];

        return {
          id: d.id,
          name: data.name || d.id,
          category: data.category as ProductCategory,
          subcategory: data.subcategory || 'General',
          variants,
          mrp: variants[0]?.mrp || 20,
          imageUrl:
            data.imageUrl ||
            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
          iconName: data.iconName || 'shopping_bag',
          description: data.description || '',
          isCustomApproved: data.isCustomApproved,
        };
      });
      onUpdate(items);
    },
    (err) => {
      console.error('[Firebase masterCatalog] Product snapshot error:', err);
    }
  );
};

// ─── CATEGORY CRUD ──────────────────────────────────────────

export const addCategoryDoc = async (categoryName: string): Promise<string> => {
  const cleanName = categoryName.trim();
  const catSlug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const catRef = doc(db, CATALOG_TAXONOMY_COLLECTION, catSlug);

  await setDoc(catRef, {
    name: cleanName,
    subcategories: [],
    order: Date.now(),
  });
  return catSlug;
};

export const renameCategoryDoc = async (
  catDocId: string,
  oldName: string,
  newName: string
): Promise<void> => {
  const cleanNewName = newName.trim();
  const catRef = doc(db, CATALOG_TAXONOMY_COLLECTION, catDocId);

  // 1. Update taxonomy doc
  await updateDoc(catRef, { name: cleanNewName });

  // 2. Batch update matching masterProducts
  const prodsRef = collection(db, MASTER_PRODUCTS_COLLECTION);
  const q = query(prodsRef, where('category', '==', oldName));
  const snap = await getDocs(q);

  if (!snap.empty) {
    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      batch.update(d.ref, { category: cleanNewName });
    });
    await batch.commit();
  }
};

export const deleteCategoryDoc = async (
  catDocId: string,
  categoryName: string,
  subcategories: string[]
): Promise<void> => {
  // Safe check 1: Subcategories exist
  if (subcategories && subcategories.length > 0) {
    throw new Error(
      `Cannot delete category '${categoryName}' because it contains ${subcategories.length} subcategory/subcategories. Move or delete them first.`
    );
  }

  // Safe check 2: Products exist under this category
  const prodsRef = collection(db, MASTER_PRODUCTS_COLLECTION);
  const q = query(prodsRef, where('category', '==', categoryName));
  const snap = await getDocs(q);

  if (!snap.empty) {
    throw new Error(
      `Cannot delete category '${categoryName}' because ${snap.size} product(s) belong to it. Move or delete those products first.`
    );
  }

  const catRef = doc(db, CATALOG_TAXONOMY_COLLECTION, catDocId);
  await deleteDoc(catRef);
};

// ─── SUBCATEGORY CRUD ──────────────────────────────────────────

export const addSubcategoryDoc = async (
  catDocId: string,
  currentSubcategories: string[],
  newSubcategoryName: string
): Promise<void> => {
  const cleanSubName = newSubcategoryName.trim();
  if (currentSubcategories.includes(cleanSubName)) return;

  const catRef = doc(db, CATALOG_TAXONOMY_COLLECTION, catDocId);
  await updateDoc(catRef, {
    subcategories: [...currentSubcategories, cleanSubName],
  });
};

export const renameSubcategoryDoc = async (
  catDocId: string,
  categoryName: string,
  currentSubcategories: string[],
  oldSubName: string,
  newSubName: string
): Promise<void> => {
  const cleanNewSub = newSubName.trim();
  const updatedSubs = currentSubcategories.map((s) => (s === oldSubName ? cleanNewSub : s));

  // 1. Update taxonomy doc
  const catRef = doc(db, CATALOG_TAXONOMY_COLLECTION, catDocId);
  await updateDoc(catRef, { subcategories: updatedSubs });

  // 2. Batch update matching masterProducts
  const prodsRef = collection(db, MASTER_PRODUCTS_COLLECTION);
  const q = query(
    prodsRef,
    where('category', '==', categoryName),
    where('subcategory', '==', oldSubName)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      batch.update(d.ref, { subcategory: cleanNewSub });
    });
    await batch.commit();
  }
};

export const moveSubcategoryDoc = async (
  sourceCatDocId: string,
  sourceCategoryName: string,
  sourceSubcategories: string[],
  targetCatDocId: string,
  targetCategoryName: string,
  targetSubcategories: string[],
  subcategoryName: string
): Promise<void> => {
  // 1. Remove from source taxonomy
  const sourceUpdated = sourceSubcategories.filter((s) => s !== subcategoryName);
  const sourceRef = doc(db, CATALOG_TAXONOMY_COLLECTION, sourceCatDocId);
  await updateDoc(sourceRef, { subcategories: sourceUpdated });

  // 2. Add to target taxonomy
  const targetUpdated = Array.from(new Set([...targetSubcategories, subcategoryName]));
  const targetRef = doc(db, CATALOG_TAXONOMY_COLLECTION, targetCatDocId);
  await updateDoc(targetRef, { subcategories: targetUpdated });

  // 3. Batch update category on products in that subcategory
  const prodsRef = collection(db, MASTER_PRODUCTS_COLLECTION);
  const q = query(
    prodsRef,
    where('category', '==', sourceCategoryName),
    where('subcategory', '==', subcategoryName)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      batch.update(d.ref, { category: targetCategoryName });
    });
    await batch.commit();
  }
};

export const deleteSubcategoryDoc = async (
  catDocId: string,
  categoryName: string,
  currentSubcategories: string[],
  subcategoryName: string
): Promise<void> => {
  // Safe Check: Check if products belong to this subcategory
  const prodsRef = collection(db, MASTER_PRODUCTS_COLLECTION);
  const q = query(
    prodsRef,
    where('category', '==', categoryName),
    where('subcategory', '==', subcategoryName)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    throw new Error(
      `Cannot delete subcategory '${subcategoryName}' because ${snap.size} product(s) belong to it. Move or delete those products first.`
    );
  }

  const updatedSubs = currentSubcategories.filter((s) => s !== subcategoryName);
  const catRef = doc(db, CATALOG_TAXONOMY_COLLECTION, catDocId);
  await updateDoc(catRef, { subcategories: updatedSubs });
};

// ─── PRODUCT CRUD ──────────────────────────────────────────

export const createProductDocInMaster = async (
  productData: Omit<Product, 'id'>
): Promise<string> => {
  const cleanName = productData.name.trim();
  const slugId = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const prodRef = doc(db, MASTER_PRODUCTS_COLLECTION, slugId);

  await setDoc(prodRef, {
    name: cleanName,
    category: productData.category,
    subcategory: productData.subcategory || 'General',
    mrp: Math.max(1, productData.mrp || 20),
    variants: productData.variants || [{ size: 'Standard', mrp: productData.mrp || 20 }],
    imageUrl:
      productData.imageUrl ||
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    iconName: productData.iconName || 'shopping_bag',
    description: productData.description || '',
    createdAt: Date.now(),
  });
  return slugId;
};

export const updateProductDocInMaster = async (
  productId: string,
  updates: Partial<Product>
): Promise<void> => {
  const prodRef = doc(db, MASTER_PRODUCTS_COLLECTION, productId);
  await updateDoc(prodRef, {
    ...updates,
    updatedAt: Date.now(),
  });
};

export const moveProductDocInMaster = async (
  productId: string,
  targetCategory: ProductCategory,
  targetSubcategory: string
): Promise<void> => {
  const prodRef = doc(db, MASTER_PRODUCTS_COLLECTION, productId);
  await updateDoc(prodRef, {
    category: targetCategory,
    subcategory: targetSubcategory.trim(),
    updatedAt: Date.now(),
  });
};

/**
 * Delete product with active listings safety check.
 */
export const deleteProductDocFromMaster = async (
  productId: string,
  productName: string
): Promise<void> => {
  // SAFE CHECK: Check if active listings exist in Firestore for this productId or productName
  const listingsColRef = collection(db, LISTINGS_COLLECTION);
  const q1 = query(listingsColRef, where('productId', '==', productId));
  const snap1 = await getDocs(q1);

  const q2 = query(listingsColRef, where('unverifiedProductName', '==', productName));
  const snap2 = await getDocs(q2);

  const activeListingIds = new Set<string>();
  snap1.docs.forEach((d) => activeListingIds.add(d.id));
  snap2.docs.forEach((d) => activeListingIds.add(d.id));

  if (activeListingIds.size > 0) {
    throw new Error(
      `Cannot delete '${productName}' because ${activeListingIds.size} active listing(s) in Firestore currently reference it.`
    );
  }

  const prodRef = doc(db, MASTER_PRODUCTS_COLLECTION, productId);
  await deleteDoc(prodRef);
};

/**
 * Update variants array for a master catalog product.
 */
export const updateProductVariantsInMaster = async (
  productId: string,
  variants: { size: string; mrp: number }[]
): Promise<void> => {
  const prodRef = doc(db, MASTER_PRODUCTS_COLLECTION, productId);
  await updateDoc(prodRef, {
    variants,
    updatedAt: Date.now(),
  });
};

/**
 * Remove a specific variant size from a master catalog product with live listings check.
 */
export const removeVariantFromProductDoc = async (
  productId: string,
  variantSize: string,
  currentVariants: { size: string; mrp: number }[]
): Promise<void> => {
  // Safeguard: Check if live listings currently reference this productId + variantSize
  const listingsColRef = collection(db, LISTINGS_COLLECTION);
  const q = query(
    listingsColRef,
    where('productId', '==', productId),
    where('variantSize', '==', variantSize)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    throw new Error(
      `Cannot remove variant '${variantSize}' because ${snap.size} active listing(s) in Firestore currently reference this size variant.`
    );
  }

  const updatedVariants = currentVariants.filter((v) => v.size !== variantSize);
  if (updatedVariants.length === 0) {
    throw new Error('A product must have at least one size variant.');
  }

  const prodRef = doc(db, MASTER_PRODUCTS_COLLECTION, productId);
  await updateDoc(prodRef, {
    variants: updatedVariants,
    updatedAt: Date.now(),
  });
};
