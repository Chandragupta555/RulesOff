import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { HostelName } from '../types/user';

interface HostelOption {
  name: HostelName;
  type: 'Boys' | 'Girls';
  icon: string;
}

const HOSTELS: HostelOption[] = [
  { name: 'Shivalik', type: 'Boys', icon: 'location_city' },
  { name: 'Aravali', type: 'Boys', icon: 'forest' },
  { name: 'Kurukshetra', type: 'Boys', icon: 'flag' },
  { name: 'Himalaya', type: 'Boys', icon: 'landscape' },
  { name: 'Kalpana Chawala', type: 'Girls', icon: 'rocket_launch' },
  { name: 'Vindhya', type: 'Girls', icon: 'water' },
];

export const HostelSetupScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setHostelAndRoom, user } = useUser();

  const [selectedHostel, setSelectedHostel] = useState<HostelName | ''>(user.hostel || '');
  const [roomNumber, setRoomNumber] = useState<string>(user.roomNumber || '');
  const [pulseGrid, setPulseGrid] = useState(false);

  const isValid = Boolean(selectedHostel && roomNumber.trim().length > 0);

  const handleHostelSelect = (name: HostelName) => {
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }
    setSelectedHostel(name);
  };

  const handleEnterShop = () => {
    if (!isValid) {
      setPulseGrid(true);
      setTimeout(() => setPulseGrid(false), 500);
      return;
    }

    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    setHostelAndRoom(selectedHostel as HostelName, roomNumber);
    navigate('/catalog');
  };

  return (
    <div className="bg-[#050505] text-[#e2e2e2] min-h-screen flex flex-col font-sans selection:bg-primary-container selection:text-black pb-28 select-none">
      {/* Top App Bar Header */}
      <header className="w-full flex justify-center items-center h-16 pt-6 pb-2">
        <span className="text-xl font-extrabold text-primary-container neon-text-glow tracking-widest uppercase">
          RULESOFF
        </span>
      </header>

      <main className="flex-grow px-container-padding pt-6 max-w-md mx-auto w-full flex flex-col gap-6">
        {/* Header Title & Subtitle */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface uppercase tracking-tight">
            WHERE DO YOU STAY?
          </h1>
          <p className="text-sm text-on-surface-variant/80">
            Select your hostel to view the local midnight menu.
          </p>
        </div>

        {/* 6 Hostel Grid */}
        <div className={`grid grid-cols-2 gap-3.5 transition-all ${pulseGrid ? 'animate-pulse scale-98' : ''}`}>
          {HOSTELS.map((hostel) => {
            const isSelected = selectedHostel === hostel.name;
            return (
              <button
                key={hostel.name}
                type="button"
                onClick={() => handleHostelSelect(hostel.name)}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2.5 transition-all duration-200 text-center relative overflow-hidden group min-h-[115px] cursor-pointer ${
                  isSelected
                    ? 'border-[#ff5f1f] bg-[#ff5f1f]/10 shadow-[0_0_18px_rgba(255,95,31,0.25)] scale-[1.02]'
                    : 'bg-[#121414] border-[#1F1F1F] hover:border-[#333535] active:scale-95'
                }`}
              >
                {/* Gender Tag Badge */}
                <div
                  className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider z-10 ${
                    isSelected
                      ? 'bg-primary-container text-black'
                      : 'bg-primary-container/10 text-primary-container'
                  }`}
                >
                  {hostel.type}
                </div>

                <span
                  className={`material-symbols-outlined text-3xl transition-colors z-10 ${
                    isSelected ? 'text-[#ff5f1f]' : 'text-on-surface-variant group-hover:text-primary'
                  }`}
                >
                  {hostel.icon}
                </span>

                <span
                  className={`font-semibold text-sm leading-tight z-10 ${
                    isSelected ? 'text-[#ff5f1f]' : 'text-on-surface'
                  }`}
                >
                  {hostel.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Room Input Section */}
        <div className="flex flex-col gap-2 mt-4">
          <label htmlFor="room-number" className="text-xs font-bold text-on-surface uppercase tracking-wider pl-1">
            ROOM NUMBER
          </label>
          <div className="relative w-full rounded-2xl border border-[#333535] bg-[#1A1A1A]/60 focus-within:border-[#ff5f1f] focus-within:shadow-[inset_0_0_8px_rgba(255,95,31,0.2)] transition-all">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/70">
              door_front
            </span>
            <input
              id="room-number"
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. 402"
              className="w-full bg-transparent border-none rounded-2xl py-4 pl-12 pr-4 font-sans text-base text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none"
            />
          </div>
          <p className="text-xs text-on-surface-variant/70 text-center mt-2 px-2 leading-relaxed">
            This locks your local shelf — you can change it later from Settings if you switch hostels.
          </p>
        </div>
      </main>

      {/* Fixed Bottom Action Button */}
      <div className="fixed bottom-0 left-0 w-full p-container-padding bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pt-8 z-40 flex justify-center pb-8">
        <button
          type="button"
          onClick={handleEnterShop}
          disabled={!isValid}
          className={`w-full max-w-md font-sans text-sm font-extrabold uppercase tracking-wider rounded-xl py-4 px-6 transition-all duration-200 flex items-center justify-center gap-2 ${
            isValid
              ? 'bg-primary-container text-black shadow-[0_4px_20px_rgba(255,95,31,0.35)] hover:shadow-[0_4px_25px_rgba(255,95,31,0.5)] active:scale-95 cursor-pointer'
              : 'bg-[#1e2020] text-on-surface-variant/40 opacity-50 cursor-not-allowed border border-[#333535]'
          }`}
        >
          <span>ENTER THE SHOP</span>
          <span className="material-symbols-outlined font-bold">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
