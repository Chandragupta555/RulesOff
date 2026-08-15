import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { HostelName, HOSTEL_BLOCKS } from '../types/user';
import { splitRoomString } from '../data/mockCatalog';

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
  const { setHostelAndRoom, user, loading } = useUser();

  const [selectedHostel, setSelectedHostel] = useState<HostelName | ''>(user.hostel || '');

  // Block & Numeric Room Number State
  const initialBlocks = selectedHostel ? HOSTEL_BLOCKS[selectedHostel] : ['A'];
  const initialSplit = splitRoomString(user.roomNumber || '', initialBlocks);

  const [selectedBlock, setSelectedBlock] = useState<string>(initialSplit.block || initialBlocks[0]);
  const [numericRoom, setNumericRoom] = useState<string>(initialSplit.number || '');
  const [pulseGrid, setPulseGrid] = useState(false);

  if (loading) {
    return (
      <div className="bg-[#050505] min-h-screen w-full flex items-center justify-center text-primary-container">
        <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
      </div>
    );
  }

  // Update available block choices when selectedHostel changes
  useEffect(() => {
    if (selectedHostel) {
      const blocks = HOSTEL_BLOCKS[selectedHostel] || ['Main'];
      if (!blocks.includes(selectedBlock)) {
        setSelectedBlock(blocks[0]);
      }
    }
  }, [selectedHostel]);

  const isValid = Boolean(
    selectedHostel &&
    selectedBlock &&
    numericRoom.trim().length >= 2
  );

  const handleHostelSelect = (name: HostelName) => {
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }
    setSelectedHostel(name);
    const blocks = HOSTEL_BLOCKS[name] || ['Main'];
    setSelectedBlock(blocks[0]);
  };

  const handleEnterShop = async () => {
    if (!isValid) {
      setPulseGrid(true);
      setTimeout(() => setPulseGrid(false), 500);
      return;
    }

    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Combine Block + Room Number (e.g. A + 304 => A304; NB + 304 => NB304)
    const combinedRoom = `${selectedBlock}${numericRoom.trim()}`;

    await setHostelAndRoom(selectedHostel as HostelName, combinedRoom);
    navigate('/catalog');
  };

  const availableBlocks = selectedHostel ? HOSTEL_BLOCKS[selectedHostel] : [];

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

        {/* Structured Block + Room Number Input Section */}
        {selectedHostel && (
          <div className="bg-[#121414] border border-[#1F1F1F] rounded-2xl p-4 flex flex-col gap-3 animate-fade-in">
            <h3 className="text-xs font-bold text-primary-container uppercase tracking-wider">
              {selectedHostel} Hostel Room Details
            </h3>

            <div className="grid grid-cols-5 gap-3">
              {/* Block Selection Dropdown */}
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider pl-1">
                  Block
                </label>
                <select
                  value={selectedBlock}
                  onChange={(e) => setSelectedBlock(e.target.value)}
                  className="w-full bg-[#1e2020] border border-[#333535] text-white font-extrabold rounded-xl px-3 py-3.5 focus:outline-none focus:border-primary-container cursor-pointer text-sm"
                >
                  {availableBlocks.map((b) => (
                    <option key={b} value={b} className="bg-[#121414] text-white font-bold">
                      Block {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Numeric Room Number Input */}
              <div className="col-span-3 flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider pl-1">
                  Room No. (e.g. 304)
                </label>
                <div className="relative w-full rounded-xl border border-[#333535] bg-[#1e2020] focus-within:border-[#ff5f1f] transition-all flex items-center">
                  <span className="absolute left-3 text-xs font-extrabold text-primary-container bg-primary-container/10 border border-primary-container/30 px-1.5 py-0.5 rounded">
                    {selectedBlock}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={numericRoom}
                    onChange={(e) => setNumericRoom(e.target.value.replace(/\D/g, ''))}
                    placeholder="304"
                    className="w-full bg-transparent border-none rounded-xl py-3 pl-14 pr-3 font-mono font-extrabold text-sm text-white placeholder:text-on-surface-variant/40 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-on-surface-variant/70 text-center italic mt-1">
              Will be saved as <strong className="text-white font-mono">{selectedBlock}{numericRoom || '304'}</strong> for proximity sorting.
            </p>
          </div>
        )}
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
