import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { subscribeToIncomingRequests, FirestoreRequest } from '../firebase/requests';

interface BottomNavBarProps {
  activeTab?: 'shelf' | 'requests' | 'rank' | 'profile';
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab = 'shelf' }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [incomingRequests, setIncomingRequests] = useState<FirestoreRequest[]>([]);

  useEffect(() => {
    if (!user.uid) return;
    const unsub = subscribeToIncomingRequests(user.uid, (items) => {
      setIncomingRequests(items);
    });
    return () => unsub();
  }, [user.uid]);

  const pendingCount = incomingRequests.filter((r) => r.status === 'pending').length;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-[#121414]/95 backdrop-blur-xl border-t border-[#1F1F1F] shadow-[0_-4px_20px_rgba(255,95,31,0.15)]">
      {/* Shelf */}
      <button
        type="button"
        onClick={() => navigate('/catalog')}
        className={`flex items-center justify-center p-3 rounded-full transition-all duration-200 cursor-pointer ${
          activeTab === 'shelf'
            ? 'bg-primary-container/20 text-primary-container scale-110 shadow-[0_0_15px_rgba(255,95,31,0.4)]'
            : 'text-on-surface-variant hover:text-primary'
        }`}
      >
        <span className="material-symbols-outlined text-2xl">home</span>
      </button>

      {/* Requests */}
      <button
        type="button"
        onClick={() => navigate('/requests')}
        className={`flex items-center justify-center p-3 rounded-full transition-all duration-200 cursor-pointer relative ${
          activeTab === 'requests'
            ? 'bg-primary-container/20 text-primary-container scale-110 shadow-[0_0_15px_rgba(255,95,31,0.4)]'
            : 'text-on-surface-variant hover:text-primary'
        }`}
      >
        <span className="material-symbols-outlined text-2xl">notifications</span>
        {pendingCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-primary-container text-black text-[9px] font-extrabold rounded-full flex items-center justify-center border border-black shadow-sm">
            {pendingCount}
          </span>
        )}
      </button>

      {/* Rank */}
      <button
        type="button"
        onClick={() => navigate('/rank')}
        className={`flex items-center justify-center p-3 rounded-full transition-all duration-200 cursor-pointer ${
          activeTab === 'rank'
            ? 'bg-primary-container/20 text-primary-container scale-110 shadow-[0_0_15px_rgba(255,95,31,0.4)]'
            : 'text-on-surface-variant hover:text-primary'
        }`}
      >
        <span className="material-symbols-outlined text-2xl">trophy</span>
      </button>

      {/* Profile */}
      <button
        type="button"
        onClick={() => navigate('/profile')}
        className={`flex items-center justify-center p-3 rounded-full transition-all duration-200 cursor-pointer ${
          activeTab === 'profile'
            ? 'bg-primary-container/20 text-primary-container scale-110 shadow-[0_0_15px_rgba(255,95,31,0.4)]'
            : 'text-on-surface-variant hover:text-primary'
        }`}
      >
        <span className="material-symbols-outlined text-2xl">person</span>
      </button>
    </nav>
  );
};
