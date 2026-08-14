import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { HostelName } from '../types/user';
import { MOCK_WEEKLY_SALES, MOCK_LISTINGS } from '../data/mockCatalog';
import { BottomNavBar } from '../components/BottomNavBar';

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

  // Calculate 14-day hostel change cooldown
  const COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;
  const lastChange = user.lastHostelChangeDate || 0;
  const elapsed = Date.now() - lastChange;
  const isCooldownActive = lastChange > 0 && elapsed < COOLDOWN_MS;
  const daysRemaining = Math.ceil((COOLDOWN_MS - elapsed) / (1000 * 60 * 60 * 24));

  // Mask email helper (e.g. rohit.bt22cse@pec.edu.in -> roh***.bt22cse@pec.edu.in)
  const maskEmail = (email: string): string => {
    if (!email) return 'pec.student@pec.edu.in';
    const atIndex = email.indexOf('@');
    if (atIndex <= 3) return email;
    const prefix = email.substring(0, 3);
    const domain = email.substring(atIndex);
    const rest = email.substring(3, atIndex);
    return `${prefix}***${rest.slice(-6)}${domain}`;
  };

  // Sync user awake status with mock seller listing for user room A304
  const handleToggleAwake = async () => {
    await toggleAwakeStatus();
    const userListing = MOCK_LISTINGS.find((l) => l.sellerRoom === (user.roomNumber || 'A304'));
    if (userListing) {
      userListing.isSellerAwake = !user.isAwake;
    }
  };

  // Sync delivery opt-in
  const handleToggleDelivery = async () => {
    await toggleDeliveryOptIn();
    const userListing = MOCK_LISTINGS.find((l) => l.sellerRoom === (user.roomNumber || 'A304'));
    if (userListing) {
      userListing.deliveryOptIn = !user.deliveryOptIn;
    }
  };

  const handleConfirmHostelChange = () => {
    setIsConfirmModalOpen(false);
    setIsPickerModalOpen(true);
  };

  const handleSaveHostelAndRoom = async () => {
    if (!newRoom.trim()) return;
    await setHostelAndRoom(selectedHostel, newRoom.trim());
    setIsPickerModalOpen(false);
  };

  const handleLogout = async () => {
    await resetUserProfile();
    navigate('/verify');
  };

  // Items sold calculation
  const totalSoldThisWeek = Object.values(MOCK_WEEKLY_SALES).reduce((sum, v) => sum + v, 0);

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

            <button
              type="button"
              disabled={isCooldownActive}
              onClick={() => setIsConfirmModalOpen(true)}
              className={`px-4 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                isCooldownActive
                  ? 'bg-[#1e2020] text-slate-500 border border-[#333535] cursor-not-allowed'
                  : 'bg-primary-container/20 text-primary-container border border-primary-container/40 hover:bg-primary-container/30'
              }`}
            >
              {isCooldownActive ? `Available in ${daysRemaining}d` : 'Change Hostel'}
            </button>
          </div>
        </div>

        {/* DELIVERY PREFERENCE TOGGLE */}
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-3xl p-4 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-extrabold text-white">Delivery Preference</h3>
            <p className="text-xs text-on-surface-variant">
              Offer room delivery to buyers
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleDelivery}
            className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
              user.deliveryOptIn ? 'bg-primary-container' : 'bg-[#2a2c2c]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-md ${
                user.deliveryOptIn ? 'translate-x-5' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>

        {/* STATS SECTION */}
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-3xl p-5 flex flex-col gap-3">
          <h3 className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider">
            Seller Stats
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#181a1a] p-3 rounded-2xl border border-[#2a2c2c] text-center flex flex-col items-center justify-center">
              <span className="text-lg font-extrabold text-primary-container block">
                {totalSoldThisWeek}
              </span>
              <span className="text-[10px] text-on-surface-variant uppercase">Sold This Week</span>
            </div>

            <div className="bg-[#181a1a] p-3 rounded-2xl border border-[#2a2c2c] text-center flex flex-col items-center justify-center">
              <span className="text-lg font-extrabold text-green-400 block">
                98%
              </span>
              <span className="text-[10px] text-on-surface-variant uppercase">Response Rate</span>
            </div>

            <div className="bg-[#181a1a] p-3 rounded-2xl border border-[#2a2c2c] text-center flex flex-col items-center justify-center">
              <span className="text-lg font-extrabold text-amber-300 block">
                {user.reliabilityScore}
              </span>
              <span className="text-[10px] text-on-surface-variant uppercase">Reliability Score</span>
            </div>
          </div>
        </div>

        {/* LOGOUT / RESET ONBOARDING */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-3.5 rounded-full font-bold text-xs uppercase tracking-wider text-red-400 bg-[#241a1a] hover:bg-red-950/40 border border-red-500/30 transition-all cursor-pointer mt-2 text-center"
        >
          Reset Onboarding / Log Out
        </button>
      </main>

      {/* CONFIRMATION DIALOG FOR HOSTEL CHANGE */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121414] border border-primary-container/40 rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl">
            <h2 className="text-lg font-extrabold text-white uppercase">
              Change Hostel?
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Changing hostels updates your local shelf. You can only do this once every <strong className="text-white">14 days</strong>. Confirm?
            </p>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-3 rounded-full font-bold text-xs uppercase tracking-wider text-on-surface-variant bg-[#1e2020]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmHostelChange}
                className="flex-1 py-3 rounded-full font-extrabold text-xs uppercase tracking-wider text-black bg-primary-container neon-glow"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOSTEL & ROOM PICKER MODAL */}
      {isPickerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121414] border border-primary-container/40 rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl">
            <h2 className="text-lg font-extrabold text-white uppercase">
              Select New Hostel & Room
            </h2>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-primary-container uppercase tracking-wider block mb-1">
                  Hostel
                </label>
                <select
                  value={selectedHostel}
                  onChange={(e) => setSelectedHostel(e.target.value as HostelName)}
                  className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-bold rounded-2xl px-4 py-3 text-sm focus:outline-none"
                >
                  {HOSTEL_OPTIONS.map((h) => (
                    <option key={h} value={h} className="bg-[#121414]">
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-primary-container uppercase tracking-wider block mb-1">
                  Room Number (e.g. A304)
                </label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  placeholder="e.g. A304"
                  className="w-full bg-[#1e2020] border-2 border-primary-container/60 text-white font-bold rounded-2xl px-4 py-3 text-sm focus:outline-none uppercase"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsPickerModalOpen(false)}
                className="flex-1 py-3 rounded-full font-bold text-xs uppercase tracking-wider text-on-surface-variant bg-[#1e2020]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveHostelAndRoom}
                className="flex-1 py-3 rounded-full font-extrabold text-xs uppercase tracking-wider text-black bg-primary-container neon-glow"
              >
                Save
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
