import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { HostelName } from '../types/user';
import { MOCK_PRODUCTS } from '../data/mockCatalog';
import { BottomNavBar } from '../components/BottomNavBar';
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
  const { user, toggleAwakeStatus, toggleDeliveryOptIn, setHostelAndRoom, resetUserProfile } = useUser();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isPickerModalOpen, setIsPickerModalOpen] = useState(false);

  const [selectedHostel, setSelectedHostel] = useState<HostelName>(
    (user.hostel as HostelName) || 'Shivalik'
  );
  const [newRoom, setNewRoom] = useState(user.roomNumber || 'A304');

  // Real-time Firestore Seller Listings State
  const [myListings, setMyListings] = useState<FirestoreListing[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<FirestoreListing | null>(null);

  // Add / Edit Listing Form State
  const [selectedProductId, setSelectedProductId] = useState(MOCK_PRODUCTS[0].id);
  const [listingQuantity, setListingQuantity] = useState(5);
  const [listingPrice, setListingPrice] = useState(MOCK_PRODUCTS[0].mrp);
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

  const handleConfirmHostelChange = () => {
    setIsConfirmModalOpen(false);
    setIsPickerModalOpen(true);
  };

  const handleSaveHostelAndRoom = async () => {
    if (!newRoom.trim()) return;
    const roomClean = newRoom.trim().toUpperCase();
    await setHostelAndRoom(selectedHostel, roomClean);
    if (user.uid) {
      await updateSellerDetailsInListings(user.uid, user.name, roomClean, selectedHostel);
    }
    setIsPickerModalOpen(false);
  };

  const handleLogout = async () => {
    await resetUserProfile();
    navigate('/verify');
  };

  // Open modal for adding a new listing
  const handleOpenAddModal = () => {
    const defaultProduct = MOCK_PRODUCTS[0];
    setSelectedProductId(defaultProduct.id);
    setListingQuantity(5);
    setListingPrice(defaultProduct.mrp);
    setListingDeliveryOptIn(user.deliveryOptIn);
    setListingDeliveryFee(5);
    setFormError('');
    setEditingListing(null);
    setIsAddModalOpen(true);
  };

  // Open modal for editing an existing listing
  const handleOpenEditModal = (listing: FirestoreListing) => {
    setSelectedProductId(listing.productId);
    setListingQuantity(listing.quantity);
    setListingPrice(listing.price);
    setListingDeliveryOptIn(listing.deliveryOptIn);
    setListingDeliveryFee(listing.deliveryFee || 5);
    setFormError('');
    setEditingListing(listing);
    setIsAddModalOpen(true);
  };

  // Submit Add/Edit Listing
  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const targetProduct = MOCK_PRODUCTS.find((p) => p.id === selectedProductId) || MOCK_PRODUCTS[0];

    // Validation 1: Quantity must be >= 1
    if (listingQuantity < 1) {
      setFormError('Quantity must be at least 1 unit.');
      return;
    }

    // Validation 2: Price cannot exceed product MRP
    if (listingPrice > targetProduct.mrp) {
      setFormError(`Price cannot exceed product MRP of ₹${targetProduct.mrp}`);
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
        await createListingDoc({
          sellerUid: user.uid || '',
          sellerName: user.name || 'PEC Student',
          sellerRoom: user.roomNumber || 'A304',
          hostel: (user.hostel as HostelName) || 'Shivalik',
          productId: targetProduct.id,
          productName: targetProduct.name,
          quantity: listingQuantity,
          price: listingPrice,
          isSellerAwake: user.isAwake,
          deliveryOptIn: listingDeliveryOptIn,
          deliveryFee: listingDeliveryOptIn ? listingDeliveryFee : 0,
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
        {/* IDENTITY CARD */}
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-3xl p-5 flex flex-col gap-4 relative overflow-hidden shadow-xl">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary-container text-black font-black text-2xl flex items-center justify-center neon-glow">
                {user.name ? user.name.charAt(0).toUpperCase() : 'R'}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  {user.name || 'Rohit Sharma'}
                </h2>
                <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                  {maskEmail(user.email || 'rohit.bt22cse@pec.edu.in')}
                </p>
              </div>
            </div>
          </div>

          {/* Supplier Badge */}
          {user.reliabilityScore >= 80 && (
            <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3.5 py-1.5 rounded-full self-start">
              <span>⭐ Reliable Supplier</span>
              <span className="text-[10px] text-amber-200/70">({user.reliabilityScore}% score)</span>
            </div>
          )}
        </div>

        {/* MY LISTINGS TONIGHT SECTION (FIRESTORE REAL-TIME) */}
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-3xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                My Listings Tonight 🛍️
              </h3>
              <p className="text-xs text-on-surface-variant">
                Items you're selling from Room {user.roomNumber || 'A304'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="bg-primary-container text-black font-extrabold text-xs px-3.5 py-2 rounded-full uppercase tracking-wider neon-glow hover:brightness-110 active:scale-95 transition-transform flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm font-bold">add</span>
              <span>Add Item</span>
            </button>
          </div>

          {/* Listings List */}
          {myListings.length === 0 ? (
            <div className="bg-[#181a1a] border border-[#2a2c2c] rounded-2xl p-4 text-center">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant/40 mb-1">
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
                const prod = MOCK_PRODUCTS.find((p) => p.id === item.productId);
                return (
                  <div
                    key={item.id}
                    className="bg-[#181a1a] border border-[#2a2c2c] rounded-2xl p-3.5 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container">
                        <span className="material-symbols-outlined text-xl">
                          {prod ? prod.iconName : 'local_mall'}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white">
                          {item.productName}
                        </h4>
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
                {user.hostel || 'Shivalik'} Hostel
              </span>
              <span className="text-xs text-primary-container font-bold">
                Room {user.roomNumber || 'A304'}
              </span>
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
                onClick={() => setIsConfirmModalOpen(true)}
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
            <p className="text-xs text-on-surface-variant">Offer room delivery to buyers</p>
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
              {/* Product Select */}
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5 pl-1">
                  Select Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setSelectedProductId(pid);
                    const p = MOCK_PRODUCTS.find((prod) => prod.id === pid);
                    if (p) setListingPrice(p.mrp);
                  }}
                  disabled={!!editingListing}
                  className="w-full bg-[#1e2020] border border-[#333535] rounded-xl py-3 px-3 text-white font-sans text-sm focus:outline-none focus:border-primary-container"
                >
                  {MOCK_PRODUCTS.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} (MRP ₹{prod.mrp})
                    </option>
                  ))}
                </select>
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
                    Max MRP: ₹{MOCK_PRODUCTS.find((p) => p.id === selectedProductId)?.mrp}
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={MOCK_PRODUCTS.find((p) => p.id === selectedProductId)?.mrp}
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

      {/* CONFIRMATION MODAL BEFORE PICKER */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141616] border border-[#2a2c2c] rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 text-center animate-scale-in">
            <span className="material-symbols-outlined text-4xl text-amber-400 mx-auto">warning</span>

            <h3 className="text-lg font-extrabold text-white">14-Day Cooldown Notice</h3>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Once you change your hostel, you will be locked to that hostel for <strong>14 days</strong> before you can change again.
            </p>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 bg-[#252828] text-on-surface font-bold text-xs py-3 rounded-full uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmHostelChange}
                className="flex-1 bg-primary-container text-black font-extrabold text-xs py-3 rounded-full uppercase tracking-wider neon-glow"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOSTEL & ROOM PICKER MODAL */}
      {isPickerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141616] border border-[#2a2c2c] rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 animate-scale-in">
            <h3 className="text-lg font-extrabold text-primary-container italic uppercase text-center">
              Update Location
            </h3>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Hostel
                </label>
                <select
                  value={selectedHostel}
                  onChange={(e) => setSelectedHostel(e.target.value as HostelName)}
                  className="w-full bg-[#1e2020] border border-[#333535] rounded-xl py-3 px-3 text-white font-sans text-sm focus:outline-none focus:border-primary-container"
                >
                  {HOSTEL_OPTIONS.map((h) => (
                    <option key={h} value={h}>
                      {h} Hostel
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Room Number
                </label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value.toUpperCase())}
                  placeholder="e.g. A304"
                  className="w-full bg-[#1e2020] border border-[#333535] rounded-xl py-3 px-4 text-white font-sans text-sm focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsPickerModalOpen(false)}
                className="flex-1 bg-[#252828] text-on-surface font-bold text-xs py-3 rounded-full uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveHostelAndRoom}
                className="flex-1 bg-primary-container text-black font-extrabold text-xs py-3 rounded-full uppercase tracking-wider neon-glow"
              >
                Save Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
};
