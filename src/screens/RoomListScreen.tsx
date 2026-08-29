import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Product, Listing } from '../types/catalog';
import { MOCK_PRODUCTS, getProductById, getProximityLabel, sortListingsByProximity } from '../data/mockCatalog';
import { BottomNavBar } from '../components/BottomNavBar';
import { FirestoreListing, subscribeToHostelListings, adminDeleteListingDoc } from '../firebase/listings';
import { subscribeToMasterProducts } from '../firebase/masterCatalog';
import { isAdminEmail } from '../config/admin';

export const RoomListScreen: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useUser();

  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'delivery'>('all');
  const [hostelListings, setHostelListings] = useState<FirestoreListing[]>([]);
  const [masterProducts, setMasterProducts] = useState<Product[]>([]);

  // Subscribe to real-time master products from Firestore
  useEffect(() => {
    const unsub = subscribeToMasterProducts((items) => {
      setMasterProducts(items);
    });
    return () => unsub();
  }, []);

  const allProducts = masterProducts.length > 0 ? masterProducts : MOCK_PRODUCTS;
  const product = getProductById(productId || '', allProducts);

  const handleAdminDeleteListing = async (listingId?: string, name?: string) => {
    if (!listingId) return;
    const confirmed = window.confirm(
      `Admin Moderation: Delete listing for "${name || 'this item'}" permanently?\n\nThis action cannot be undone. Any pending buyer requests for this listing will be automatically cancelled.`
    );
    if (!confirmed) return;

    try {
      await adminDeleteListingDoc(listingId);
    } catch (err: any) {
      console.error('[Admin Moderation] Failed to delete listing:', err);
      alert(err.message || 'Failed to delete listing.');
    }
  };

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

  const userHostel = user.hostel;
  const userRoom = user.roomNumber;

  // Subscribe to real-time Firestore listings for user hostel
  useEffect(() => {
    const unsubscribe = subscribeToHostelListings(userHostel, (items) => {
      setHostelListings(items);
    });
    return () => unsubscribe();
  }, [userHostel]);

  // Convert Firestore listings to Listing format and filter for product, awake status, and exclude current user's own listings
  const productListings: Listing[] = hostelListings
    .filter(
      (l) =>
        (l.productId === product.id || (product.isUnverified && l.unverifiedProductName === product.name)) &&
        l.isSellerAwake &&
        l.quantity > 0 &&
        (!user.uid || l.sellerUid !== user.uid)
    )
    .map((l) => ({
      id: l.id || '',
      sellerUid: l.sellerUid,
      productId: l.productId,
      hostel: l.hostel,
      sellerRoom: l.sellerRoom,
      sellerName: l.sellerName,
      quantity: l.quantity,
      price: l.price,
      isSellerAwake: l.isSellerAwake,
      deliveryOptIn: l.deliveryOptIn,
      deliveryFee: l.deliveryFee,
      isUnverified: l.isUnverified,
      unverifiedProductName: l.unverifiedProductName,
    }));

  // Check if active stock exists for this product in hostel, but ALL of it belongs to current user
  const activeProductListingsInHostel = hostelListings.filter(
    (l) =>
      (l.productId === product.id || (product.isUnverified && l.unverifiedProductName === product.name)) &&
      l.isSellerAwake &&
      l.quantity > 0
  );
  const isOnlyUserStocking =
    activeProductListingsInHostel.length > 0 &&
    activeProductListingsInHostel.every((l) => user.uid && l.sellerUid === user.uid);

  // Apply delivery filter if selected, then sort by proximity
  const deliveryFiltered =
    deliveryFilter === 'delivery'
      ? productListings.filter((l) => l.deliveryOptIn)
      : productListings;

  const filteredListings = sortListingsByProximity(deliveryFiltered, userRoom);

  const totalUnits = productListings.reduce((sum, l) => sum + l.quantity, 0);
  const totalRooms = new Set(productListings.map((l) => l.sellerRoom)).size;

  const lowestPrice =
    productListings.length > 0 ? Math.min(...productListings.map((l) => l.price)) : product.mrp;

  const handleRequestClick = (listingId: string) => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    const method = deliveryFilter === 'delivery' ? 'delivery' : 'pickup';
    navigate(`/request-confirm/${listingId}?method=${method}`);
  };

  return (
    <div className="font-sans min-h-screen w-full flex flex-col overflow-x-hidden select-none bg-[#121414] text-[#e2e2e2] pb-28">
      {/* Top App Bar Header */}
      <header className="sticky top-0 z-40 bg-[#121414]/90 backdrop-blur-xl border-b border-[#333535]/30 flex justify-between items-center w-full px-container-padding h-16">
        <button
          type="button"
          onClick={() => navigate('/catalog')}
          className="w-9 h-9 rounded-full bg-[#1e2020] flex items-center justify-center border border-[#333535] active:scale-95 transition-transform cursor-pointer"
        >
          <span className="material-symbols-outlined text-on-surface text-xl">arrow_back</span>
        </button>

        <div className="text-center flex flex-col items-center">
          <span className="text-[10px] font-semibold text-primary-container uppercase tracking-wider">
            {userHostel} Hostel Shelf
          </span>
          <h1 className="text-base font-extrabold text-on-surface tracking-tight uppercase italic flex items-center gap-1.5">
            <span>{product.name}</span>
            {product.isUnverified && (
              <span className="text-[9px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1 py-0.2 rounded not-italic">
                Unverified
              </span>
            )}
          </h1>
        </div>

        <div className="w-9"></div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 px-container-padding pt-4 flex flex-col gap-5 max-w-md mx-auto w-full">
        {/* Product Hero Banner */}
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-3xl p-5 flex items-center justify-between relative overflow-hidden shadow-xl">
          <div className="flex items-center gap-4 z-10">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-16 h-16 object-contain rounded-2xl bg-black/40 p-1.5 border border-[#333535] drop-shadow-md"
            />
            <div>
              <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                {product.category} • {product.subcategory}
              </span>
              <h2 className="text-lg font-extrabold text-white leading-tight">
                {product.name}
              </h2>
              <div className="flex items-center gap-2 mt-1 font-mono">
                <span className="text-sm font-extrabold text-primary-container">
                  Best ₹{lowestPrice}
                </span>
                <span className="text-xs text-on-surface-variant line-through">
                  MRP ₹{product.mrp}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Switcher */}
        <div className="flex bg-[#1e2020] rounded-full p-1 border border-[#333535]/40">
          <button
            type="button"
            onClick={() => setDeliveryFilter('all')}
            className={`flex-1 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer ${
              deliveryFilter === 'all'
                ? 'bg-primary-container text-black neon-glow shadow-md'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            All Sellers ({productListings.length})
          </button>

          <button
            type="button"
            onClick={() => setDeliveryFilter('delivery')}
            className={`flex-1 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center justify-center gap-1 ${
              deliveryFilter === 'delivery'
                ? 'bg-primary-container text-black neon-glow shadow-md'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span>🚚 Delivery Only</span>
          </button>
        </div>

        {/* Room Sellers List */}
        <div className="flex flex-col gap-3">
          {filteredListings.length === 0 ? (
            <div className="bg-[#181a1a] border border-[#2a2c2c] rounded-3xl p-6 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#242626] flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-2xl">sentiment_dissatisfied</span>
              </div>

              {isOnlyUserStocking ? (
                <div>
                  <h3 className="text-sm font-bold text-amber-400">
                    You are the only seller stocking this tonight!
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Your room currently has active stock for this item. Other students in {userHostel} will see your listing on their shelf!
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-bold text-white">
                    No active sellers nearby right now
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Nobody in {userHostel} has this item listed tonight. Check back later or suggest it on the Leaderboard!
                  </p>
                </div>
              )}
            </div>
          ) : (
            filteredListings.map((listing) => {
              const proximityLabel = getProximityLabel(userRoom, listing.sellerRoom);

              return (
                <div
                  key={listing.id}
                  className="bg-[#121212] border border-[#1F1F1F] hover:border-primary-container/40 rounded-3xl p-4 flex justify-between items-center transition-all duration-200"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-white">
                        Room {listing.sellerRoom}
                      </h3>
                      <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                        {proximityLabel}
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-variant font-medium">
                      Seller: <strong className="text-white">{listing.sellerName}</strong>
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-mono font-extrabold text-primary-container">
                        ₹{listing.price}
                      </span>
                      <span className="text-[10px] text-on-surface-variant bg-[#1e2020] px-2 py-0.5 rounded-full font-mono border border-[#333535]">
                        {listing.quantity} in stock
                      </span>
                      {listing.deliveryOptIn && (
                        <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 font-bold">
                          🚚 Delivery (+₹{listing.deliveryFee || 5})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleAdminDeleteListing(listing.id, product?.name || (listing as any).productName || 'Item')}
                        className="w-9 h-9 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                        title="Admin Moderation: Delete Listing"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRequestClick(listing.id)}
                      className="bg-primary-container text-black font-extrabold text-xs px-4 py-3 rounded-full uppercase tracking-wider neon-glow hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md"
                    >
                      Request
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Docked Navigation Bar */}
      <BottomNavBar activeTab="shelf" />
    </div>
  );
};
