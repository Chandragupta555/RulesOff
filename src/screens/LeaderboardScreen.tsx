import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { MOCK_PRODUCTS, MOCK_WEEKLY_SALES } from '../data/mockCatalog';
import { BottomNavBar } from '../components/BottomNavBar';

interface HostelTrade {
  hostel: string;
  trades: number;
}

const MOCK_HOSTEL_TRADES: HostelTrade[] = [
  { hostel: 'Shivalik', trades: 312 },
  { hostel: 'Aravali', trades: 265 },
  { hostel: 'Kurukshetra', trades: 218 },
  { hostel: 'Himalaya', trades: 194 },
  { hostel: 'Kalpana Chawala', trades: 175 },
  { hostel: 'Vindhya', trades: 142 },
];

const PRE_APPROVED_CATEGORIES = [
  'Maggi',
  'Chips',
  'Cold Drinks',
  'Biscuits',
  'Chocolate',
  'Ice Cream',
  'Bread/Bun',
  'Other Snacks',
];

interface WantedProduct {
  id: string;
  name: string;
  votes: number;
  hasVoted?: boolean;
}

const INITIAL_WANTED: WantedProduct[] = [
  { id: 'w1', name: 'Red Bull Energy Drink', votes: 18 },
  { id: 'w2', name: 'Nutella Hazelnut Dip', votes: 14 },
  { id: 'w3', name: 'Amul Chocolate Milk', votes: 9 },
];

export const LeaderboardScreen: React.FC = () => {
  const { user } = useUser();
  const userHostel = user.hostel || 'Shivalik';

  const [activeTab, setActiveTab] = useState<'hostels' | 'products'>('hostels');
  const [wantedList, setWantedList] = useState<WantedProduct[]>(INITIAL_WANTED);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(PRE_APPROVED_CATEGORIES[0]);

  // Sort hostels by trade count descending
  const sortedHostels = [...MOCK_HOSTEL_TRADES].sort((a, b) => b.trades - a.trades);

  // Products weekly sales from MOCK_WEEKLY_SALES
  const productLeaderboard = MOCK_PRODUCTS.map((p) => ({
    ...p,
    sales: MOCK_WEEKLY_SALES[p.id] || 0,
  })).sort((a, b) => b.sales - a.sales);

  const totalSalesThisWeek = productLeaderboard.reduce((sum, p) => sum + p.sales, 0);

  const handleUpvote = (id: string) => {
    setWantedList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const hasVoted = item.hasVoted;
          return {
            ...item,
            votes: hasVoted ? item.votes - 1 : item.votes + 1,
            hasVoted: !hasVoted,
          };
        }
        return item;
      })
    );
  };

  const handleAddSuggestion = () => {
    const newItem: WantedProduct = {
      id: `w-${Date.now()}`,
      name: `${selectedCategory} Pack`,
      votes: 1,
      hasVoted: true,
    };
    setWantedList((prev) => [newItem, ...prev]);
    setIsSuggestModalOpen(false);
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
            Weekly Midnight Standings
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

            {sortedHostels.map((item, index) => {
              const rank = index + 1;
              const isTop = rank === 1;
              const isLast = rank === sortedHostels.length;
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
                    <span className="text-lg font-extrabold text-primary-container block">
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

              {totalSalesThisWeek > 0 ? (
                productLeaderboard.map((product, index) => (
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
                        className="w-11 h-11 object-cover rounded-xl bg-black border border-[#333535]"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          {product.name}
                        </h3>
                        <span className="text-xs text-on-surface-variant">
                          MRP ₹{product.mrp}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-white">
                        {product.sales}
                      </span>
                      <span className="text-[10px] text-on-surface-variant block uppercase">
                        {product.sales === 1 ? 'unit' : 'units'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#121212] border border-[#1F1F1F] rounded-2xl p-6 text-center flex flex-col items-center">
                  <span className="text-4xl mb-2">📊</span>
                  <p className="text-sm font-bold text-on-surface mb-1">
                    No trades yet this week — be the first!
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Fulfilled requests will automatically update top product ranks here.
                  </p>
                </div>
              )}
            </div>

            {/* Wanted But Not In Stock Section */}
            <div className="flex flex-col gap-3 pt-2 border-t border-[#1F1F1F]">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-extrabold text-white">
                    Wanted But Not In Stock
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Vote for snacks sellers should stock
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                {wantedList.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#181a1a] border border-[#2a2c2c] rounded-2xl p-3.5 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-white">{item.name}</h3>
                      <span className="text-xs text-on-surface-variant">
                        {item.votes} students requested
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUpvote(item.id)}
                      className={`px-3.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        item.hasVoted
                          ? 'bg-primary-container text-black font-extrabold neon-glow'
                          : 'bg-[#262828] text-primary-container border border-primary-container/40 hover:bg-primary-container/20'
                      }`}
                    >
                      <span>👍</span>
                      <span>{item.votes}</span>
                    </button>
                  </div>
                ))}
              </div>

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

      {/* Suggestion Modal with Pre-Approved Dropdown (No Free Text) */}
      {isSuggestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121414] border border-primary-container/40 rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">
                Suggest a Product
              </h2>
              <button
                type="button"
                onClick={() => setIsSuggestModalOpen(false)}
                className="text-on-surface-variant hover:text-white w-8 h-8 rounded-full bg-[#1e2020] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Select a pre-approved snack category to add to the hostel wanted list:
            </p>

            {/* Strictly Dropdown Selection - No Free Text Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-primary-container uppercase tracking-wider">
                Select Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-bold rounded-2xl px-4 py-3.5 focus:outline-none focus:border-primary-container transition-colors cursor-pointer text-sm"
              >
                {PRE_APPROVED_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#121414] text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsSuggestModalOpen(false)}
                className="flex-1 py-3 rounded-full font-bold text-xs uppercase tracking-wider text-on-surface-variant bg-[#1e2020] hover:bg-[#282a2b] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSuggestion}
                className="flex-1 py-3 rounded-full font-extrabold text-xs uppercase tracking-wider text-black bg-primary-container neon-glow active:scale-95 transition-all cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Docked Navigation Bar */}
      <BottomNavBar activeTab="rank" />
    </div>
  );
};
