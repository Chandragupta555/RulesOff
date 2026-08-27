import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ADMIN_EMAIL, isAdminEmail } from '../config/admin';
import { ProductCategory, Product, ProductVariant } from '../types/catalog';
import { MOCK_PRODUCTS } from '../data/mockCatalog';
import {
  ProductRequestDoc,
  subscribeToProductRequests,
  approveProductRequestDoc,
  approveProductRequestAsVariantDoc,
  rejectProductRequestDoc
} from '../firebase/productRequests';
import {
  TaxonomyCategoryDoc,
  subscribeToMasterCategories,
  subscribeToMasterProducts,
  addCategoryDoc,
  renameCategoryDoc,
  deleteCategoryDoc,
  addSubcategoryDoc,
  renameSubcategoryDoc,
  moveSubcategoryDoc,
  deleteSubcategoryDoc,
  createProductDocInMaster,
  updateProductDocInMaster,
  moveProductDocInMaster,
  deleteProductDocFromMaster,
  updateProductVariantsInMaster,
  removeVariantFromProductDoc
} from '../firebase/masterCatalog';

export const AdminScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useUser();

  const [activeTab, setActiveTab] = useState<'requests' | 'catalog'>('catalog');

  // Real-time Firestore State
  const [requests, setRequests] = useState<ProductRequestDoc[]>([]);
  const [categories, setCategories] = useState<TaxonomyCategoryDoc[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // UI Feedback Banner
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pending Request Approve Modal State
  const [selectedRequest, setSelectedRequest] = useState<ProductRequestDoc | null>(null);
  const [approveMode, setApproveMode] = useState<'new' | 'variant'>('new');
  const [targetExistingProductId, setTargetExistingProductId] = useState<string>('');
  const [approveCategory, setApproveCategory] = useState<ProductCategory>('Chips & Wafers');
  const [approveSubcategory, setApproveSubcategory] = useState<string>('');
  const [isApproveNewSub, setIsApproveNewSub] = useState(false);
  const [approveNewSubName, setApproveNewSubName] = useState('');
  const [approveSize, setApproveSize] = useState<string>('Standard');
  const [approveMrp, setApproveMrp] = useState<number>(20);

  // Variant Management Modal State
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariantProd, setEditingVariantProd] = useState<Product | null>(null);
  const [variantInputs, setVariantInputs] = useState<ProductVariant[]>([]);

  // Category Modal State (Add / Rename)
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catModalMode, setCatModalMode] = useState<'add' | 'rename'>('add');
  const [editingCatDocId, setEditingCatDocId] = useState('');
  const [catNameInput, setCatNameInput] = useState('');
  const [oldCatName, setOldCatName] = useState('');

  // Subcategory Modal State (Add / Rename / Move)
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subModalMode, setSubModalMode] = useState<'add' | 'rename' | 'move'>('add');
  const [targetCatDocId, setTargetCatDocId] = useState('');
  const [targetCatName, setTargetCatName] = useState('');
  const [subNameInput, setSubNameInput] = useState('');
  const [oldSubName, setOldSubName] = useState('');
  const [moveTargetCatDocId, setMoveTargetCatDocId] = useState('');

  // Product Modal State (Edit / Move / Add)
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [prodNameInput, setProdNameInput] = useState('');
  const [prodMrpInput, setProdMrpInput] = useState(20);
  const [prodDescInput, setProdDescInput] = useState('');
  const [prodCatInput, setProdCatInput] = useState<ProductCategory>('Chips & Wafers');
  const [prodSubInput, setProdSubInput] = useState('General');

  // Submitting Spinner State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subscribe to real-time collections
  useEffect(() => {
    const unsubReqs = subscribeToProductRequests((items) => {
      setRequests(items);
    });

    const unsubCats = subscribeToMasterCategories((items) => {
      setCategories(items);
    });

    const unsubProds = subscribeToMasterProducts((items) => {
      setProducts(items);
    });

    return () => {
      unsubReqs();
      unsubCats();
      unsubProds();
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-[#050505] min-h-screen w-full flex items-center justify-center text-primary-container">
        <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
      </div>
    );
  }

  // Security Guard: Check Admin Email
  if (!isAdminEmail(user.email)) {
    return (
      <div className="bg-[#121414] min-h-screen w-full flex items-center justify-center p-4 select-none">
        <div className="bg-[#121212] border border-red-500/40 rounded-3xl p-6 w-full max-w-md flex flex-col items-center gap-4 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
          </div>
          <h1 className="text-xl font-extrabold text-white uppercase tracking-wide">
            Admin Access Denied
          </h1>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            This screen is strictly restricted to administrator <strong className="text-white">{ADMIN_EMAIL}</strong>. You are currently signed in as <strong className="text-white">{user.email || 'Guest User'}</strong>.
          </p>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-full py-3 mt-2 rounded-full font-bold text-xs uppercase tracking-wider text-black bg-primary-container neon-glow active:scale-95 transition-all cursor-pointer"
          >
            Return to Profile
          </button>
        </div>
      </div>
    );
  }

  const allProductsList = products.length > 0 ? products : MOCK_PRODUCTS;
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  const showFeedback = (msg: string, isError: boolean = false) => {
    if (isError) {
      setErrorMsg(msg);
      setSuccessMsg('');
    } else {
      setSuccessMsg(msg);
      setErrorMsg('');
    }
    setTimeout(() => {
      setErrorMsg('');
      setSuccessMsg('');
    }, 4000);
  };

  // ─── PENDING REQUEST HANDLERS ──────────────────────────────────────────

  const handleOpenApproveModal = (req: ProductRequestDoc) => {
    setSelectedRequest(req);
    setApproveMode('new');
    setTargetExistingProductId(allProductsList[0]?.id || '');
    setApproveCategory('Chips & Wafers');
    setIsApproveNewSub(false);
    setApproveNewSubName('');
    setApproveSize(req.size || 'Standard');
    setApproveMrp(req.mrp || 20);

    const firstCat = categories.find((c) => c.name === 'Chips & Wafers');
    setApproveSubcategory(firstCat?.subcategories[0] || 'General');
  };

  const handleConfirmApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !selectedRequest.id) return;

    setIsSubmitting(true);
    try {
      if (approveMode === 'new') {
        const subToSave = isApproveNewSub ? approveNewSubName.trim() : approveSubcategory.trim();
        if (!subToSave) {
          showFeedback('Please specify a subcategory.', true);
          return;
        }
        await approveProductRequestDoc(
          selectedRequest.id,
          selectedRequest.productName,
          approveCategory,
          subToSave,
          approveSize,
          approveMrp
        );
        showFeedback(`Approved "${selectedRequest.productName}" (${approveSize}) into master catalog!`);
      } else {
        if (!targetExistingProductId) {
          showFeedback('Please select an existing product.', true);
          return;
        }
        await approveProductRequestAsVariantDoc(
          selectedRequest.id,
          targetExistingProductId,
          approveSize,
          approveMrp
        );
        showFeedback(`Added variant "${approveSize}" (MRP ₹${approveMrp}) to existing product!`);
      }
      setSelectedRequest(null);
    } catch (err: any) {
      showFeedback(err.message || 'Failed to approve request.', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── VARIANT MANAGEMENT HANDLERS ──────────────────────────────────────

  const handleOpenVariantModal = (prod: Product) => {
    setEditingVariantProd(prod);
    const variants = Array.isArray(prod.variants) && prod.variants.length > 0
      ? prod.variants.map((v) => ({ ...v }))
      : [{ size: 'Standard', mrp: prod.mrp || 20 }];
    setVariantInputs(variants);
    setIsVariantModalOpen(true);
  };

  const handleAddVariantInput = () => {
    setVariantInputs((prev) => [...prev, { size: 'New Size', mrp: 20 }]);
  };

  const handleUpdateVariantInput = (index: number, field: 'size' | 'mrp', val: string | number) => {
    setVariantInputs((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: val } : v))
    );
  };

  const handleDeleteVariantInput = async (index: number, variantSize: string) => {
    if (!editingVariantProd) return;

    if (variantInputs.length <= 1) {
      showFeedback('A product must have at least one size variant.', true);
      return;
    }

    try {
      await removeVariantFromProductDoc(editingVariantProd.id, variantSize, variantInputs);
      setVariantInputs((prev) => prev.filter((_, i) => i !== index));
      showFeedback(`Removed variant "${variantSize}" successfully.`);
    } catch (err: any) {
      showFeedback(err.message || 'Failed to remove variant.', true);
    }
  };

  const handleSaveVariants = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariantProd) return;

    // Validate size labels and MRP
    for (const v of variantInputs) {
      if (!v.size.trim()) {
        showFeedback('Variant size label cannot be empty.', true);
        return;
      }
      if (v.mrp < 1) {
        showFeedback('Variant MRP must be at least ₹1.', true);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const cleanVariants = variantInputs.map((v) => ({
        size: v.size.trim(),
        mrp: Number(v.mrp),
      }));
      await updateProductVariantsInMaster(editingVariantProd.id, cleanVariants);
      showFeedback(`Updated variants for "${editingVariantProd.name}".`);
      setIsVariantModalOpen(false);
      setEditingVariantProd(null);
    } catch (err: any) {
      showFeedback(err.message || 'Failed to update variants.', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectRequest = async (reqId?: string) => {
    if (!reqId) return;
    if (window.confirm('Reject this product request? (Original listing stays unverified)')) {
      try {
        await rejectProductRequestDoc(reqId);
        showFeedback('Product request rejected.');
      } catch (err: any) {
        showFeedback(err.message || 'Failed to reject request.', true);
      }
    }
  };

  // ─── CATEGORY HANDLERS ──────────────────────────────────────────

  const handleOpenAddCategory = () => {
    setCatModalMode('add');
    setCatNameInput('');
    setIsCatModalOpen(true);
  };

  const handleOpenRenameCategory = (cat: TaxonomyCategoryDoc) => {
    setCatModalMode('rename');
    setEditingCatDocId(cat.id || '');
    setCatNameInput(cat.name);
    setOldCatName(cat.name);
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameInput.trim()) return;

    setIsSubmitting(true);
    try {
      if (catModalMode === 'add') {
        await addCategoryDoc(catNameInput.trim());
        showFeedback(`Category "${catNameInput.trim()}" added!`);
      } else {
        await renameCategoryDoc(editingCatDocId, oldCatName, catNameInput.trim());
        showFeedback(`Renamed category to "${catNameInput.trim()}".`);
      }
      setIsCatModalOpen(false);
    } catch (err: any) {
      showFeedback(err.message || 'Failed to save category.', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat: TaxonomyCategoryDoc) => {
    if (!cat.id) return;
    if (window.confirm(`Delete Category "${cat.name}"?`)) {
      try {
        await deleteCategoryDoc(cat.id, cat.name, cat.subcategories || []);
        showFeedback(`Deleted Category "${cat.name}".`);
      } catch (err: any) {
        showFeedback(err.message || 'Failed to delete category.', true);
      }
    }
  };

  // ─── SUBCATEGORY HANDLERS ──────────────────────────────────────────

  const handleOpenAddSubcategory = (cat: TaxonomyCategoryDoc) => {
    setSubModalMode('add');
    setTargetCatDocId(cat.id || '');
    setTargetCatName(cat.name);
    setSubNameInput('');
    setIsSubModalOpen(true);
  };

  const handleOpenRenameSubcategory = (cat: TaxonomyCategoryDoc, subName: string) => {
    setSubModalMode('rename');
    setTargetCatDocId(cat.id || '');
    setTargetCatName(cat.name);
    setOldSubName(subName);
    setSubNameInput(subName);
    setIsSubModalOpen(true);
  };

  const handleOpenMoveSubcategory = (cat: TaxonomyCategoryDoc, subName: string) => {
    setSubModalMode('move');
    setTargetCatDocId(cat.id || '');
    setTargetCatName(cat.name);
    setOldSubName(subName);

    const otherCats = categories.filter((c) => c.name !== cat.name);
    setMoveTargetCatDocId(otherCats[0]?.id || '');
    setIsSubModalOpen(true);
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const currentCat = categories.find((c) => c.id === targetCatDocId);
      const currentSubs = currentCat?.subcategories || [];

      if (subModalMode === 'add') {
        await addSubcategoryDoc(targetCatDocId, currentSubs, subNameInput.trim());
        showFeedback(`Added subcategory "${subNameInput.trim()}" under ${targetCatName}.`);
      } else if (subModalMode === 'rename') {
        await renameSubcategoryDoc(
          targetCatDocId,
          targetCatName,
          currentSubs,
          oldSubName,
          subNameInput.trim()
        );
        showFeedback(`Renamed subcategory "${oldSubName}" to "${subNameInput.trim()}".`);
      } else if (subModalMode === 'move') {
        const destCat = categories.find((c) => c.id === moveTargetCatDocId);
        if (!destCat || !destCat.id) {
          throw new Error('Please select a target category.');
        }

        await moveSubcategoryDoc(
          targetCatDocId,
          targetCatName,
          currentSubs,
          destCat.id,
          destCat.name,
          destCat.subcategories || [],
          oldSubName
        );
        showFeedback(`Moved subcategory "${oldSubName}" to "${destCat.name}".`);
      }
      setIsSubModalOpen(false);
    } catch (err: any) {
      showFeedback(err.message || 'Failed to process subcategory action.', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubcategory = async (cat: TaxonomyCategoryDoc, subName: string) => {
    if (!cat.id) return;
    if (window.confirm(`Delete Subcategory "${subName}" under ${cat.name}?`)) {
      try {
        await deleteSubcategoryDoc(cat.id, cat.name, cat.subcategories || [], subName);
        showFeedback(`Deleted Subcategory "${subName}".`);
      } catch (err: any) {
        showFeedback(err.message || 'Failed to delete subcategory.', true);
      }
    }
  };

  // ─── PRODUCT HANDLERS ──────────────────────────────────────────

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProd(prod);
    setProdNameInput(prod.name);
    setProdMrpInput(prod.mrp || (prod.variants && prod.variants[0]?.mrp) || 20);
    setProdDescInput(prod.description || '');
    setProdCatInput(prod.category);
    setProdSubInput(prod.subcategory || 'General');
    setIsProdModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProd) return;

    if (prodMrpInput < 1) {
      showFeedback('MRP must be at least ₹1.', true);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProductDocInMaster(editingProd.id, {
        name: prodNameInput.trim(),
        mrp: prodMrpInput,
        description: prodDescInput.trim(),
        category: prodCatInput,
        subcategory: prodSubInput.trim(),
      });
      showFeedback(`Updated product "${prodNameInput.trim()}" successfully.`);
      setIsProdModalOpen(false);
    } catch (err: any) {
      showFeedback(err.message || 'Failed to update product.', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (prod: Product) => {
    if (window.confirm(`Delete product "${prod.name}" permanently from master catalog?`)) {
      try {
        await deleteProductDocFromMaster(prod.id, prod.name);
        showFeedback(`Deleted product "${prod.name}".`);
      } catch (err: any) {
        // Safe check caught active listings referencing product
        showFeedback(err.message || 'Failed to delete product.', true);
      }
    }
  };

  return (
    <div className="font-sans min-h-screen w-full flex flex-col select-none bg-[#121414] text-[#e2e2e2] pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#121414]/90 backdrop-blur-xl border-b border-[#333535]/30 flex flex-col justify-center w-full px-4 pt-3 pb-2">
        <div className="flex justify-between items-center w-full mb-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-[#1e2020] flex items-center justify-center text-primary-container hover:bg-primary-container/20 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </button>
            <h1 className="text-lg font-extrabold text-primary-container tracking-tight italic uppercase drop-shadow-[0_0_8px_rgba(255,95,31,0.4)]">
              Admin Catalog Moderation
            </h1>
          </div>
          <span className="text-[11px] font-semibold text-primary-container bg-primary-container/10 px-3 py-1 rounded-full border border-primary-container/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
            Admin
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#1e2020] rounded-full p-1 border border-[#333535]/40">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-primary-container text-black neon-glow shadow-md'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Catalog Taxonomy
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'requests'
                ? 'bg-primary-container text-black neon-glow shadow-md'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span>Requests</span>
            {pendingRequests.length > 0 && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-400 text-black">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="w-full px-4 pt-4 flex flex-col gap-5 max-w-md mx-auto flex-1">
        {/* FEEDBACK ALERT BANNERS */}
        {errorMsg && (
          <div className="bg-red-500/15 border border-red-500/40 rounded-2xl p-3.5 flex items-center gap-2 text-red-300 font-extrabold text-xs animate-fade-in shadow-lg">
            <span className="material-symbols-outlined text-lg text-red-400">warning</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-500/15 border border-green-500/40 rounded-2xl p-3.5 flex items-center gap-2 text-green-300 font-extrabold text-xs animate-fade-in shadow-lg">
            <span className="material-symbols-outlined text-lg text-green-400">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: CATALOG TAXONOMY CURATION */}
        {activeTab === 'catalog' && (
          <div className="flex flex-col gap-4">
            {/* Header & Add Category Action */}
            <div className="flex justify-between items-center bg-[#121212] border border-[#1F1F1F] rounded-3xl p-4">
              <div>
                <h2 className="text-base font-extrabold text-white">Full Catalog Taxonomy</h2>
                <p className="text-xs text-on-surface-variant">
                  {categories.length} Categories • {allProductsList.length} Total Products
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddCategory}
                className="bg-primary-container text-black font-extrabold text-xs px-3.5 py-2 rounded-full uppercase tracking-wider neon-glow hover:brightness-110 flex items-center gap-1 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <span>+ Category</span>
              </button>
            </div>

            {/* TAXONOMY TREE ACCORDION / CARDS */}
            <div className="flex flex-col gap-4">
              {categories.map((cat) => {
                const catProducts = allProductsList.filter((p) => p.category === cat.name);
                const subList = cat.subcategories && cat.subcategories.length > 0
                  ? cat.subcategories
                  : Array.from(new Set(catProducts.map((p) => p.subcategory || 'General')));

                return (
                  <div
                    key={cat.id || cat.name}
                    className="bg-[#121212] border border-[#1F1F1F] rounded-3xl p-4 flex flex-col gap-3 shadow-lg"
                  >
                    {/* Category Header */}
                    <div className="flex justify-between items-center pb-2 border-b border-[#1F1F1F]">
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-primary-container text-xl">
                          category
                        </span>
                        <div>
                          <h3 className="text-base font-extrabold text-white leading-tight">
                            {cat.name}
                          </h3>
                          <span className="text-[10px] text-on-surface-variant font-mono">
                            {subList.length} subcategories • {catProducts.length} items
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenAddSubcategory(cat)}
                          className="text-[10px] font-bold text-primary-container bg-primary-container/10 border border-primary-container/30 hover:bg-primary-container hover:text-black px-2.5 py-1 rounded-full uppercase cursor-pointer transition-all"
                          title="Add Subcategory"
                        >
                          + Sub
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenRenameCategory(cat)}
                          className="w-7 h-7 rounded-lg bg-[#1e2020] hover:bg-[#282a2b] border border-[#333535] text-on-surface flex items-center justify-center cursor-pointer"
                          title="Rename Category"
                        >
                          <span className="material-symbols-outlined text-xs">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center cursor-pointer"
                          title="Delete Category"
                        >
                          <span className="material-symbols-outlined text-xs">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* SUBCATEGORIES LIST */}
                    {subList.length === 0 ? (
                      <p className="text-xs italic text-on-surface-variant/70 text-center py-2">
                        No subcategories. Click "+ Sub" above to create one.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-3 pt-1">
                        {subList.map((subName) => {
                          const subProds = catProducts.filter(
                            (p) => (p.subcategory || 'General') === subName
                          );

                          return (
                            <div
                              key={subName}
                              className="bg-[#181a1a] border border-[#2a2c2c] rounded-2xl p-3 flex flex-col gap-2"
                            >
                              {/* Subcategory Bar */}
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-extrabold text-primary-container">
                                    📁 {subName}
                                  </span>
                                  <span className="text-[10px] text-on-surface-variant font-mono">
                                    ({subProds.length})
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenRenameSubcategory(cat, subName)}
                                    className="text-[10px] font-semibold text-on-surface-variant hover:text-white px-2 py-0.5 rounded bg-[#242626] border border-[#333535] cursor-pointer"
                                  >
                                    Rename
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenMoveSubcategory(cat, subName)}
                                    className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 px-2 py-0.5 rounded cursor-pointer"
                                  >
                                    Move
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSubcategory(cat, subName)}
                                    className="text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 px-1.5 py-0.5 rounded cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>

                              {/* Products List in Subcategory */}
                              {subProds.length === 0 ? (
                                <p className="text-[11px] text-on-surface-variant/60 italic px-1">
                                  No items in this subcategory.
                                </p>
                              ) : (
                                <div className="flex flex-col gap-1.5 pt-1">
                                  {subProds.map((prod) => (
                                    <div
                                      key={prod.id}
                                      className="bg-[#121414] border border-[#242626] hover:border-primary-container/40 rounded-xl p-2.5 flex items-center justify-between transition-all"
                                    >
                                      <div className="flex items-center gap-2.5 truncate pr-2">
                                        <img
                                          src={prod.imageUrl}
                                          alt={prod.name}
                                          className="w-8 h-8 object-contain rounded-lg bg-black/40 p-0.5 border border-[#333535] shrink-0"
                                        />
                                        <div className="truncate">
                                          <h4 className="text-xs font-extrabold text-white truncate">
                                            {prod.name}
                                          </h4>
                                          <span className="text-[10px] text-primary-container font-mono block truncate">
                                            {prod.variants && prod.variants.length > 0
                                              ? prod.variants.map((v) => `${v.size}: ₹${v.mrp}`).join(' • ')
                                              : `MRP ₹${prod.mrp}`}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenVariantModal(prod)}
                                          className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 px-2 py-1 rounded-lg cursor-pointer"
                                          title="Manage Pack Size Variants"
                                        >
                                          Variants
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditProduct(prod)}
                                          className="w-7 h-7 rounded-lg bg-[#1e2020] hover:bg-[#282a2b] border border-[#333535] text-on-surface flex items-center justify-center cursor-pointer"
                                          title="Edit Product"
                                        >
                                          <span className="material-symbols-outlined text-xs">
                                            edit
                                          </span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteProduct(prod)}
                                          className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center cursor-pointer"
                                          title="Safe Delete Product"
                                        >
                                          <span className="material-symbols-outlined text-xs">
                                            delete
                                          </span>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: PENDING REQUESTS QUEUE */}
        {activeTab === 'requests' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-base font-extrabold text-white uppercase tracking-tight">
                Pending Product Requests ({pendingRequests.length})
              </h2>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="bg-[#181a1a] border border-[#2a2c2c] rounded-2xl p-5 text-center">
                <p className="text-xs font-semibold text-on-surface-variant">
                  🎉 No pending product requests right now!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-[#121212] border-2 border-amber-500/40 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden shadow-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase">
                          Pending Request
                        </span>
                        <h3 className="text-base font-extrabold text-white mt-1.5">
                          {req.productName}
                        </h3>
                        <span className="text-[11px] text-on-surface-variant font-mono block mt-0.5">
                          Submitted: {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-2 border-t border-[#242626]">
                      <button
                        type="button"
                        onClick={() => handleRejectRequest(req.id)}
                        className="flex-1 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenApproveModal(req)}
                        className="flex-1 py-2.5 rounded-full font-extrabold text-xs uppercase tracking-wider text-black bg-primary-container neon-glow active:scale-95 transition-all cursor-pointer"
                      >
                        Approve & Place
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* APPROVAL MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121414] border border-primary-container/40 rounded-3xl p-6 w-full max-w-md flex flex-col gap-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">
                Approve Product Request
              </h2>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="text-on-surface-variant hover:text-white w-8 h-8 rounded-full bg-[#1e2020] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#1e2020] rounded-2xl p-3.5 border border-[#333535]">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                Submitted Request Details
              </span>
              <div className="text-base font-extrabold text-primary-container">
                {selectedRequest.productName}
              </div>
              <div className="text-xs text-white font-mono mt-0.5">
                Pack Size: {selectedRequest.size || 'Standard'} • Submitted Price: ₹{selectedRequest.sellingPrice || selectedRequest.mrp || 20}
              </div>
            </div>

            {/* Approval Mode Toggle */}
            <div className="flex bg-[#1e2020] rounded-xl p-1 border border-[#333535]">
              <button
                type="button"
                onClick={() => setApproveMode('new')}
                className={`flex-1 py-2 rounded-lg font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  approveMode === 'new'
                    ? 'bg-primary-container text-black'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                Create New Catalog Product
              </button>
              <button
                type="button"
                onClick={() => setApproveMode('variant')}
                className={`flex-1 py-2 rounded-lg font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  approveMode === 'variant'
                    ? 'bg-primary-container text-black'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                Add as Variant to Existing Item
              </button>
            </div>

            <form onSubmit={handleConfirmApproval} className="flex flex-col gap-4">
              {approveMode === 'new' ? (
                <>
                  {/* Category Select */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-primary-container uppercase tracking-wider">
                      Assign Category
                    </label>
                    <select
                      value={approveCategory}
                      onChange={(e) => {
                        const catName = e.target.value as ProductCategory;
                        setApproveCategory(catName);
                        const matchedCat = categories.find((c) => c.name === catName);
                        setApproveSubcategory(matchedCat?.subcategories[0] || 'General');
                      }}
                      className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-bold rounded-2xl px-4 py-3 focus:outline-none focus:border-primary-container text-sm cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.name} value={c.name} className="bg-[#121414] text-white">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory Select or Create */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-primary-container uppercase tracking-wider">
                        Assign Subcategory
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsApproveNewSub(!isApproveNewSub)}
                        className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                      >
                        {isApproveNewSub ? 'Use Existing' : '+ New Subcategory'}
                      </button>
                    </div>

                    {!isApproveNewSub ? (
                      <select
                        value={approveSubcategory}
                        onChange={(e) => setApproveSubcategory(e.target.value)}
                        className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-bold rounded-2xl px-4 py-3 focus:outline-none focus:border-primary-container text-sm cursor-pointer"
                      >
                        {(
                          categories.find((c) => c.name === approveCategory)?.subcategories || ['General']
                        ).map((sub) => (
                          <option key={sub} value={sub} className="bg-[#121414] text-white">
                            {sub}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Enter new subcategory name"
                        value={approveNewSubName}
                        onChange={(e) => setApproveNewSubName(e.target.value)}
                        className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-bold rounded-2xl px-4 py-3 focus:outline-none focus:border-primary-container text-sm"
                      />
                    )}
                  </div>
                </>
              ) : (
                /* Select Existing Product for Variant Placement */
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-primary-container uppercase tracking-wider">
                    Select Existing Catalog Product
                  </label>
                  <select
                    value={targetExistingProductId}
                    onChange={(e) => setTargetExistingProductId(e.target.value)}
                    className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-bold rounded-2xl px-4 py-3 focus:outline-none focus:border-primary-container text-sm cursor-pointer"
                  >
                    {allProductsList.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#121414] text-white">
                        {p.name} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Pack Size Label */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-primary-container uppercase tracking-wider">
                  Pack Size Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. 50g, 90g, 1L"
                  value={approveSize}
                  onChange={(e) => setApproveSize(e.target.value)}
                  className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-bold rounded-2xl px-4 py-3 focus:outline-none focus:border-primary-container text-sm"
                />
              </div>

              {/* MRP Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-primary-container uppercase tracking-wider">
                  Variant MRP (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={approveMrp}
                  onChange={(e) => setApproveMrp(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-bold rounded-2xl px-4 py-3 focus:outline-none focus:border-primary-container text-sm"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 py-3 rounded-full font-bold text-xs uppercase tracking-wider text-on-surface-variant bg-[#1e2020] hover:bg-[#282a2b] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-full font-extrabold text-xs uppercase tracking-wider text-black bg-primary-container neon-glow active:scale-95 transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Approving...' : approveMode === 'new' ? 'Create Product' : 'Add Variant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE VARIANTS MODAL */}
      {isVariantModalOpen && editingVariantProd && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121414] border border-primary-container/40 rounded-3xl p-6 w-full max-w-md flex flex-col gap-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">
                  Manage Pack Size Variants
                </h2>
                <p className="text-xs font-bold text-primary-container">
                  {editingVariantProd.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsVariantModalOpen(false)}
                className="text-on-surface-variant hover:text-white w-8 h-8 rounded-full bg-[#1e2020] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVariants} className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Pack Size Variants ({variantInputs.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddVariantInput}
                  className="text-xs font-extrabold text-primary-container bg-primary-container/10 border border-primary-container/30 px-3 py-1 rounded-full uppercase hover:bg-primary-container hover:text-black transition-colors cursor-pointer"
                >
                  + Add Variant
                </button>
              </div>

              <div className="flex flex-col gap-2.5 max-h-[40vh] overflow-y-auto pr-1">
                {variantInputs.map((v, idx) => (
                  <div
                    key={idx}
                    className="bg-[#1e2020] border border-[#333535] rounded-2xl p-3 flex items-center gap-2"
                  >
                    <div className="flex-1">
                      <label className="text-[10px] text-on-surface-variant block font-bold">
                        Size / Weight Label
                      </label>
                      <input
                        type="text"
                        value={v.size}
                        onChange={(e) => handleUpdateVariantInput(idx, 'size', e.target.value)}
                        className="w-full bg-[#121414] border border-[#333535] rounded-xl px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-primary-container"
                        placeholder="e.g. 50g"
                      />
                    </div>

                    <div className="w-24">
                      <label className="text-[10px] text-on-surface-variant block font-bold">
                        MRP (₹)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={v.mrp}
                        onChange={(e) => handleUpdateVariantInput(idx, 'mrp', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-[#121414] border border-[#333535] rounded-xl px-2.5 py-1.5 text-xs text-primary-container font-mono font-bold focus:outline-none focus:border-primary-container"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteVariantInput(idx, v.size)}
                      className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center cursor-pointer shrink-0 mt-3"
                      title="Delete Variant (Live listing safeguard active)"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsVariantModalOpen(false)}
                  className="flex-1 py-3 rounded-full font-bold text-xs uppercase tracking-wider text-on-surface-variant bg-[#1e2020] hover:bg-[#282a2b] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-full font-extrabold text-xs uppercase tracking-wider text-black bg-primary-container neon-glow active:scale-95 transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save All Variants'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL (Add / Rename) */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121414] border border-primary-container/40 rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl animate-fade-in">
            <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">
              {catModalMode === 'add' ? 'Add Top-Level Category' : 'Rename Category'}
            </h2>

            <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-primary-container uppercase tracking-wider">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Healthy & Fitness Snacks"
                  value={catNameInput}
                  onChange={(e) => setCatNameInput(e.target.value)}
                  className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-bold rounded-2xl px-4 py-3.5 focus:outline-none focus:border-primary-container text-sm"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="flex-1 py-3 rounded-full font-bold text-xs uppercase tracking-wider text-on-surface-variant bg-[#1e2020] hover:bg-[#282a2b] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-full font-extrabold text-xs uppercase tracking-wider text-black bg-primary-container neon-glow active:scale-95 transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBCATEGORY MODAL (Add / Rename / Move) */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121414] border border-primary-container/40 rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl animate-fade-in">
            <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">
              {subModalMode === 'add'
                ? `Add Subcategory under ${targetCatName}`
                : subModalMode === 'rename'
                ? `Rename Subcategory "${oldSubName}"`
                : `Move Subcategory "${oldSubName}"`}
            </h2>

            <form onSubmit={handleSaveSubcategory} className="flex flex-col gap-4">
              {subModalMode !== 'move' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-primary-container uppercase tracking-wider">
                    Subcategory Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nacho & Tortilla Chips"
                    value={subNameInput}
                    onChange={(e) => setSubNameInput(e.target.value)}
                    className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-bold rounded-2xl px-4 py-3.5 focus:outline-none focus:border-primary-container text-sm"
                    autoFocus
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-primary-container uppercase tracking-wider">
                    Select Target Category
                  </label>
                  <select
                    value={moveTargetCatDocId}
                    onChange={(e) => setMoveTargetCatDocId(e.target.value)}
                    className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-bold rounded-2xl px-4 py-3.5 focus:outline-none focus:border-primary-container text-sm cursor-pointer"
                  >
                    {categories
                      .filter((c) => c.name !== targetCatName)
                      .map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#121414] text-white">
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="flex-1 py-3 rounded-full font-bold text-xs uppercase tracking-wider text-on-surface-variant bg-[#1e2020] hover:bg-[#282a2b] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-full font-extrabold text-xs uppercase tracking-wider text-black bg-primary-container neon-glow active:scale-95 transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL (Edit Name, MRP, Description, Category & Subcategory) */}
      {isProdModalOpen && editingProd && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121414] border border-primary-container/40 rounded-3xl p-6 w-full max-w-md flex flex-col gap-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">
                Edit Product
              </h2>
              <button
                type="button"
                onClick={() => setIsProdModalOpen(false)}
                className="text-on-surface-variant hover:text-white w-8 h-8 rounded-full bg-[#1e2020] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#1e2020] rounded-2xl p-3 border border-[#333535] flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                Stable Product ID:
              </span>
              <span className="text-xs font-mono font-bold text-primary-container">
                {editingProd.id}
              </span>
            </div>

            <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
              {/* Product Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-primary-container uppercase tracking-wider">
                  Product Name
                </label>
                <input
                  type="text"
                  value={prodNameInput}
                  onChange={(e) => setProdNameInput(e.target.value)}
                  className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-bold rounded-2xl px-4 py-3.5 focus:outline-none focus:border-primary-container text-sm"
                  required
                />
              </div>

              {/* MRP */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-primary-container uppercase tracking-wider">
                  MRP (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={prodMrpInput}
                  onChange={(e) => setProdMrpInput(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-bold rounded-2xl px-4 py-3.5 focus:outline-none focus:border-primary-container text-sm"
                  required
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-primary-container uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={prodCatInput}
                  onChange={(e) => {
                    const catName = e.target.value as ProductCategory;
                    setProdCatInput(catName);
                    const matchedCat = categories.find((c) => c.name === catName);
                    setProdSubInput(matchedCat?.subcategories[0] || 'General');
                  }}
                  className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-bold rounded-2xl px-4 py-3.5 focus:outline-none focus:border-primary-container text-sm cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.name} value={c.name} className="bg-[#121414] text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-primary-container uppercase tracking-wider">
                  Subcategory
                </label>
                <select
                  value={prodSubInput}
                  onChange={(e) => setProdSubInput(e.target.value)}
                  className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-bold rounded-2xl px-4 py-3.5 focus:outline-none focus:border-primary-container text-sm cursor-pointer"
                >
                  {(
                    categories.find((c) => c.name === prodCatInput)?.subcategories || ['General']
                  ).map((sub) => (
                    <option key={sub} value={sub} className="bg-[#121414] text-white">
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-primary-container uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={prodDescInput}
                  onChange={(e) => setProdDescInput(e.target.value)}
                  className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-sans rounded-2xl p-3 focus:outline-none focus:border-primary-container text-sm"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsProdModalOpen(false)}
                  className="flex-1 py-3 rounded-full font-bold text-xs uppercase tracking-wider text-on-surface-variant bg-[#1e2020] hover:bg-[#282a2b] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-full font-extrabold text-xs uppercase tracking-wider text-black bg-primary-container neon-glow active:scale-95 transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
