import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { MOCK_PRODUCTS, MOCK_LISTINGS, getProximityLabel, sortListingsByProximity } from '../data/mockCatalog';
import { BottomNavBar } from '../components/BottomNavBar';

export const RoomListScreen: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();

  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'delivery'>('all');
  const [requestToast, setRequestToast] = useState<string | null>(null);

  const product = MOCK_PRODUCTS.find((p) => p.id === productId) || MOCK_PRODUCTS[0];
  const userHostel = user.hostel || 'Shivalik';
  const userRoom = user.roomNumber || 'A304';

  // Available listings for this product where seller is awake and quantity > 0
  const allListings = MOCK_LISTINGS.filter(
    (l) =>
      (l.hostel === userHostel || !userHostel) &&
      l.productId === product.id &&
      l.isSellerAwake &&
      l.quantity > 0
  );

  // Apply delivery filter if selected, then sort by proximity
  const deliveryFiltered =
    deliveryFilter === 'delivery'
      ? allListings.filter((l) => l.deliveryOptIn)
      : allListings;
  const filteredListings = sortListingsByProximity(deliveryFiltered, userRoom);

  const totalUnits = allListings.reduce((sum, l) => sum + l.quantity, 0);
  const totalRooms = new Set(allListings.map((l) => l.sellerRoom)).size;

  const lowestPrice =
    allListings.length > 0 ? Math.min(...allListings.map((l) => l.price)) : product.mrp;

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
          <p className="text-xs text-on-surface-variant font-medium">
            {totalUnits} {totalUnits === 1 ? 'unit' : 'units'} across {totalRooms}{' '}
            {totalRooms === 1 ? 'room' : 'rooms'}
          </p>
        </div>

        <button
          type="button"
          className="text-on-surface-variant hover:opacity-80 active:scale-95 transition-transform w-10 h-10 flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
        </button>
      </header>

      {/* Toast Notification */}
      {requestToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-black font-bold px-4 py-2.5 rounded-full text-xs shadow-2xl animate-bounce flex items-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{requestToast}</span>
        </div>
      )}

      {/* Main Canvas */}
      <main className="w-full px-container-padding pt-4 flex flex-col gap-4 max-w-md mx-auto flex-1">
        {/* Delivery / Pickup Toggles */}
        <div className="flex bg-[#1e2020] rounded-full p-1 border border-[#333535]/40 mb-1">
          <button
            type="button"
            onClick={() => setDeliveryFilter('all')}
            className={`flex-1 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer ${
              deliveryFilter === 'all'
                ? 'bg-primary-container text-black neon-glow shadow-md'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Pickup
          </button>
          <button
            type="button"
            onClick={() => setDeliveryFilter('delivery')}
            className={`flex-1 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer ${
              deliveryFilter === 'delivery'
                ? 'bg-primary-container text-black neon-glow shadow-md'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Delivery
          </button>
        </div>

        {/* List of Room Cards */}
        {filteredListings.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredListings.map((listing) => {
              const floorLabel = getProximityLabel(userRoom, listing.sellerRoom);
              const isBestPrice = listing.price === lowestPrice;

              return (
                <div
                  key={listing.id}
                  className="bg-[#121212] border border-[#1F1F1F] hover:border-primary-container/40 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-extrabold text-on-surface mb-1">
                        Room {listing.sellerRoom}
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-500/20">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                          Awake now
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="text-xl font-extrabold text-primary-container">
                        {listing.quantity}{' '}
                        <span className="text-xs font-normal text-on-surface-variant">
                          {listing.quantity === 1 ? 'unit' : 'units'}
                        </span>
                      </span>
                      {listing.pendingRequestsCount && (
                        <span className="text-[10px] text-primary-container/80 bg-primary-container/10 px-2 py-0.5 rounded-full mt-1 border border-primary-container/30 font-semibold">
                          {listing.pendingRequestsCount} pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Floor, Price & Best Price Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="text-xs font-medium text-on-surface-variant bg-[#1e2020] px-3 py-1 rounded-full border border-[#333535]">
                      {floorLabel}
                    </span>

                    <span className="text-xs font-semibold text-on-surface-variant bg-[#1e2020] px-3 py-1 rounded-full border border-[#333535]">
                      ₹{listing.price}
                    </span>

                    {isBestPrice && (
                      <span className="text-xs font-bold text-green-400 bg-green-500/15 px-2.5 py-1 rounded-full border border-green-500/30">
                        Best Price
                      </span>
                    )}

                    {listing.deliveryOptIn && (
                      <span className="text-xs font-medium text-primary/80 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                        Delivery Available
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={() => handleRequestClick(listing.id)}
                    className="mt-1 w-full py-3.5 rounded-full font-bold text-sm uppercase tracking-wider text-black bg-primary-container neon-glow active:scale-95 transition-transform cursor-pointer hover:brightness-110"
                  >
                    Request
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-[#121212] rounded-2xl border border-[#1F1F1F] mt-4">
            <span className="text-5xl mb-3">😴</span>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Everyone's asleep on this one — try again later or suggest restocking.
            </p>
            <button
              type="button"
              onClick={() => alert(`Restock request sent for ${product.name}!`)}
              className="w-full py-3.5 rounded-full font-bold text-xs text-primary bg-transparent border-2 border-primary-container hover:bg-primary-container/10 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
            >
              Suggest Restock
            </button>
          </div>
        )}
      </main>

      {/* Docked Navigation Bar */}
      <BottomNavBar activeTab="shelf" />
    </div>
  );
};
