import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { MOCK_PRODUCTS, getProximityLabel, sortListingsByProximity } from '../data/mockCatalog';
import { BottomNavBar } from '../components/BottomNavBar';
import { FirestoreListing, subscribeToHostelListings } from '../firebase/listings';
import { Listing } from '../types/catalog';

export const RoomListScreen: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();

  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'delivery'>('all');
  const [hostelListings, setHostelListings] = useState<FirestoreListing[]>([]);

  const product = MOCK_PRODUCTS.find((p) => p.id === productId) || MOCK_PRODUCTS[0];
  const userHostel = user.hostel || 'Shivalik';
  const userRoom = user.roomNumber || 'A304';

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
        l.productId === product.id &&
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
    }));

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
          className="text-on-surface-variant hover:opacity-80 active:scale-95 transition-transform w-10 h-10 rounded-full bg-[#1e2020] flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>

        <div className="flex flex-col items-center">
          <h1 className="text-xl font-extrabold text-primary-container tracking-tight uppercase italic drop-shadow-[0_0_8px_rgba(255,95,31,0.4)]">
            {product.name}
          </h1>
          <span className="text-[10px] text-on-surface-variant font-mono">
            {userHostel} Hostel • Your Room {userRoom}
          </span>
        </div>

        <div className="w-10"></div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 pt-4 px-container-padding flex flex-col gap-4 max-w-md mx-auto w-full">
        {/* Product Banner Summary Card */}
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-16 h-16 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
          />
          <div className="flex flex-col flex-1">
            <h2 className="text-lg font-extrabold text-white leading-tight">
              {product.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base font-extrabold text-primary-container font-mono">
                ₹{lowestPrice}
              </span>
              <span className="text-xs text-on-surface-variant line-through font-mono">
                ₹{product.mrp} MRP
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant/80 mt-1 line-clamp-1">
              {product.description}
            </p>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex justify-between items-center bg-[#121212] border border-[#1F1F1F] rounded-xl p-1.5">
          <button
            type="button"
            onClick={() => setDeliveryFilter('all')}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              deliveryFilter === 'all'
                ? 'bg-primary-container text-black neon-glow'
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            All Rooms ({totalRooms})
          </button>
          <button
            type="button"
            onClick={() => setDeliveryFilter('delivery')}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              deliveryFilter === 'delivery'
                ? 'bg-primary-container text-black neon-glow'
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm font-bold">local_shipping</span>
            <span>Delivery Only</span>
          </button>
        </div>

        {/* Section Title */}
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider">
            Available Rooms Near You ({filteredListings.length})
          </h3>
          <span className="text-[10px] text-primary-container font-mono font-bold">
            Sorted by Proximity
          </span>
        </div>

        {/* Room Cards List */}
        {filteredListings.length === 0 ? (
          <div className="bg-[#121212] border border-[#1F1F1F] rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">
              sentiment_dissatisfied
            </span>
            <div>
              <h4 className="text-sm font-bold text-white">No Sellers Found</h4>
              <p className="text-xs text-on-surface-variant mt-1">
                No rooms in {userHostel} are currently selling {product.name} matching your filter.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredListings.map((listing) => {
              const prox = getProximityLabel(userRoom, listing.sellerRoom);
              return (
                <div
                  key={listing.id}
                  className="bg-[#121212] border border-[#ff5f1f]/30 hover:border-primary-container rounded-2xl p-4 flex flex-col gap-3 relative transition-all duration-200 shadow-lg"
                >
                  {/* Header Row: Room & Proximity Badge */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-primary-container/15 text-primary-container font-extrabold text-sm flex items-center justify-center border border-primary-container/30">
                        {listing.sellerRoom}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                          <span>Room {listing.sellerRoom}</span>
                          <span className="text-[10px] font-normal text-on-surface-variant">
                            ({listing.sellerName})
                          </span>
                        </h4>
                        <span className="text-xs text-primary-container font-bold">
                          {prox}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-base font-extrabold text-primary-container font-mono">
                        ₹{listing.price}
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-mono">
                        {listing.quantity} left
                      </span>
                    </div>
                  </div>

                  {/* Badges & Features Row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {listing.deliveryOptIn ? (
                      <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">local_shipping</span>
                        <span>Delivery Available (+₹{listing.deliveryFee || 5})</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-on-surface-variant bg-[#1e2020] px-2.5 py-1 rounded-full border border-[#333535]">
                        Pickup Only
                      </span>
                    )}

                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      ⚡ Immediate Pickup
                    </span>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={() => handleRequestClick(listing.id)}
                    className="w-full bg-primary-container text-black font-extrabold text-xs uppercase tracking-widest py-3 rounded-xl hover:brightness-110 active:scale-98 transition-all neon-glow flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    <span>Request from Room {listing.sellerRoom}</span>
                    <span className="material-symbols-outlined text-sm font-bold">
                      chevron_right
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
};
