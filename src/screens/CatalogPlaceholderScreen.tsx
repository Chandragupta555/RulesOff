import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export const CatalogPlaceholderScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, toggleAwakeStatus, toggleDeliveryOptIn, resetUserProfile } = useUser();

  const handleReset = () => {
    resetUserProfile();
    navigate('/');
  };

  return (
    <div className="bg-[#050505] text-[#e2e2e2] min-h-screen flex flex-col font-sans select-none pb-12">
      {/* Header Bar */}
      <header className="w-full flex justify-between items-center px-6 pt-6 pb-4 border-b border-[#1F1F1F]">
        <span className="text-xl font-extrabold text-primary-container neon-text-glow tracking-widest uppercase">
          RULESOFF
        </span>
        <div className="flex items-center gap-2 bg-[#1A1A1A] border border-[#333535] px-3 py-1 rounded-full text-xs font-semibold text-primary">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
          <span>ONLINE</span>
        </div>
      </header>

      <main className="flex-grow px-container-padding pt-8 max-w-md mx-auto w-full flex flex-col gap-6">
        {/* Banner Card */}
        <div className="bg-[#121414] border border-[#1F1F1F] rounded-2xl p-6 relative overflow-hidden text-center shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 blur-2xl rounded-full pointer-events-none"></div>
          
          <div className="inline-flex p-3 rounded-full bg-primary-container/10 border border-primary-container/20 mb-3 text-primary-container">
            <span className="material-symbols-outlined text-4xl">storefront</span>
          </div>

          <h1 className="text-2xl font-extrabold text-on-surface uppercase tracking-wide">
            CATALOG COMING SOON
          </h1>
          
          <p className="text-xs text-on-surface-variant/70 mt-2 leading-relaxed">
            Your onboarding setup is 100% complete! In Checkpoint 2, this page will host the live late-night snack shelf for your hostel.
          </p>
        </div>

        {/* User Profile Card */}
        <div className="bg-[#121414] border border-[#1F1F1F] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-3">
            <div>
              <p className="text-xs text-on-surface-variant/60 font-semibold uppercase tracking-wider">
                LOCKED PROFILE
              </p>
              <h2 className="text-lg font-bold text-on-surface mt-0.5">{user.name || 'PEC Student'}</h2>
              <p className="text-xs text-primary/90 font-mono">{user.email}</p>
            </div>
            <div className="text-right bg-primary-container/10 border border-primary-container/30 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-bold text-primary block">SCORE</span>
              <span className="text-sm font-extrabold text-white">{user.reliabilityScore}%</span>
            </div>
          </div>

          {/* Location Badge */}
          <div className="flex items-center gap-3 bg-[#1A1A1A] p-3 rounded-xl border border-[#333535]">
            <span className="material-symbols-outlined text-primary text-2xl">roofing</span>
            <div>
              <p className="text-[11px] text-on-surface-variant/60 font-semibold uppercase">HOSTEL & ROOM</p>
              <p className="text-sm font-bold text-on-surface">
                {user.hostel || 'Shivalik'} • Room {user.roomNumber || '---'}
              </p>
            </div>
          </div>

          {/* User Controls */}
          <div className="space-y-3 pt-1">
            {/* Awake Status Toggle */}
            <div className="flex items-center justify-between bg-[#1A1A1A]/60 p-3 rounded-xl border border-[#1F1F1F]">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-400">nights_stay</span>
                <div>
                  <p className="text-xs font-bold text-on-surface">Awake Status</p>
                  <p className="text-[10px] text-on-surface-variant/60">Visible on hostel list</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleAwakeStatus}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  user.isAwake ? 'bg-primary-container' : 'bg-[#333535]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-transform ${
                    user.isAwake ? 'right-1' : 'left-1'
                  }`}
                ></div>
              </button>
            </div>

            {/* Delivery Opt-In Toggle */}
            <div className="flex items-center justify-between bg-[#1A1A1A]/60 p-3 rounded-xl border border-[#1F1F1F]">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                <div>
                  <p className="text-xs font-bold text-on-surface">Delivery Opt-In</p>
                  <p className="text-[10px] text-on-surface-variant/60">Open for room drop-offs</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleDeliveryOptIn}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  user.deliveryOptIn ? 'bg-primary-container' : 'bg-[#333535]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-transform ${
                    user.deliveryOptIn ? 'right-1' : 'left-1'
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        {/* Reset / Test Flow Action */}
        <button
          type="button"
          onClick={handleReset}
          className="w-full bg-[#1A1A1A] hover:bg-[#252525] border border-[#333535] text-on-surface-variant text-xs font-bold py-3.5 rounded-xl uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <span className="material-symbols-outlined text-sm">restart_alt</span>
          <span>RESET ONBOARDING FLOW</span>
        </button>
      </main>
    </div>
  );
};
