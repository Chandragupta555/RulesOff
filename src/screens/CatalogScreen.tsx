import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Product, ProductAggregate } from '../types/catalog';
import { MOCK_PRODUCTS } from '../data/mockCatalog';
import { BottomNavBar } from '../components/BottomNavBar';
import { FirestoreListing, subscribeToHostelListings } from '../firebase/listings';
import { subscribeToMasterProducts } from '../firebase/masterCatalog';

export const CatalogScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useUser();

  const [hostelListings, setHostelListings] = useState<FirestoreListing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [masterProducts, setMasterProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Subscribe in real-time to master catalog products in Firestore
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

  const userHostel = user.hostel;
  const userRoom = user.roomNumber;

  // Subscribe in real-time to all listings for user's hostel in Firestore
  useEffect(() => {
    setIsLoadingListings(true);
    const unsubscribe = subscribeToHostelListings(userHostel, (items) => {
      setHostelListings(items);
      setIsLoadingListings(false);
    });
    return () => unsubscribe();
  }, [userHostel]);

  // Aggregate Firestore listings by product
  const rawAggregates: ProductAggregate[] = allProducts.map((product) => {
    const matchingListings = hostelListings.filter(
      (l) => l.productId === product.id && l.isSellerAwake && l.quantity > 0
    );

    const totalUnits = matchingListings.reduce((sum, l) => sum + l.quantity, 0);
    const awakeRooms = new Set(matchingListings.map((l) => l.sellerRoom));
    const lowestPrice =
      matchingListings.length > 0
        ? Math.min(...matchingListings.map((l) => l.price))
        : product.mrp;

    let badge: 'Almost Gone' | 'Last One' | 'Out of Stock' | undefined = undefined;
    if (totalUnits === 0) {
      badge = 'Out of Stock';
    } else if (totalUnits === 1) {
      badge = 'Last One';
    } else if (totalUnits <= 3) {
      badge = 'Almost Gone';
    }

    return {
      product,
      totalUnits,
      awakeRoomCount: awakeRooms.size,
      availableListings: matchingListings.map((l) => ({
        id: l.id || '',
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
      })),
      lowestPrice,
      badge,
    };
  });

  // Dynamic Two-Tier Sort:
  // Tier 1: In-Stock items (totalUnits > 0), sorted alphabetically by product name
  // Tier 2: Out-of-Stock items (totalUnits === 0), sorted alphabetically by product name
  const sortedAggregates = [...rawAggregates].sort((a, b) => {
    const aInStock = a.totalUnits > 0;
    const bInStock = b.totalUnits > 0;

    if (aInStock && !bInStock) return -1;
    if (!aInStock && bInStock) return 1;

    return a.product.name.localeCompare(b.product.name, undefined, { sensitivity: 'base' });
  });

  // Real-Time Search Filter: Filters sortedAggregates based on searchQuery
  const filteredAggregates = sortedAggregates.filter((agg) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    const nameMatch = agg.product.name.toLowerCase().includes(query);
    const categoryMatch = agg.product.category.toLowerCase().includes(query);
    const subcategoryMatch = (agg.product.subcategory || '').toLowerCase().includes(query);
    return nameMatch || categoryMatch || subcategoryMatch;
  });

  // Ticker text from active Firestore listings
  const activeSellersList = hostelListings.filter((l) => l.isSellerAwake && l.quantity > 0);
  const tickerText =
    activeSellersList.length > 0
      ? activeSellersList
          .map(
            (l) =>
              `🔥 ${l.sellerName.toUpperCase()} HAS ${l.quantity}x ${l.productName.toUpperCase()} IN ROOM ${l.sellerRoom}`
          )
          .join(' • ') +
        ` • ⚡ LIVE SHELF UPDATED IN ${userHostel.toUpperCase()} • `
      : `⚡ NO ACTIVE SELLERS YET IN ${userHostel.toUpperCase()} • ADD YOUR ITEMS ON PROFILE SCREEN TO SELL TONIGHT • `;

  const handleCardClick = (productId: string) => {
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }
    navigate(`/catalog/${productId}`);
  };

  return (
    <div className="font-sans min-h-screen w-full flex flex-col overflow-x-hidden select-none bg-[#121414] text-[#e2e2e2] pb-24">
      {/* Top Header Navigation Area */}
      <header className="fixed top-0 left-0 w-full z-40 bg-[#121414]/95 backdrop-blur-md px-container-padding pt-6 pb-4 flex flex-col gap-4 border-b border-[#1F1F1F]">
        {/* Utility Row: Location Badge & Notifications */}
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2 bg-[#1e2020] rounded-full px-3.5 py-1.5 border border-[#333535]">
            <span className="material-symbols-outlined text-primary-container text-base">location_on</span>
            <span className="text-xs font-semibold text-on-surface">
              {userHostel}, Room {userRoom}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(15);
              navigate('/requests?tab=incoming');
            }}
            className="w-9 h-9 rounded-full bg-[#1e2020] flex items-center justify-center border border-[#333535] relative active:scale-95 transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-on-surface text-xl">notifications</span>
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-container rounded-full"></div>
          </button>
        </div>

        {/* Title Row */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface uppercase tracking-wide drop-shadow-[0_0_10px_rgba(255,95,31,0.2)]">
            Tonight's Shelf
          </h1>
          <div className="w-3 h-3 bg-primary-container rounded-full animate-ping"></div>
        </div>

        {/* Live Marquee Ticker */}
        <div className="w-full bg-[#121212] border border-[#1F1F1F] rounded-xl py-2.5 px-4 flex items-center overflow-hidden max-w-full">
          <div className="ticker-wrap h-5 flex items-center w-full overflow-hidden max-w-full relative">
            <div className="ticker text-xs font-semibold text-primary-container uppercase tracking-wider neon-text-glow">
              {tickerText} {tickerText}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 pt-[205px] px-container-padding flex flex-col gap-4 max-w-md mx-auto w-full">
        {/* Real-Time Search Bar */}
        <div className="relative w-full">
          <div className="relative flex items-center w-full bg-[#1e2020] border-2 border-[#333535] focus-within:border-primary-container rounded-2xl transition-colors shadow-inner">
            <span className="material-symbols-outlined text-primary-container text-xl pl-3.5 pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search snacks by name or brand..."
              className="w-full bg-transparent text-white font-sans text-sm py-3 pl-3 pr-10 focus:outline-none placeholder:text-on-surface-variant/60 font-semibold"
            />
            {searchQuery.trim() !== '' && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 w-6 h-6 rounded-full bg-[#2a2c2c] hover:bg-[#383a3a] text-on-surface-variant hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Empty State vs Product Grid */}
        {filteredAggregates.length === 0 ? (
          <div className="bg-[#181a1a] border border-[#2a2c2c] rounded-3xl p-8 text-center flex flex-col items-center gap-3 my-4">
            <div className="w-12 h-12 rounded-full bg-[#242626] flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-2xl">search_off</span>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                No snacks match "{searchQuery}"
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Try checking for typos or searching by brand or category (e.g., "Kurkure", "Chips", "Noodles").
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-1 bg-primary-container text-black font-extrabold text-xs px-4 py-2 rounded-full uppercase tracking-wider neon-glow hover:brightness-110 cursor-pointer transition-all active:scale-95"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredAggregates.map((agg) => {
              const isAvailable = agg.totalUnits > 0;
              return (
                <div
                  key={agg.product.id}
                  onClick={() => handleCardClick(agg.product.id)}
                  className={`bg-[#121212] border rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden transition-all duration-200 cursor-pointer ${
                    isAvailable
                      ? 'border-[#ff5f1f]/50 hover:border-[#ff5f1f] neon-glow active:scale-95'
                      : 'border-[#1F1F1F] opacity-75 hover:border-primary-container/30'
                  }`}
                >
                  {/* Badge Tag */}
                  {agg.badge && (
                    <div className="absolute top-2 right-2 z-20">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                          agg.badge === 'Out of Stock'
                            ? 'bg-error-container/20 text-error border-error'
                            : agg.badge === 'Last One'
                            ? 'bg-error-container/20 text-error border-error animate-pulse'
                            : 'bg-primary-container/20 text-primary-container border-primary-container'
                        }`}
                      >
                        {agg.badge}
                      </span>
                    </div>
                  )}

                  {/* Product Image Illustration */}
                  <div
                    className={`h-24 w-full flex items-center justify-center relative z-10 ${
                      !isAvailable ? 'grayscale' : ''
                    }`}
                  >
                    <div className="absolute inset-0 bg-primary-container/5 rounded-xl blur-lg pointer-events-none"></div>
                    <img
                      src={agg.product.imageUrl}
                      alt={agg.product.name}
                      className="h-20 w-auto object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]"
                      loading="lazy"
                    />
                  </div>

                  {/* Details Section */}
                  <div className="flex flex-col gap-1 z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider truncate">
                        {agg.product.subcategory || agg.product.category}
                      </span>
                      {agg.product.isCustomApproved && (
                        <span className="text-[9px] font-bold text-green-400 bg-green-500/15 border border-green-500/30 px-1 py-0.2 rounded shrink-0">
                          New
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-on-surface tracking-tight leading-tight">
                      {agg.product.name}
                    </h3>

                    {/* Pricing & Stock Stats Row */}
                    <div className="flex justify-between items-baseline mt-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-extrabold text-primary-container font-mono">
                          ₹{agg.lowestPrice}
                        </span>
                        {agg.lowestPrice < agg.product.mrp && (
                          <span className="text-[10px] text-on-surface-variant line-through font-mono">
                            ₹{agg.product.mrp}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-on-surface-variant font-medium">
                        MRP ₹{agg.product.mrp}
                      </span>
                    </div>

                    {/* Stock Availability Footer */}
                    <div className="mt-2 pt-2 border-t border-[#1F1F1F] flex justify-between items-center text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isAvailable ? 'bg-green-400 animate-pulse' : 'bg-slate-600'
                          }`}
                        ></span>
                        <span className="font-bold text-on-surface">
                          {isAvailable ? `${agg.totalUnits} available` : 'None nearby'}
                        </span>
                      </div>

                      {isAvailable && (
                        <span className="text-on-surface-variant font-medium">
                          {agg.awakeRoomCount} {agg.awakeRoomCount === 1 ? 'room' : 'rooms'}
                        </span>
                      )}
                    </div>
                  </div>
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
