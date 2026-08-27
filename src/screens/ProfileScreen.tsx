import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { HostelName, HOSTEL_BLOCKS } from '../types/user';
import { Product, ProductVariant } from '../types/catalog';
import { MOCK_PRODUCTS, getProductById, splitRoomString } from '../data/mockCatalog';
import { BottomNavBar } from '../components/BottomNavBar';
import { CascadingProductPicker } from '../components/CascadingProductPicker';
import { useNotification } from '../context/NotificationContext';
import { ADMIN_EMAIL, isAdminEmail } from '../config/admin';
import { subscribeToMasterProducts } from '../firebase/masterCatalog';
import { recalculateAndSaveSellerReliabilityScore } from '../firebase/requests';
import {
  FirestoreListing,
  createListingDoc,
  updateListingDoc,
  deleteListingDoc,
  subscribeToUserListings,
  updateSellerAwakeStatusInListings,
  updateSellerDetailsInListings
} from '../firebase/listings';

const HOSTEL_OPTIONS: HostelName[] = [
  'Shivalik',
  'Aravali',
  'Kurukshetra',
  'Himalaya',
  'Kalpana Chawala',
  'Vindhya',
];

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, toggleAwakeStatus, toggleDeliveryOptIn, setHostelAndRoom, resetUserProfile } = useUser();
  const { permission, requestNotificationPermission, triggerTestNotification } = useNotification();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isPickerModalOpen, setIsPickerModalOpen] = useState(false);

  const [selectedHostel, setSelectedHostel] = useState<HostelName>(
    (user.hostel as HostelName) || 'Shivalik'
  );

  const initialBlocks = HOSTEL_BLOCKS[selectedHostel] || ['A'];
  const initialSplit = splitRoomString(user.roomNumber || '', initialBlocks);

  const [selectedBlock, setSelectedBlock] = useState<string>(initialSplit.block || initialBlocks[0]);
  const [numericRoom, setNumericRoom] = useState<string>(initialSplit.number || '');
  const [newRoom, setNewRoom] = useState(user.roomNumber || '');

  // Real-time Master Catalog Products from Firestore
  const [masterProducts, setMasterProducts] = useState<Product[]>([]);
  useEffect(() => {
    const unsub = subscribeToMasterProducts((items) => {
      setMasterProducts(items);
    });
    return () => unsub();
  }, []);

  const allProducts = masterProducts.length > 0 ? masterProducts : MOCK_PRODUCTS;

  if (loading) {
    return (
      <div className="bg-[#050505] min-h-screen w-full flex items-center justify-center text-primary-container">
        <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
      </div>
    );
  }

  if (!user.hostel || !user.roomNumber) {
    return <Navigate to="/setup" replace />;
  }

  // Real-time Firestore Seller Listings State
  const [myListings, setMyListings] = useState<FirestoreListing[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<FirestoreListing | null>(null);

  // Cascading Product Picker Modal state
  const [isCascadingPickerOpen, setIsCascadingPickerOpen] = useState(false);

  // Add / Edit Listing Form State
  // Add / Edit Listing Form State
  const defaultProd = allProducts[0] || MOCK_PRODUCTS[0];
  const defaultVar = (defaultProd.variants && defaultProd.variants[0]) || { size: 'Standard', mrp: defaultProd.mrp || 20 };
  const [selectedProduct, setSelectedProduct] = useState<Product>(defaultProd);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(defaultVar);
  const [isUnverifiedSelection, setIsUnverifiedSelection] = useState(false);
  const [unverifiedName, setUnverifiedName] = useState('');
  const [listingQuantity, setListingQuantity] = useState(5);
  const [listingPrice, setListingPrice] = useState(defaultVar.mrp);
  const [listingDeliveryOptIn, setListingDeliveryOptIn] = useState(true);
  const [listingDeliveryFee, setListingDeliveryFee] = useState(5);
  const [formError, setFormError] = useState('');
  const [isSavingListing, setIsSavingListing] = useState(false);

  // Subscribe to seller's listings live from Firestore
  useEffect(() => {
    if (!user.uid) return;
    const unsubscribe = subscribeToUserListings(user.uid, (items) => {
      setMyListings(items);
    });
    // Recalculate seller reliability score on profile view
    recalculateAndSaveSellerReliabilityScore(user.uid);
    return () => unsubscribe();
  }, [user.uid]);

  // Calculate 14-day hostel change cooldown
  const COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;
  const lastChange = user.lastHostelChangeDate || 0;
  const elapsed = Date.now() - lastChange;
  const isCooldownActive = lastChange > 0 && elapsed < COOLDOWN_MS;
  const daysRemaining = Math.ceil((COOLDOWN_MS - elapsed) / (1000 * 60 * 60 * 24));

  // Mask email helper
  const maskEmail = (email: string): string => {
    if (!email) return 'pec.student@pec.edu.in';
    const atIndex = email.indexOf('@');
    if (atIndex <= 3) return email;
    const prefix = email.substring(0, 3);
    const domain = email.substring(atIndex);
    const rest = email.substring(3, atIndex);
    return `${prefix}***${rest.slice(-6)}${domain}`;
  };

  // Sync user awake status with Firestore listings
  const handleToggleAwake = async () => {
    const nextAwakeVal = !user.isAwake;
    await toggleAwakeStatus();
    if (user.uid) {
      await updateSellerAwakeStatusInListings(user.uid, nextAwakeVal);
    }
  };

  // Sync delivery opt-in
  const handleToggleDelivery = async () => {
    await toggleDeliveryOptIn();
  };

  const handleInitiateLocationSave = () => {
    if (!numericRoom.trim()) return;
    const fullRoom = `${selectedBlock}${numericRoom.trim()}`;
    setNewRoom(fullRoom);
    setIsPickerModalOpen(false);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmHostelChange = async () => {
    if (!newRoom.trim()) return;
    const roomClean = newRoom.trim().toUpperCase();
    const isHostelChanged = selectedHostel !== user.hostel;
    await setHostelAndRoom(selectedHostel, roomClean, isHostelChanged);
    if (user.uid) {
      await updateSellerDetailsInListings(user.uid, user.name, roomClean, selectedHostel);
    }
    setIsConfirmModalOpen(false);
  };

  const handleLogout = async () => {
    await resetUserProfile();
    navigate('/verify');
  };

  // Open modal for adding a new listing
  const handleOpenAddModal = () => {
    const defaultP = allProducts[0] || MOCK_PRODUCTS[0];
    const defaultV = (defaultP.variants && defaultP.variants[0]) || { size: 'Standard', mrp: defaultP.mrp || 20 };
    setSelectedProduct(defaultP);
    setSelectedVariant(defaultV);
    setIsUnverifiedSelection(false);
    setUnverifiedName('');
    setListingQuantity(5);
    setListingPrice(defaultV.mrp);
    setListingDeliveryOptIn(user.deliveryOptIn);
    setListingDeliveryFee(5);
    setFormError('');
    setEditingListing(null);
    setIsAddModalOpen(true);
  };

  // Open modal for editing an existing listing
  const handleOpenEditModal = (listing: FirestoreListing) => {
    const foundProd = getProductById(listing.productId, allProducts);
    const variants = foundProd.variants && foundProd.variants.length > 0
      ? foundProd.variants
      : [{ size: 'Standard', mrp: foundProd.mrp || 20 }];
    const foundVar = variants.find((v) => v.size === listing.variantSize) || variants[0];

    setSelectedProduct(foundProd);
    setSelectedVariant(foundVar);
    setIsUnverifiedSelection(!!listing.isUnverified);
    setUnverifiedName(listing.unverifiedProductName || listing.productName);
    setListingQuantity(listing.quantity);
    setListingPrice(listing.price);
    setListingDeliveryOptIn(listing.deliveryOptIn);
    setListingDeliveryFee(listing.deliveryFee || 5);
    setFormError('');
    setEditingListing(listing);
    setIsAddModalOpen(true);
  };

  // Selection callback from CascadingProductPicker
  const handleSelectProductFromPicker = (
    product: Product,
    variant?: ProductVariant,
    isUnverified?: boolean,
    requestedName?: string
  ) => {
    setSelectedProduct(product);
    const chosenVariant = variant || (product.variants && product.variants[0]) || { size: 'Standard', mrp: product.mrp || 20 };
    setSelectedVariant(chosenVariant);
    setIsUnverifiedSelection(!!isUnverified);
    setUnverifiedName(requestedName || product.name);
    setListingPrice(chosenVariant.mrp);
  };

  // Submit Add/Edit Listing
  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation 1: Quantity must be >= 1
    if (listingQuantity < 1) {
      setFormError('Quantity must be at least 1 unit.');
      return;
    }

    // Validation 2: Price cannot exceed selected variant MRP
    if (listingPrice > selectedVariant.mrp) {
      setFormError(`Price cannot exceed variant MRP of ₹${selectedVariant.mrp} (${selectedVariant.size})`);
      return;
    }

    if (listingPrice < 1) {
      setFormError('Price must be at least ₹1.');
      return;
    }

    setIsSavingListing(true);
    try {
      if (editingListing && editingListing.id) {
        // Update existing listing
        await updateListingDoc(editingListing.id, {
          quantity: listingQuantity,
          price: listingPrice,
          deliveryOptIn: listingDeliveryOptIn,
          deliveryFee: listingDeliveryOptIn ? listingDeliveryFee : 0,
        });
      } else {
        // Create new listing
        const prodName = isUnverifiedSelection
          ? unverifiedName || selectedProduct.name
          : selectedProduct.name;

        await createListingDoc({
          sellerUid: user.uid || '',
          sellerName: user.name || 'PEC Student',
          sellerRoom: user.roomNumber || '',
          hostel: (user.hostel as HostelName) || 'Shivalik',
          productId: selectedProduct.id || '',
          productName: prodName || 'Item',
          variantSize: selectedVariant.size,
          mrp: selectedVariant.mrp,
          quantity: listingQuantity,
          price: listingPrice,
          isSellerAwake: user.isAwake ?? true,
          deliveryOptIn: Boolean(listingDeliveryOptIn),
          deliveryFee: listingDeliveryOptIn ? listingDeliveryFee : 0,
          isUnverified: Boolean(isUnverifiedSelection),
          ...(isUnverifiedSelection && prodName ? { unverifiedProductName: prodName } : {}),
        });
      }
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save listing:', err);
      setFormError(err.message || 'Failed to save listing. Try again.');
    } finally {
      setIsSavingListing(false);
    }
  };

  // Delete listing
  const handleDeleteListing = async (listingId: string) => {
    if (window.confirm('Remove this listing from tonight\'s shelf?')) {
      try {
        await deleteListingDoc(listingId);
      } catch (err) {
        console.error('Failed to delete listing:', err);
      }
    }
  };

  return (
    <div className="font-sans min-h-screen w-full flex flex-col select-none bg-[#121414] text-[#e2e2e2] pb-28">
      {/* App Bar Header */}
      <header className="sticky top-0 z-40 bg-[#121414]/90 backdrop-blur-xl border-b border-[#333535]/30 flex justify-between items-center w-full px-4 h-16">
        <h1 className="text-xl font-extrabold text-primary-container tracking-tight italic uppercase drop-shadow-[0_0_8px_rgba(255,95,31,0.4)]">
          Profile & Settings
        </h1>
        <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          Verified PEC
        </span>
      </header>

      {/* Main Canvas */}
      <main className="w-full px-4 pt-4 flex flex-col gap-5 max-w-md mx-auto flex-1">
        {/* ADMIN PORTAL BANNER (Visible only to authorized admin) */}
        {isAdminEmail(user.email) && (
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="w-full bg-primary-container text-black font-extrabold text-xs uppercase tracking-widest py-3.5 px-4 rounded-2xl neon-glow flex items-center justify-between cursor-pointer active:scale-95 transition-all shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
              <span>Admin Catalog Moderation</span>
            </div>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        )}

        {/* IDENTITY CARD */}
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-3xl p-5 flex flex-col gap-4 relative overflow-hidden shadow-xl">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-container/15 border border-primary-container/40 flex items-center justify-center text-primary-container font-extrabold text-lg shadow-inner">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white leading-snug">
                  {user.name}
                </h2>
                <span className="text-xs font-mono text-on-surface-variant block">
                  {maskEmail(user.email)}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                Reliability
              </span>
              <span className="text-base font-extrabold text-green-400 font-mono">
                {user.reliabilityScore}%
              </span>
            </div>
          </div>
        </div>

        {/* MY LISTINGS SECTION */}
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-white">
                Tonight's Active Items
              </h3>
              <p className="text-xs text-on-surface-variant">
                Items you are currently selling in {user.hostel}
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="bg-primary-container text-black font-extrabold text-xs px-3.5 py-2 rounded-full uppercase tracking-wider neon-glow hover:brightness-110 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
            >
              <span>+ Add Item</span>
            </button>
          </div>

          {myListings.length === 0 ? (
            <div className="bg-[#181a1a] border border-[#2a2c2c] rounded-2xl p-5 text-center flex flex-col items-center gap-1">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-1">
                inventory_2
              </span>
              <p className="text-xs font-semibold text-on-surface-variant">
                You have no active listings tonight.
              </p>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="mt-2 text-xs text-primary-container font-extrabold underline cursor-pointer"
              >
                + Add what you're selling
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {myListings.map((item) => {
                const prod = getProductById(item.productId, allProducts);
                return (
                  <div
                    key={item.id}
                    className="bg-[#181a1a] border border-[#2a2c2c] rounded-2xl p-3.5 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container">
                        <span className="material-symbols-outlined text-xl">
                          {item.isUnverified ? 'help_outline' : prod ? prod.iconName : 'local_mall'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-white">
                            {item.productName}
                          </h4>
                          {item.isUnverified && (
                            <span className="text-[10px] text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">
                              ⚠️ Unverified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-mono text-primary-container font-bold">
                            ₹{item.price}
                          </span>
                          <span className="text-[10px] text-on-surface-variant bg-[#252828] px-2 py-0.5 rounded-full border border-[#333636]">
                            {item.quantity} units left
                          </span>
                          {item.deliveryOptIn && (
                            <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                              🚚 Delivery (+₹{item.deliveryFee || 5})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="w-8 h-8 rounded-lg bg-[#252828] hover:bg-[#333636] border border-[#383b3b] text-on-surface flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                        title="Edit quantity/price"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => item.id && handleDeleteListing(item.id)}
                        className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                        title="Delete listing"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* STATUS TOGGLE */}
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-3xl p-4 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-extrabold text-white">Awake & Active Status</h3>
            <p className="text-xs text-on-surface-variant">
              {user.isAwake ? 'Visible on hostel shelf' : 'Hidden from shelf while away'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleAwake}
            className={`px-4 py-2.5 rounded-full font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              user.isAwake
                ? 'bg-green-500 text-black neon-glow'
                : 'bg-[#242626] text-on-surface-variant border border-[#333535]'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${user.isAwake ? 'bg-black animate-pulse' : 'bg-slate-500'}`}></span>
            <span>{user.isAwake ? 'Awake 🟢' : 'Asleep 🌙'}</span>
          </button>
        </div>

        {/* LOCATION SECTION */}
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-3xl p-5 flex flex-col gap-3">
          <h3 className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider">
            Hostel Location
          </h3>

          <div className="flex justify-between items-center">
            <div>
              <span className="text-base font-extrabold text-white block">
                {user.hostel} Hostel
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-primary-container font-bold">
                  Room {user.roomNumber}
                </span>
                {!isCooldownActive && (
                  <span className="text-[10px] text-on-surface-variant/70 italic">
                    • Changes lock for 14 days
                  </span>
                )}
              </div>
            </div>

            {isCooldownActive ? (
              <button
                type="button"
                disabled
                className="bg-[#242626] text-on-surface-variant/50 border border-[#333535] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider cursor-not-allowed opacity-60"
              >
                AVAILABLE IN {daysRemaining}D
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const currentHostel = user.hostel as HostelName;
                  const blocks = HOSTEL_BLOCKS[currentHostel] || ['A'];
                  const split = splitRoomString(user.roomNumber || '', blocks);
                  setSelectedHostel(currentHostel);
                  setSelectedBlock(split.block);
                  setNumericRoom(split.number);
                  setNewRoom(user.roomNumber || '');
                  setIsPickerModalOpen(true);
                }}
                className="bg-primary-container/10 border border-primary-container/30 text-primary-container hover:bg-primary-container hover:text-black px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
              >
                CHANGE HOSTEL
              </button>
            )}
          </div>
        </div>

        {/* DELIVERY PREFERENCE */}
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-3xl p-4 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-extrabold text-white">Delivery Preference</h3>
            <p className="text-xs text-on-surface-variant">
              {user.deliveryOptIn ? 'Opted in to room delivery' : 'Pickup only from your room'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleDelivery}
            className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
              user.deliveryOptIn ? 'bg-primary-container' : 'bg-[#333535]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-black shadow-md transition-transform ${
                user.deliveryOptIn ? 'translate-x-5' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>

        {/* NOTIFICATION PREFERENCES */}
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-3xl p-5 flex flex-col gap-3">
          <h3 className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider">
            Order Notifications
          </h3>

          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-extrabold text-white block">
                Instant Request Alerts
              </span>
              <span className="text-xs text-on-surface-variant">
                {permission === 'granted'
                  ? 'Active • Loud sound & vibration'
                  : permission === 'denied'
                  ? 'Blocked in browser settings'
                  : 'Requires browser permission'}
              </span>
            </div>

            {permission !== 'granted' && permission !== 'denied' && (
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="bg-primary-container/10 border border-primary-container/30 text-primary-container hover:bg-primary-container hover:text-black px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
              >
                ENABLE ALERTS
              </button>
            )}
          </div>

          {permission === 'granted' && (
            <button
              type="button"
              onClick={triggerTestNotification}
              className="w-full py-2.5 rounded-xl bg-[#1e2020] border border-[#333535] text-xs font-bold text-primary-container hover:bg-primary-container/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">volume_up</span>
              <span>Test Request Sound & Vibration</span>
            </button>
          )}

          {permission === 'denied' && (
            <p className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl leading-relaxed">
              💡 Notifications are blocked by your browser. To enable them, tap the site settings lock icon in your browser URL bar and allow Notifications.
            </p>
          )}
        </div>

        {/* LOGOUT BUTTON */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full bg-red-500/10 border border-red-500/30 text-red-400 font-extrabold text-xs uppercase tracking-widest py-4 rounded-full hover:bg-red-500/20 transition-all cursor-pointer mt-2"
        >
          LOG OUT OF RULESOFF
        </button>
      </main>

      {/* ADD / EDIT LISTING MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141616] border border-[#2a2c2c] rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 animate-scale-in">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-extrabold text-primary-container italic uppercase">
                {editingListing ? 'Edit Listing' : 'Add Item to Sell'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-on-surface-variant hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveListing} className="flex flex-col gap-4">
              {/* Product Selection Button (Opens Cascading Picker) */}
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5 pl-1">
                  Selected Product (Category → Subcategory → Item)
                </label>
                
                <button
                  type="button"
                  onClick={() => setIsCascadingPickerOpen(true)}
                  disabled={!!editingListing}
                  className="w-full bg-[#1e2020] border-2 border-primary-container/60 hover:border-primary-container rounded-2xl py-3 px-4 text-left transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-primary-container/15 flex items-center justify-center text-primary-container shrink-0">
                      <span className="material-symbols-outlined text-lg">
                        {isUnverifiedSelection ? 'help_outline' : selectedProduct.iconName || 'shopping_bag'}
                      </span>
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-white truncate">
                          {isUnverifiedSelection ? unverifiedName || selectedProduct.name : selectedProduct.name}
                        </span>
                        {isUnverifiedSelection && (
                          <span className="text-[9px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1 py-0.2 rounded shrink-0">
                            Unverified
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-on-surface-variant block truncate">
                        {selectedProduct.category} • {selectedProduct.subcategory} ({selectedVariant.size} • MRP ₹{selectedVariant.mrp})
                      </span>
                    </div>
                  </div>

                  {!editingListing && (
                    <span className="material-symbols-outlined text-primary-container group-hover:translate-x-0.5 transition-transform text-lg shrink-0">
                      edit
                    </span>
                  )}
                </button>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5 pl-1">
                  Quantity Available
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={listingQuantity}
                  onChange={(e) => setListingQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-[#1e2020] border border-[#333535] rounded-xl py-3 px-4 text-white font-sans text-sm focus:outline-none focus:border-primary-container"
                />
              </div>

              {/* Price Input with MRP Enforced Validation */}
              <div>
                <div className="flex justify-between items-center mb-1.5 pl-1">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                    Your Price (₹)
                  </label>
                  <span className="text-[10px] text-primary-container font-bold">
                    Max MRP: ₹{selectedVariant.mrp} ({selectedVariant.size})
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={selectedVariant.mrp}
                  required
                  value={listingPrice}
                  onChange={(e) => setListingPrice(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-[#1e2020] border border-[#333535] rounded-xl py-3 px-4 text-white font-sans text-sm focus:outline-none focus:border-primary-container"
                />
              </div>

              {/* Delivery Option */}
              <div className="flex items-center justify-between bg-[#1e2020] border border-[#333535] p-3 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-white block">Room Delivery</span>
                  <span className="text-[10px] text-on-surface-variant">Offer room delivery for this item</span>
                </div>
                <button
                  type="button"
                  onClick={() => setListingDeliveryOptIn(!listingDeliveryOptIn)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                    listingDeliveryOptIn ? 'bg-primary-container' : 'bg-[#333535]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-black shadow-md transition-transform ${
                      listingDeliveryOptIn ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>

              {/* Error Message */}
              {formError && (
                <p className="text-error text-xs font-semibold text-center bg-error-container/20 py-2 px-3 rounded-xl border border-error/30">
                  {formError}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-[#252828] text-on-surface font-bold text-xs py-3 rounded-xl uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingListing}
                  className="flex-1 bg-primary-container text-black font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider neon-glow"
                >
                  {isSavingListing ? 'Saving...' : editingListing ? 'Update' : 'Add Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CASCADING PRODUCT PICKER COMPONENT */}
      <CascadingProductPicker
        isOpen={isCascadingPickerOpen}
        onClose={() => setIsCascadingPickerOpen(false)}
        onSelectProduct={handleSelectProductFromPicker}
        allProducts={allProducts}
        currentUserId={user.uid}
      />

      {/* HOSTEL & ROOM PICKER MODAL */}
      {isPickerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141616] border border-[#2a2c2c] rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 animate-scale-in">
            <h3 className="text-lg font-extrabold text-primary-container italic uppercase text-center">
              Update Location
            </h3>

            <div className="flex flex-col gap-3">
              {/* Hostel Select */}
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Hostel
                </label>
                <select
                  value={selectedHostel}
                  onChange={(e) => {
                    const h = e.target.value as HostelName;
                    setSelectedHostel(h);
                    const blocks = HOSTEL_BLOCKS[h] || ['Main'];
                    if (!blocks.includes(selectedBlock)) {
                      setSelectedBlock(blocks[0]);
                    }
                  }}
                  className="w-full bg-[#1e2020] border border-[#333535] rounded-xl py-3 px-3 text-white font-sans text-sm focus:outline-none focus:border-primary-container cursor-pointer"
                >
                  {HOSTEL_OPTIONS.map((h) => (
                    <option key={h} value={h}>
                      {h} Hostel
                    </option>
                  ))}
                </select>
              </div>

              {/* Block & Room Number Grid */}
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
                    Block
                  </label>
                  <select
                    value={selectedBlock}
                    onChange={(e) => setSelectedBlock(e.target.value)}
                    className="w-full bg-[#1e2020] border border-[#333535] rounded-xl py-3 px-2 text-white font-bold text-sm focus:outline-none focus:border-primary-container cursor-pointer"
                  >
                    {(HOSTEL_BLOCKS[selectedHostel] || ['Main']).map((b) => (
                      <option key={b} value={b} className="bg-[#121414] text-white font-bold">
                        Block {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-3 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
                    Room No.
                  </label>
                  <div className="relative w-full rounded-xl border border-[#333535] bg-[#1e2020] focus-within:border-primary-container flex items-center">
                    <span className="absolute left-2.5 text-[11px] font-extrabold text-primary-container bg-primary-container/10 border border-primary-container/30 px-1.5 py-0.5 rounded">
                      {selectedBlock}
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      value={numericRoom}
                      onChange={(e) => setNumericRoom(e.target.value.replace(/\D/g, ''))}
                      placeholder="304"
                      className="w-full bg-transparent border-none rounded-xl py-3 pl-12 pr-3 font-mono font-bold text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsPickerModalOpen(false)}
                className="flex-1 bg-[#252828] text-on-surface font-bold text-xs py-3 rounded-full uppercase tracking-wider hover:bg-[#323535] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInitiateLocationSave}
                className="flex-1 bg-primary-container text-black font-extrabold text-xs py-3 rounded-full uppercase tracking-wider neon-glow hover:brightness-110 cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR 14-DAY COOLDOWN */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141616] border border-amber-500/40 rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>

            <h3 className="text-base font-extrabold text-white text-center uppercase tracking-tight">
              Lock Location for 14 Days?
            </h3>

            <p className="text-xs text-on-surface-variant text-center leading-relaxed">
              Updating your hostel to <strong className="text-primary-container">{selectedHostel} Hostel</strong>, Room <strong className="text-white">{newRoom}</strong> will start a <strong className="text-amber-400">14-day lock</strong> during which you cannot change your hostel again.
            </p>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 bg-[#252828] text-on-surface font-bold text-xs py-3 rounded-full uppercase tracking-wider hover:bg-[#323535] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmHostelChange}
                className="flex-1 bg-amber-500 text-black font-extrabold text-xs py-3 rounded-full uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg"
              >
                Confirm Lock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Docked Navigation Bar */}
      <BottomNavBar activeTab="profile" />
    </div>
  );
};
