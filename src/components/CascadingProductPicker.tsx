import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, ProductVariant } from '../types/catalog';
import { subscribeToMasterCategories, TaxonomyCategoryDoc } from '../firebase/masterCatalog';
import { createProductRequestDoc } from '../firebase/productRequests';

interface CascadingProductPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (
    product: Product,
    selectedVariant?: ProductVariant,
    isUnverified?: boolean,
    requestedName?: string
  ) => void;
  allProducts: Product[];
  currentUserId?: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  'Chips & Wafers': 'lunch_dining',
  'Chips, Munchies & Wafers': 'lunch_dining',
  'Namkeen & Bhujia': 'grain',
  'Instant Food': 'ramen_dining',
  'Biscuits & Cookies': 'cookie',
  'Chocolates & Sweets': 'cake',
  'Cold Drinks & Juices': 'local_drink',
  'Energy & Health Drinks': 'bolt',
  'Dairy & Milk-Based': 'water_drop',
  'Ice Cream & Frozen Desserts': 'icecream',
  'Bread, Buns & Bakery': 'bakery_dining',
};

export const CascadingProductPicker: React.FC<CascadingProductPickerProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  allProducts,
  currentUserId,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedProductObj, setSelectedProductObj] = useState<Product | null>(null);
  const [taxonomyCategories, setTaxonomyCategories] = useState<TaxonomyCategoryDoc[]>([]);

  // Request New Product modal state
  const [isRequestingNew, setIsRequestingNew] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductSize, setNewProductSize] = useState('Standard');
  const [newProductSellingPrice, setNewProductSellingPrice] = useState<number>(20);
  const [newProductMrp, setNewProductMrp] = useState<number>(20);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestError, setRequestError] = useState('');

  // Subscribe to real-time master categories & subcategories taxonomy from Firestore
  useEffect(() => {
    const unsub = subscribeToMasterCategories((items) => {
      setTaxonomyCategories(items);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  // Dynamic Categories from Firestore taxonomy collection (fallback to active products if empty)
  const categoriesList =
    taxonomyCategories.length > 0
      ? (taxonomyCategories.map((c) => c.name) as ProductCategory[])
      : (Array.from(new Set(allProducts.map((p) => p.category).filter(Boolean))) as ProductCategory[]);

  // Filter products by selected category
  const categoryProducts = selectedCategory
    ? allProducts.filter((p) => p.category === selectedCategory)
    : [];

  // Extract unique subcategories from taxonomy + active products for selected category
  const matchedTaxDoc = taxonomyCategories.find((c) => c.name === selectedCategory);
  const taxonomySubcats = matchedTaxDoc ? matchedTaxDoc.subcategories : [];
  const productSubcats = categoryProducts.map((p) => p.subcategory || 'General');
  const availableSubcategories = Array.from(
    new Set([...taxonomySubcats, ...productSubcats])
  ).filter(Boolean);

  // Filter products for step 3
  const finalProducts = categoryProducts.filter(
    (p) => (p.subcategory || 'General') === selectedSubcategory
  );

  const handleSelectCategory = (cat: ProductCategory) => {
    setSelectedCategory(cat);
    setStep(2);
  };

  const handleSelectSubcategory = (sub: string) => {
    setSelectedSubcategory(sub);
    setStep(3);
  };

  const handleSelectProduct = (product: Product) => {
    const variants = Array.isArray(product.variants) && product.variants.length > 0
      ? product.variants
      : [{ size: 'Standard', mrp: product.mrp || 20 }];

    if (variants.length === 1) {
      onSelectProduct(product, variants[0]);
      onClose();
    } else {
      setSelectedProductObj(product);
      setStep(4);
    }
  };

  const handleSelectVariant = (product: Product, variant: ProductVariant) => {
    onSelectProduct(product, variant);
    onClose();
  };

  const handleReset = () => {
    setStep(1);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedProductObj(null);
    setIsRequestingNew(false);
    setNewProductName('');
    setNewProductSize('Standard');
    setNewProductSellingPrice(20);
    setNewProductMrp(20);
    setRequestError('');
  };

  const handleOpenRequestNew = () => {
    setIsRequestingNew(true);
    setNewProductName('');
    setNewProductSize('Standard');
    setNewProductSellingPrice(20);
    setNewProductMrp(20);
    setRequestError('');
  };

  const handleSubmitNewProductRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) {
      setRequestError('Please enter a product name.');
      return;
    }

    setIsSubmittingRequest(true);
    setRequestError('');
    try {
      const nameClean = newProductName.trim();
      const sizeClean = newProductSize.trim() || 'Standard';
      const requestId = await createProductRequestDoc(
        nameClean,
        currentUserId || 'anonymous',
        sizeClean,
        newProductSellingPrice,
        newProductMrp
      );

      const variant: ProductVariant = { size: sizeClean, mrp: newProductMrp };

      // Build synthetic unverified product
      const syntheticProduct: Product = {
        id: requestId,
        name: nameClean,
        category: selectedCategory || (categoriesList[0] || ('General' as ProductCategory)),
        subcategory: selectedSubcategory || 'Custom Request',
        variants: [variant],
        mrp: newProductMrp,
        imageUrl:
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        iconName: 'help_outline',
        description: 'Unverified user product request (pending admin approval).',
        isUnverified: true,
      };

      onSelectProduct(syntheticProduct, variant, true, nameClean);
      handleReset();
      onClose();
    } catch (err: any) {
      console.error('Failed to submit product request:', err);
      setRequestError(err.message || 'Failed to submit request.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121414] border border-primary-container/40 rounded-3xl p-5 w-full max-w-md flex flex-col gap-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-[#242626]">
          <div className="flex items-center gap-2">
            {step > 1 && !isRequestingNew && (
              <button
                type="button"
                onClick={() => {
                  if (step === 4) setStep(3);
                  else if (step === 3) setStep(2);
                  else if (step === 2) setStep(1);
                }}
                className="w-8 h-8 rounded-full bg-[#1e2020] flex items-center justify-center text-primary-container hover:bg-primary-container/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
              </button>
            )}
            <h2 className="text-base font-extrabold text-white uppercase tracking-tight italic">
              {isRequestingNew
                ? 'Request a New Product'
                : step === 1
                ? 'Select Category (1/4)'
                : step === 2
                ? `${selectedCategory} (2/4)`
                : step === 3
                ? `${selectedSubcategory} (3/4)`
                : `Select Pack Size (4/4)`}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="text-on-surface-variant hover:text-white w-8 h-8 rounded-full bg-[#1e2020] flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* STEP CONTENT */}
        {!isRequestingNew ? (
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 max-h-[60vh]">
            {/* STEP 1: CATEGORY PICKER */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categoriesList.map((cat) => {
                  const count = allProducts.filter((p) => p.category === cat).length;
                  const icon = CATEGORY_ICONS[cat] || 'grid_view';

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className="bg-[#181a1a] hover:bg-[#222424] border border-[#2a2c2c] hover:border-primary-container/60 rounded-2xl p-3.5 flex items-center justify-between text-left transition-all active:scale-[0.98] cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container group-hover:bg-primary-container group-hover:text-black transition-colors">
                          <span className="material-symbols-outlined text-xl">{icon}</span>
                        </div>
                        <div>
                          <h3 className="text-xs font-extrabold text-white group-hover:text-primary-container transition-colors">
                            {cat}
                          </h3>
                          <span className="text-[10px] text-on-surface-variant">
                            {count} products
                          </span>
                        </div>
                      </div>

                      <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary-container transition-colors text-base">
                        chevron_right
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* STEP 2: SUBCATEGORY PICKER */}
            {step === 2 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-on-surface-variant mb-1">
                  Choose subcategory under <strong className="text-white">{selectedCategory}</strong>:
                </p>
                {availableSubcategories.length === 0 ? (
                  <p className="text-xs font-semibold text-on-surface-variant py-4 text-center">
                    No subcategories available yet. Use "Request a New Product" below!
                  </p>
                ) : (
                  availableSubcategories.map((sub) => {
                    const subCount = categoryProducts.filter(
                      (p) => (p.subcategory || 'General') === sub
                    ).length;

                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => handleSelectSubcategory(sub)}
                        className="bg-[#181a1a] hover:bg-[#222424] border border-[#2a2c2c] hover:border-primary-container/60 rounded-2xl p-4 flex items-center justify-between text-left transition-all active:scale-[0.98] cursor-pointer group"
                      >
                        <div>
                          <h3 className="text-sm font-extrabold text-white group-hover:text-primary-container transition-colors">
                            {sub}
                          </h3>
                          <span className="text-[11px] text-on-surface-variant font-mono">
                            {subCount} {subCount === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary-container text-lg">
                          arrow_forward
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {/* STEP 3: EXACT PRODUCT PICKER */}
            {step === 3 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-on-surface-variant mb-1">
                  Select exact product from <strong className="text-white">{selectedSubcategory}</strong>:
                </p>
                {finalProducts.length === 0 ? (
                  <p className="text-xs font-semibold text-on-surface-variant py-4 text-center">
                    No products in this subcategory yet. Use "Request a New Product" below!
                  </p>
                ) : (
                  finalProducts.map((prod) => {
                    const variants = Array.isArray(prod.variants) && prod.variants.length > 0
                      ? prod.variants
                      : [{ size: 'Standard', mrp: prod.mrp || 20 }];

                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleSelectProduct(prod)}
                        className="bg-[#181a1a] hover:bg-[#222424] border border-[#2a2c2c] hover:border-primary-container/60 rounded-2xl p-3 flex items-center justify-between text-left transition-all active:scale-[0.98] cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-10 h-10 object-contain rounded-xl bg-black/40 p-1 border border-[#333535]"
                          />
                          <div>
                            <h3 className="text-xs font-bold text-white group-hover:text-primary-container transition-colors">
                              {prod.name}
                            </h3>
                            <span className="text-[11px] font-mono text-primary-container">
                              {variants.length > 1
                                ? `${variants.length} Pack Sizes Available`
                                : `${variants[0].size} • MRP ₹${variants[0].mrp}`}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-black bg-primary-container px-3 py-1 rounded-full uppercase tracking-wider group-hover:brightness-110">
                          {variants.length > 1 ? 'Choose Size' : 'Select'}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {/* STEP 4: PACK SIZE VARIANT PICKER */}
            {step === 4 && selectedProductObj && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 p-3 bg-[#181a1a] border border-[#2a2c2c] rounded-2xl mb-2">
                  <img
                    src={selectedProductObj.imageUrl}
                    alt={selectedProductObj.name}
                    className="w-12 h-12 object-contain rounded-xl bg-black/40 p-1 border border-[#333535]"
                  />
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      {selectedProductObj.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Select which pack size you are listing:
                    </p>
                  </div>
                </div>

                {((Array.isArray(selectedProductObj.variants) && selectedProductObj.variants.length > 0)
                  ? selectedProductObj.variants
                  : [{ size: 'Standard', mrp: selectedProductObj.mrp || 20 }]
                ).map((variant, index) => (
                  <button
                    key={`${variant.size}-${index}`}
                    type="button"
                    onClick={() => handleSelectVariant(selectedProductObj, variant)}
                    className="bg-[#1e2020] hover:bg-[#282a2b] border border-primary-container/40 hover:border-primary-container rounded-2xl p-4 flex justify-between items-center transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-extrabold text-white group-hover:text-primary-container">
                        {variant.size} Pack
                      </span>
                      <span className="text-xs text-on-surface-variant font-mono">
                        Maximum Retail Price (MRP)
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-primary-container font-mono">
                        MRP ₹{variant.mrp}
                      </span>
                      <span className="text-[10px] font-bold text-black bg-primary-container px-2.5 py-0.5 rounded-full uppercase block mt-1">
                        Select Size
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* REQUEST A NEW PRODUCT FORM */
          <form onSubmit={handleSubmitNewProductRequest} className="flex flex-col gap-4 py-2 overflow-y-auto max-h-[60vh]">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Don't see what you want to sell/suggest? Submit the product details below. You can start
              listing it right away with an <strong className="text-amber-400">Unverified</strong> tag until admin approval!
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-primary-container uppercase tracking-wider">
                Product Name
              </label>
              <input
                type="text"
                placeholder="e.g. Lay's Gourmet Cheese & Herbs"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-bold rounded-2xl px-4 py-3 focus:outline-none focus:border-primary-container text-sm"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-primary-container uppercase tracking-wider">
                Pack Size / Weight
              </label>
              <input
                type="text"
                placeholder="e.g. 50g, 1L, Pack of 6"
                value={newProductSize}
                onChange={(e) => setNewProductSize(e.target.value)}
                className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-bold rounded-2xl px-4 py-3 focus:outline-none focus:border-primary-container text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-primary-container uppercase tracking-wider">
                  Selling Price (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  value={newProductSellingPrice}
                  onChange={(e) => setNewProductSellingPrice(Number(e.target.value))}
                  className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-bold rounded-2xl px-4 py-3 focus:outline-none focus:border-primary-container text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-primary-container uppercase tracking-wider">
                  MRP (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  value={newProductMrp}
                  onChange={(e) => setNewProductMrp(Number(e.target.value))}
                  className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-bold rounded-2xl px-4 py-3 focus:outline-none focus:border-primary-container text-sm"
                />
              </div>
            </div>

            {requestError && (
              <div className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 p-2.5 rounded-xl">
                {requestError}
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsRequestingNew(false)}
                className="flex-1 py-3 rounded-full font-bold text-xs uppercase tracking-wider text-on-surface-variant bg-[#1e2020] hover:bg-[#282a2b] transition-all cursor-pointer"
              >
                Back to List
              </button>
              <button
                type="submit"
                disabled={isSubmittingRequest}
                className="flex-1 py-3 rounded-full font-extrabold text-xs uppercase tracking-wider text-black bg-primary-container neon-glow active:scale-95 transition-all cursor-pointer"
              >
                {isSubmittingRequest ? 'Submitting...' : 'Submit & Select'}
              </button>
            </div>
          </form>
        )}

        {/* BOTTOM ACTION BAR - REQUEST A NEW PRODUCT BUTTON */}
        {!isRequestingNew && (
          <div className="pt-3 border-t border-[#242626] flex justify-between items-center">
            <button
              type="button"
              onClick={handleOpenRequestNew}
              className="text-xs font-extrabold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer hover:underline"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>Can't find your snack? Request a New Product</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
