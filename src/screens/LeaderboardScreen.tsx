import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { MOCK_PRODUCTS, PRODUCT_CATEGORIES } from '../data/mockCatalog';
import { BottomNavBar } from '../components/BottomNavBar';
import { HostelName } from '../types/user';
import { FirestoreListing, subscribeToHostelListings } from '../firebase/listings';
import {
  WeeklySalesDoc,
  ProductSuggestionDoc,
  subscribeToHostelSales,
  subscribeToAllHostelSales,
  subscribeToProductSuggestions,
  suggestProductDoc,
  voteSuggestionDoc
} from '../firebase/leaderboard';

const PEC_HOSTELS: HostelName[] = [
  'Shivalik',
  'Aravali',
  'Kurukshetra',
  'Himalaya',
  'Kalpana Chawala',
  'Vindhya',
];

export const LeaderboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const userHostel = (user.hostel as HostelName) || 'Shivalik';

  const [activeTab, setActiveTab] = useState<'hostels' | 'products'>('hostels');

  // Real-time Firestore State
  const [allHostelSales, setAllHostelSales] = useState<WeeklySalesDoc[]>([]);
  const [myHostelSales, setMyHostelSales] = useState<WeeklySalesDoc[]>([]);
  const [suggestions, setSuggestions] = useState<ProductSuggestionDoc[]>([]);
  const [hostelListings, setHostelListings] = useState<FirestoreListing[]>([]);

  // Modal State
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(MOCK_PRODUCTS[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subscribe to Firestore collections live
  useEffect(() => {
    const unsubAll = subscribeToAllHostelSales((sales) => {
      setAllHostelSales(sales);
    });

    const unsubHostel = subscribeToHostelSales(userHostel, (sales) => {
      setMyHostelSales(sales);
    });

    const unsubSuggestions = subscribeToProductSuggestions(userHostel, (items) => {
      setSuggestions(items);
    });

    const unsubListings = subscribeToHostelListings(userHostel, (items) => {
      setHostelListings(items);
    });

    return () => {
      unsubAll();
      unsubHostel();
      unsubSuggestions();
      unsubListings();
    };
  }, [userHostel]);

  // Duplicate in-stock check: check if selected product is currently available from ANOTHER seller in this hostel
  const activeListingInStock = hostelListings.find(
    (l) =>
      l.productId === selectedProductId &&
      l.isSellerAwake &&
      l.quantity > 0 &&
      (!user.uid || l.sellerUid !== user.uid)
  );

  // Check if current user themselves is actively selling this selected product
  const isUserSelfSelling = hostelListings.some(
    (l) =>
      l.productId === selectedProductId &&
      l.isSellerAwake &&
      l.quantity > 0 &&
      user.uid &&
      l.sellerUid === user.uid
  );

  // Aggregate trades per hostel across all products
  const hostelRankings = PEC_HOSTELS.map((hostel) => {
    const matchingSales = allHostelSales.filter((s) => s.hostel === hostel);
    const totalTrades = matchingSales.reduce((sum, s) => sum + (s.totalUnits || 0), 0);
    return {
      hostel,
      trades: totalTrades,
    };
  }).sort((a, b) => b.trades - a.trades);

  // Map product leaderboard for current user's hostel (showing 0 for products with no sales doc yet)
  const productLeaderboard = MOCK_PRODUCTS.map((p) => {
    const saleDoc = myHostelSales.find((s) => s.productId === p.id);
    return {
      ...p,
      sales: saleDoc ? saleDoc.totalUnits : 0,
    };
  }).sort((a, b) => b.sales - a.sales);

  const totalSalesThisWeek = productLeaderboard.reduce((sum, p) => sum + p.sales, 0);

  // Upvote suggestion with duplicate prevention
  const handleUpvote = async (item: ProductSuggestionDoc) => {
    if (!item.id || !user.uid) return;
    const hasVoted = item.voters && item.voters.includes(user.uid);
    if (hasVoted) return; // Prevent duplicate voting

    try {
      if (navigator.vibrate) navigator.vibrate(30);
      await voteSuggestionDoc(item.id, user.uid);
    } catch (err) {
      console.error('Failed to upvote suggestion:', err);
    }
  };

  // Submit new suggestion from pre-approved dropdown list
  const handleAddSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.uid) return;

    const prod = MOCK_PRODUCTS.find((p) => p.id === selectedProductId) || MOCK_PRODUCTS[0];

    setIsSubmitting(true);
    try {
      if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
      await suggestProductDoc(userHostel, prod.id, prod.name, user.uid);
      setIsSuggestModalOpen(false);
    } catch (err) {
      console.error('Failed to suggest product:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans min-h-screen w-full flex flex-col select-none bg-[#121414] text-[#e2e2e2] pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#121414]/90 backdrop-blur-xl border-b border-[#333535]/30 flex flex-col justify-center w-full px-4 pt-3 pb-2">
        <div className="flex justify-between items-center w-full mb-3">
          <h1 className="text-xl font-extrabold text-primary-container tracking-tight italic uppercase drop-shadow-[0_0_8px_rgba(255,95,31,0.4)]">
            Leaderboard
          </h1>
          <span className="text-[11px] text-on-surface-variant font-semibold bg-[#1e2020] px-3 py-1 rounded-full border border-[#333535]">
            Weekly Standings • {userHostel}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#1e2020] rounded-full p-1 border border-[#333535]/40">
          <button
            type="button"
            onClick={() => setActiveTab('hostels')}
            className={`flex-1 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer ${
              activeTab === 'hostels'
                ? 'bg-primary-container text-black neon-glow shadow-md'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Hostels
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer ${
              activeTab === 'products'
                ? 'bg-primary-container text-black neon-glow shadow-md'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Products
          </button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="w-full px-4 pt-4 flex flex-col gap-4 max-w-md mx-auto flex-1">
        {/* HOSTELS TAB */}
        {activeTab === 'hostels' && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs text-on-surface-variant px-1">
              <span>Hostel Rank</span>
              <span>Total Weekly Trades</span>
            </div>

            {hostelRankings.map((item, index) => {
              const rank = index + 1;
              const isTop = rank === 1 && item.trades > 0;
              const isLast = rank === hostelRankings.length;
              const isUserHostel = item.hostel.toLowerCase() === userHostel.toLowerCase();

              return (
                <div
                  key={item.hostel}
                  className={`rounded-2xl p-4 flex items-center justify-between transition-all relative overflow-hidden ${
                    isTop
                      ? 'bg-[#181410] border-2 border-primary-container neon-glow'
                      : isUserHostel
                      ? 'bg-[#121818] border-2 border-green-500/60 shadow-lg'
                      : 'bg-[#121212] border border-[#1F1F1F]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Rank Badge */}
                    <div
                      className={`w-9 h-9 rounded-full font-extrabold flex items-center justify-center text-sm ${
                        isTop
                          ? 'bg-primary-container text-black'
                          : rank === 2
                          ? 'bg-slate-300 text-black'
                          : rank === 3
                          ? 'bg-amber-600 text-white'
                          : 'bg-[#242626] text-on-surface-variant'
                      }`}
                    >
                      #{rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-extrabold text-white">
                          {item.hostel}
                        </h2>
                        {isUserHostel && (
                          <span className="text-[10px] font-bold text-green-400 bg-green-500/15 border border-green-500/30 px-2 py-0.5 rounded-full uppercase">
                            Your Hostel
                          </span>
                        )}
                        {isTop && (
                          <span className="text-[10px] font-extrabold text-black bg-primary-container px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                            <span className="material-symbols-outlined text-xs">emoji_events</span>
                            Hostel Hero
                          </span>
                        )}
                        {isLast && (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/60 border border-slate-700 px-2 py-0.5 rounded-full">
                            Sleepy Hostel 😴
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        PEC Chandigarh Hostel
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-extrabold text-primary-container block font-mono">
                      {item.trades}
                    </span>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                      trades
                    </span>
                  </div>
                </div>
              );
            })}

            <p className="text-center text-[11px] text-on-surface-variant italic mt-3">
              ⏰ Resets every Monday at 4 AM
            </p>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="flex flex-col gap-5">
            {/* Real Weekly Sales Leaderboard */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs text-on-surface-variant px-1">
                <span>Top Snacks in {userHostel}</span>
                <span>Units Sold This Week</span>
              </div>

              {productLeaderboard.map((product, index) => (
                <div
                  key={product.id}
                  className="bg-[#121212] border border-[#1F1F1F] rounded-2xl p-3.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-primary-container w-6">
                      #{index + 1}
                    </span>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-11 h-11 object-contain rounded-xl bg-black/40 p-1 border border-[#333535]"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {product.name}
                      </h3>
                      <span className="text-xs text-on-surface-variant font-mono">
                        MRP ₹{product.mrp}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-white font-mono">
                      {product.sales}
                    </span>
                    <span className="text-[10px] text-on-surface-variant block uppercase">
                      {product.sales === 1 ? 'unit' : 'units'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Wanted But Not In Stock Section (Firestore productSuggestions) */}
            <div className="flex flex-col gap-3 pt-2 border-t border-[#1F1F1F]">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-extrabold text-white">
                    Wanted But Not In Stock 💡
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Vote for snacks sellers should stock in {userHostel}
                  </p>
                </div>
              </div>

              {suggestions.length === 0 ? (
                <div className="bg-[#181a1a] border border-[#2a2c2c] rounded-2xl p-4 text-center">
                  <p className="text-xs font-semibold text-on-surface-variant">
                    No product suggestions submitted yet. Be the first!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {suggestions.map((item) => {
                    const hasVoted = user.uid ? item.voters?.includes(user.uid) : false;
                    return (
                      <div
                        key={item.id}
                        className="bg-[#181a1a] border border-[#2a2c2c] rounded-2xl p-3.5 flex items-center justify-between"
                      >
                        <div>
                          <h3 className="text-sm font-bold text-white">{item.productName}</h3>
                          <span className="text-xs text-on-surface-variant font-mono">
                            {item.voteCount} {item.voteCount === 1 ? 'student requested' : 'students requested'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleUpvote(item)}
                          disabled={hasVoted}
                          className={`px-3.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            hasVoted
                              ? 'bg-primary-container text-black font-extrabold neon-glow opacity-90'
                              : 'bg-[#262828] text-primary-container border border-primary-container/40 hover:bg-primary-container/20 active:scale-95'
                          }`}
                        >
                          <span>👍</span>
                          <span>{hasVoted ? 'Voted' : 'Vote'} ({item.voteCount})</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Suggest a Product Button */}
              <button
                type="button"
                onClick={() => setIsSuggestModalOpen(true)}
                className="w-full py-3.5 mt-1 rounded-full font-bold text-xs uppercase tracking-wider text-primary border-2 border-primary-container hover:bg-primary-container/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>+ Suggest a Product</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Suggestion Modal with Pre-Approved Categorized Dropdown (No Free Text) */}
      {isSuggestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121414] border border-primary-container/40 rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">
                Suggest a Product
              </h2>
              <button
                type="button"
                onClick={() => setIsSuggestModalOpen(false)}
                className="text-on-surface-variant hover:text-white w-8 h-8 rounded-full bg-[#1e2020] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Select a pre-approved product to request sellers to stock in {userHostel}:
            </p>

            <form onSubmit={handleAddSuggestion} className="flex flex-col gap-4">
              {/* Strictly Dropdown Selection - Pre-Approved Categorized Products */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-primary-container uppercase tracking-wider">
                  Select Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-bold rounded-2xl px-4 py-3.5 focus:outline-none focus:border-primary-container transition-colors cursor-pointer text-sm"
                >
                  {PRODUCT_CATEGORIES.map((category) => {
                    const groupItems = MOCK_PRODUCTS.filter((p) => p.category === category);
                    if (groupItems.length === 0) return null;
                    return (
                      <optgroup
                        key={category}
                        label={category}
                        className="bg-[#121414] text-primary-container font-extrabold"
                      >
                        {groupItems.map((prod) => (
                          <option key={prod.id} value={prod.id} className="bg-[#121414] text-white font-normal">
                            {prod.name} (MRP ₹{prod.mrp})
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>

              {/* USER SELF-SELLING WARNING OR DUPLICATE IN-STOCK ALERT BANNER */}
              {isUserSelfSelling ? (
                <div className="bg-red-500/15 border border-red-500/40 rounded-2xl p-3.5 flex items-center gap-2 text-red-300 font-extrabold text-xs animate-fade-in">
                  <span className="material-symbols-outlined text-base text-red-400">block</span>
                  <span>You're already selling this — no need to suggest it!</span>
                </div>
              ) : activeListingInStock ? (
                <div className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-3.5 flex flex-col gap-2 animate-fade-in">
                  <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs">
                    <span className="material-symbols-outlined text-base">info</span>
                    <span>This is already available tonight!</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    A seller in {userHostel} (Room {activeListingInStock.sellerRoom}) currently has this item in stock right now.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSuggestModalOpen(false);
                      navigate(`/catalog/${selectedProductId}`);
                    }}
                    className="bg-amber-500 text-black font-extrabold text-xs py-2 px-3.5 rounded-xl uppercase tracking-wider hover:brightness-110 flex items-center justify-center gap-1.5 cursor-pointer self-start shadow-md transition-all active:scale-95"
                  >
                    <span>View on Shelf</span>
                    <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                  </button>
                </div>
              ) : null}

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsSuggestModalOpen(false)}
                  className="flex-1 py-3 rounded-full font-bold text-xs uppercase tracking-wider text-on-surface-variant bg-[#1e2020] hover:bg-[#282a2b] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUserSelfSelling}
                  className={`flex-1 py-3 rounded-full font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    isUserSelfSelling
                      ? 'bg-[#242626] text-on-surface-variant/50 border border-[#333535] cursor-not-allowed'
                      : 'text-black bg-primary-container neon-glow active:scale-95'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Docked Navigation Bar */}
      <BottomNavBar activeTab="rank" />
    </div>
  );
};
