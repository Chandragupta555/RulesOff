import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useRequests } from '../context/RequestContext';
import { MOCK_PRODUCTS } from '../data/mockCatalog';
import { BottomNavBar } from '../components/BottomNavBar';
import { RequestItem } from '../types/request';

export const RequestsScreen: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'incoming' | 'outgoing') || 'incoming';
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>(initialTab);

  const { user } = useUser();
  const { requests, acceptRequest, declineRequest, fulfillRequest, fastForwardTimeout } = useRequests();

  const userRoom = user.roomNumber || 'A304';

  // Live timer tick every second for countdown UI
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTabChange = (tab: 'incoming' | 'outgoing') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Filter requests
  const incomingRequests = requests.filter((r) => r.sellerRoom === userRoom);
  const outgoingRequests = requests.filter((r) => r.buyerRoom === userRoom);

  const activeIncomingCount = incomingRequests.filter((r) => r.status === 'pending').length;

  const formatCountdown = (deadline: number) => {
    const diff = Math.max(0, Math.floor((deadline - now) / 1000));
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="font-sans min-h-screen w-full flex flex-col select-none bg-[#121414] text-[#e2e2e2] pb-28">
      {/* App Bar Header */}
      <header className="sticky top-0 z-40 bg-[#121414]/90 backdrop-blur-xl border-b border-[#333535]/30 flex flex-col justify-center w-full px-4 pt-3 pb-2">
        <div className="flex justify-between items-center w-full mb-3">
          <h1 className="text-xl font-extrabold text-primary-container tracking-tight italic uppercase drop-shadow-[0_0_8px_rgba(255,95,31,0.4)]">
            Requests
          </h1>
          <span className="text-xs font-semibold text-on-surface-variant bg-[#1e2020] px-3 py-1 rounded-full border border-[#333535]">
            Room {userRoom}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#1e2020] rounded-full p-1 border border-[#333535]/40">
          <button
            type="button"
            onClick={() => handleTabChange('incoming')}
            className={`flex-1 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'incoming'
                ? 'bg-primary-container text-black neon-glow shadow-md'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span>Incoming</span>
            {activeIncomingCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                activeTab === 'incoming' ? 'bg-black text-primary-container' : 'bg-primary-container text-black'
              }`}>
                {activeIncomingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('outgoing')}
            className={`flex-1 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer ${
              activeTab === 'outgoing'
                ? 'bg-primary-container text-black neon-glow shadow-md'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Outgoing
          </button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="w-full px-4 pt-4 flex flex-col gap-4 max-w-md mx-auto flex-1">
        {/* INCOMING TAB CONTENT */}
        {activeTab === 'incoming' && (
          <div className="flex flex-col gap-3">
            {incomingRequests.length > 0 ? (
              incomingRequests.map((req) => {
                const product = MOCK_PRODUCTS.find((p) => p.id === req.productId) || MOCK_PRODUCTS[0];
                const isPending = req.status === 'pending';
                const isAccepted = req.status === 'accepted';
                const isFulfilled = req.status === 'fulfilled';

                return (
                  <div
                    key={req.id}
                    className="bg-[#121212] border border-[#1F1F1F] hover:border-primary-container/40 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden transition-all duration-200"
                  >
                    {/* Buyer Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-extrabold text-on-surface">
                            {req.buyerName}
                          </h2>
                          <span className="text-xs font-semibold text-primary-container bg-primary-container/10 px-2 py-0.5 rounded-full border border-primary-container/30">
                            Room {req.buyerRoom}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {req.method === 'delivery' ? '🚀 Delivery requested' : '🏃 Pickup requested'}
                        </p>
                      </div>

                      {/* Live Timer if pending */}
                      {isPending && (
                        <div className="text-right flex flex-col items-end">
                          <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                            <span className="material-symbols-outlined text-xs">timer</span>
                            {formatCountdown(req.responseDeadline)}
                          </span>
                          <span className="text-[10px] text-on-surface-variant mt-1">Remaining</span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex gap-3 items-center bg-[#181a1a] p-3 rounded-xl border border-[#2a2c2c]">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg bg-black border border-[#333535]"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">
                          {product.name}
                        </h3>
                        <span className="text-xs text-on-surface-variant">
                          Qty: <strong className="text-white">{req.quantity}</strong> • Total: <strong className="text-primary-container">₹{req.totalPrice}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons for Pending */}
                    {isPending && (
                      <div className="flex gap-2.5 mt-1">
                        <button
                          type="button"
                          onClick={() => acceptRequest(req.id)}
                          className="flex-1 py-3 rounded-full font-extrabold text-xs uppercase tracking-wider text-black bg-green-500 hover:bg-green-400 active:scale-95 transition-all cursor-pointer shadow-md shadow-green-500/20"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => declineRequest(req.id)}
                          className="flex-1 py-3 rounded-full font-extrabold text-xs uppercase tracking-wider text-red-400 bg-[#241a1a] hover:bg-red-950/60 border border-red-500/40 active:scale-95 transition-all cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {/* Accepted State -> Mark as Fulfilled */}
                    {isAccepted && (
                      <div className="flex flex-col gap-2 mt-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/30">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          <span>Accepted — Waiting for {req.method === 'delivery' ? 'Delivery' : 'Pickup'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => fulfillRequest(req.id)}
                          className="w-full py-3 rounded-full font-extrabold text-xs uppercase tracking-wider text-black bg-primary-container neon-glow active:scale-95 transition-all cursor-pointer"
                        >
                          Mark as Fulfilled
                        </button>
                      </div>
                    )}

                    {/* Fulfilled State */}
                    {isFulfilled && (
                      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-green-400 bg-green-500/10 py-2 rounded-full border border-green-500/20">
                        <span className="material-symbols-outlined text-sm">verified</span>
                        <span>Fulfilled & Inventory Decremented</span>
                      </div>
                    )}

                    {/* Rerouted / Declined State */}
                    {req.status === 'auto-rerouted' && (
                      <div className="text-xs text-on-surface-variant bg-[#1a1c1c] p-2.5 rounded-xl border border-[#2a2c2c] italic">
                        Decline/Timeout: Request auto-rerouted to another seller.
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-14 px-6 bg-[#121212] rounded-2xl border border-[#1F1F1F] mt-4">
                <span className="text-5xl mb-3">📥</span>
                <h3 className="text-base font-bold text-on-surface mb-1">No Incoming Requests</h3>
                <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
                  When other hostel students request items from your room, they'll appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* OUTGOING TAB CONTENT */}
        {activeTab === 'outgoing' && (
          <div className="flex flex-col gap-3">
            {outgoingRequests.length > 0 ? (
              outgoingRequests.map((req) => {
                const product = MOCK_PRODUCTS.find((p) => p.id === req.productId) || MOCK_PRODUCTS[0];
                const isPending = req.status === 'pending';
                const isAccepted = req.status === 'accepted';
                const isRerouted = req.status === 'auto-rerouted';
                const isExhausted = req.isExhausted;
                const isFulfilled = req.status === 'fulfilled';

                return (
                  <div
                    key={req.id}
                    className="bg-[#121212] border border-[#1F1F1F] hover:border-primary-container/40 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden transition-all duration-200"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-base font-extrabold text-on-surface">
                          Room {req.sellerRoom} ({req.sellerName})
                        </h2>
                        <span className="text-xs text-on-surface-variant">
                          {req.method === 'delivery' ? '🚀 Delivery' : '🏃 Pickup'}
                        </span>
                      </div>

                      {/* Status Badges */}
                      <div>
                        {isPending && (
                          <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                            <span className="material-symbols-outlined text-xs">timer</span>
                            {formatCountdown(req.responseDeadline)}
                          </span>
                        )}
                        {isAccepted && (
                          <span className="text-xs font-bold text-green-400 bg-green-500/15 border border-green-500/30 px-2.5 py-1 rounded-full">
                            Accepted!
                          </span>
                        )}
                        {isFulfilled && (
                          <span className="text-xs font-bold text-green-400 bg-green-500/15 border border-green-500/30 px-2.5 py-1 rounded-full">
                            Completed ✓
                          </span>
                        )}
                        {isExhausted && (
                          <span className="text-xs font-bold text-red-400 bg-red-500/15 border border-red-500/30 px-2.5 py-1 rounded-full">
                            Exhausted
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Summary */}
                    <div className="flex gap-3 items-center bg-[#181a1a] p-3 rounded-xl border border-[#2a2c2c]">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg bg-black border border-[#333535]"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">
                          {product.name}
                        </h3>
                        <span className="text-xs text-on-surface-variant">
                          Qty: <strong className="text-white">{req.quantity}</strong> • Total: <strong className="text-primary-container">₹{req.totalPrice}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Detailed Live Status Message Banner */}
                    <div className="mt-0.5">
                      {isPending && (
                        <div className="bg-[#1e1b18] border border-orange-500/30 rounded-xl p-3 flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-orange-300">
                            <span className="material-symbols-outlined text-base text-primary-container animate-pulse">
                              hourglass_empty
                            </span>
                            <span>Waiting for response from Room {req.sellerRoom}...</span>
                          </div>
                          <p className="text-[11px] text-on-surface-variant">
                            If they don't respond in {formatCountdown(req.responseDeadline)}, we'll auto-match you with the next room!
                          </p>
                          {/* Fast-forward test button for reviewer */}
                          <button
                            type="button"
                            onClick={() => fastForwardTimeout(req.id)}
                            className="mt-1 py-1.5 px-3 rounded-lg bg-[#2b241c] hover:bg-orange-500/20 text-primary-container border border-primary-container/40 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer self-start flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">fast_forward</span>
                            <span>Simulate 5m Timeout / Reroute</span>
                          </button>
                        </div>
                      )}

                      {isAccepted && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-start gap-2">
                          <span className="material-symbols-outlined text-green-400 text-lg">check_circle</span>
                          <p className="text-xs text-green-200">
                            <strong className="font-extrabold text-green-400 block">Request Accepted!</strong>
                            {req.method === 'delivery'
                              ? `Seller ${req.sellerName} is on their way to deliver to your Room ${req.buyerRoom}!`
                              : `Head to Room ${req.sellerRoom} to pick up your item.`}
                          </p>
                        </div>
                      )}

                      {isRerouted && (
                        <div className="bg-[#1e1a22] border border-purple-500/30 rounded-xl p-3 flex items-start gap-2">
                          <span className="material-symbols-outlined text-purple-400 text-lg">alt_route</span>
                          <p className="text-xs text-purple-200">
                            <strong className="font-extrabold text-purple-300 block">Auto-Rerouted</strong>
                            Room {req.sellerRoom} didn't answer in time. Automatically redirected your request to the next closest seller!
                          </p>
                        </div>
                      )}

                      {isExhausted && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2">
                          <span className="material-symbols-outlined text-red-400 text-lg">error_outline</span>
                          <p className="text-xs text-red-200">
                            <strong className="font-extrabold text-red-400 block">No one else has this right now</strong>
                            All available awake sellers for {product.name} in your hostel have been attempted.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-14 px-6 bg-[#121212] rounded-2xl border border-[#1F1F1F] mt-4">
                <span className="text-5xl mb-3">📤</span>
                <h3 className="text-base font-bold text-on-surface mb-1">No Outgoing Requests</h3>
                <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed mb-4">
                  Tap "Request" on any item in the Catalog or Room List to send a request!
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Docked Bottom Nav Bar */}
      <BottomNavBar activeTab="requests" />
    </div>
  );
};
