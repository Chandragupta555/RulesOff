import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getProductAggregates } from '../data/mockCatalog';
import { BottomNavBar } from '../components/BottomNavBar';

export const CatalogScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const userHostel = user.hostel || 'Shivalik';
  const userRoom = user.roomNumber || 'A304';

  const aggregates = getProductAggregates(userHostel);

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
              🔥 KARTIK JUST GRABBED MAGGI IN ROOM 212 • 🍿 ARJUN ADDED POPCORN TO THE SHELF • 🥤 REHA IS LOOKING FOR COKE • ⚡ SAMEER IS ONLINE • 🔥 KARTIK JUST GRABBED MAGGI IN ROOM 212 • 🍿 ARJUN ADDED POPCORN TO THE SHELF • 🥤 REHA IS LOOKING FOR COKE • ⚡ SAMEER IS ONLINE •
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 pt-[210px] px-container-padding flex flex-col gap-6 max-w-md mx-auto w-full">
        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4">
          {aggregates.map((agg) => {
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
                  <img
                    src={agg.product.imageUrl}
                    alt={agg.product.name}
                    className="h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
                  />
                </div>

                {/* Info Section */}
                <div className="flex flex-col z-10">
                  <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide">
                    {agg.product.name}
                  </h3>

                  <div className="flex items-center justify-between mt-1">
                    <span
                      className={`text-2xl font-extrabold ${
                        !isAvailable
                          ? 'text-on-surface-variant/50'
                          : agg.badge === 'Last One'
                          ? 'text-error'
                          : 'text-primary-container'
                      }`}
                    >
                      {agg.totalUnits}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {agg.totalUnits === 1 ? 'unit' : 'units'}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant mt-1.5 font-medium">
                    {isAvailable
                      ? `${agg.awakeRoomCount} ${agg.awakeRoomCount === 1 ? 'room has this' : 'rooms have this'}`
                      : '0 rooms active'}
                  </p>

                  {!isAvailable && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (navigator.vibrate) navigator.vibrate(20);
                        alert(`Restock request sent for ${agg.product.name}!`);
                      }}
                      className="mt-3 w-full py-2 bg-transparent border border-primary-container text-primary text-xs font-semibold rounded-full uppercase tracking-wider hover:bg-primary-container/10 active:scale-95 transition-all cursor-pointer"
                    >
                      Request This
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add Slot Placeholder */}
          <div className="rounded-2xl border border-dashed border-[#1F1F1F] flex flex-col items-center justify-center p-4 min-h-[220px] text-center opacity-40 hover:opacity-70 transition-opacity">
            <span className="material-symbols-outlined text-[#1F1F1F] text-4xl mb-1">add_circle</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Restock Shelf
            </span>
          </div>
        </div>
      </main>

      {/* Docked Navigation Bar */}
      <BottomNavBar activeTab="shelf" />
    </div>
  );
};
