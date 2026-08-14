import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequests } from '../context/RequestContext';
import { useUser } from '../context/UserContext';

interface BottomNavBarProps {
  activeTab?: 'shelf' | 'requests' | 'rank' | 'profile';
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab = 'shelf' }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { requests } = useRequests();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const userRoom = user.roomNumber || 'A304';
  const pendingCount = requests.filter((r) => r.sellerRoom === userRoom && r.status === 'pending').length;

  const handleTabClick = (tabName: 'shelf' | 'requests' | 'rank' | 'profile') => {
    if (tabName === 'shelf') {
      navigate('/catalog');
      return;
    }
    if (tabName === 'requests') {
      navigate('/requests');
      return;
    }
    setToastMessage(`${tabName} screen coming in Checkpoint 4!`);
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] text-primary border border-primary-container/40 px-4 py-2 rounded-full text-xs font-semibold shadow-xl animate-fade-in flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Docked Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#121414]/90 backdrop-blur-xl border-t border-[#1F1F1F] shadow-[0_-4px_20px_rgba(255,95,31,0.15)]">
        {/* Shelf (Home / Inventory) */}
        <button
          onClick={() => handleTabClick('shelf')}
          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeTab === 'shelf'
              ? 'bg-primary-container/20 text-primary-container scale-105 shadow-[0_0_12px_rgba(255,95,31,0.3)]'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">home</span>
          <span className="text-[10px] font-bold mt-0.5 uppercase tracking-wider">Shelf</span>
        </button>

        {/* Requests */}
        <button
          onClick={() => handleTabClick('requests')}
          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all duration-200 cursor-pointer relative ${
            activeTab === 'requests'
              ? 'bg-primary-container/20 text-primary-container scale-105 shadow-[0_0_12px_rgba(255,95,31,0.3)]'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">notifications</span>
          {pendingCount > 0 && (
            <span className="absolute top-1.5 right-2 w-4 h-4 bg-primary-container text-black text-[9px] font-extrabold rounded-full flex items-center justify-center border border-black shadow-sm">
              {pendingCount}
            </span>
          )}
          <span className="text-[10px] font-bold mt-0.5 uppercase tracking-wider">Requests</span>
        </button>

        {/* Rank / Leaderboard */}
        <button
          onClick={() => handleTabClick('rank')}
          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeTab === 'rank'
              ? 'bg-primary-container/20 text-primary-container scale-105 shadow-[0_0_12px_rgba(255,95,31,0.3)]'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">emoji_events</span>
          <span className="text-[10px] font-bold mt-0.5 uppercase tracking-wider">Rank</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-primary-container/20 text-primary-container scale-105 shadow-[0_0_12px_rgba(255,95,31,0.3)]'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">person</span>
          <span className="text-[10px] font-bold mt-0.5 uppercase tracking-wider">Profile</span>
        </button>
      </nav>
    </>
  );
};
