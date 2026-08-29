import React, { useState, useEffect } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { MOCK_PRODUCTS } from '../data/mockCatalog';
import { Product } from '../types/catalog';
import { BottomNavBar } from '../components/BottomNavBar';
import {
  FirestoreRequest,
  subscribeToIncomingRequests,
  subscribeToOutgoingRequests,
  acceptRequestDoc,
  declineRequestDoc,
  cancelRequestDoc,
  fulfillRequestDoc
} from '../firebase/requests';
import { subscribeToMasterProducts } from '../firebase/masterCatalog';

export const RequestsScreen: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'incoming' | 'outgoing') || 'incoming';
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>(initialTab);

  const { user, loading } = useUser();

  const [incomingRequests, setIncomingRequests] = useState<FirestoreRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FirestoreRequest[]>([]);
  const [masterProducts, setMasterProducts] = useState<Product[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  // Subscribe to real-time master catalog items for thumbnail resolution
  useEffect(() => {
    const unsub = subscribeToMasterProducts((items) => {
      setMasterProducts(items);
    });
    return () => unsub();
  }, []);

  // Subscribe to real-time Firestore requests for authenticated user UID
  useEffect(() => {
    if (!user.uid) return;

    const unsubIncoming = subscribeToIncomingRequests(user.uid, (items) => {
      setIncomingRequests(items);
    });

    const unsubOutgoing = subscribeToOutgoingRequests(user.uid, (items) => {
      setOutgoingRequests(items);
    });

    return () => {
      unsubIncoming();
      unsubOutgoing();
    };
  }, [user.uid]);

  if (loading) {
    return (
      <div className="bg-[#050505] min-h-screen w-full flex items-center justify-center text-primary-container">
        <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
      </div>
    );
  }

  if (!user.hostel || !user.roomNumber) {
    return <Navigate to="/setup" replace />;
  }

  const userRoom = user.roomNumber;
  const allProducts = masterProducts.length > 0 ? masterProducts : MOCK_PRODUCTS;

  const handleTabChange = (tab: 'incoming' | 'outgoing') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const activeIncomingCount = incomingRequests.filter((r) => r.status === 'pending').length;

  const handleAccept = async (requestId: string) => {
    setActionLoadingId(requestId);
    setActionError('');
    try {
      await acceptRequestDoc(requestId);
      if (navigator.vibrate) navigator.vibrate(30);
    } catch (err: any) {
      console.error('[RequestsScreen] Accept error:', err);
      setActionError('Failed to accept request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    setActionLoadingId(requestId);
    setActionError('');
    try {
      await declineRequestDoc(requestId);
      if (navigator.vibrate) navigator.vibrate(30);
    } catch (err: any) {
      console.error('[RequestsScreen] Decline error:', err);
      setActionError('Failed to decline request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (requestId: string) => {
    setActionLoadingId(requestId);
    setActionError('');
    try {
      await cancelRequestDoc(requestId);
      if (navigator.vibrate) navigator.vibrate(30);
    } catch (err: any) {
      console.error('[RequestsScreen] Cancel error:', err);
      setActionError('Failed to cancel request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleFulfill = async (requestId: string) => {
    setActionLoadingId(requestId);
    setActionError('');
    try {
      await fulfillRequestDoc(requestId);
      if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
    } catch (err: any) {
      console.error('[RequestsScreen] Fulfill error:', err);
      setActionError(err.message || 'Failed to mark as fulfilled.');
    } finally {
      setActionLoadingId(null);
    }
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
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeTab === 'incoming'
                    ? 'bg-black text-primary-container'
                    : 'bg-primary-container text-black'
                }`}
              >
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
        {actionError && (
          <div className="text-error text-xs font-semibold text-center bg-error-container/20 py-2.5 px-4 rounded-xl border border-error/30">
            {actionError}
          </div>
        )}

        {/* INCOMING TAB CONTENT */}
        {activeTab === 'incoming' && (
          <div className="flex flex-col gap-3">
            {incomingRequests.length > 0 ? (
              incomingRequests.map((req) => {
                const matchedProduct = allProducts.find((p) => p.id === req.productId);
                const imageUrl =
                  matchedProduct?.imageUrl ||
                  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
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
                            Room {req.buyerRoom}
                          </h2>
                          <span className="text-xs text-on-surface-variant font-medium">
                            ({req.buyerName})
                          </span>
                        </div>
                        <span className="text-[11px] text-primary-container font-semibold">
                          {req.method === 'delivery' ? '🚚 Room Delivery Requested' : '🚶 Self Pickup'}
                        </span>
                      </div>

                      {/* Status Tag */}
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                          isPending
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
                            : isAccepted
                            ? 'bg-green-500/10 text-green-400 border-green-500/30'
                            : isFulfilled
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    {/* Product & Total */}
                    <div className="bg-[#181a1a] border border-[#2a2c2c] rounded-xl p-3 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <img
                          src={imageUrl}
                          alt={req.productName}
                          className="w-10 h-10 object-contain rounded-lg bg-black/40 p-1"
                        />
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {req.quantity}x {req.productName}
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-mono">
                            ₹{req.price} / unit
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-primary-container font-mono block">
                          ₹{req.price * req.quantity + (req.deliveryFee || 0)}
                        </span>
                        <span className="text-[9px] text-on-surface-variant uppercase font-semibold">
                          Total
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons for Seller */}
                    {isPending && req.id && (
                      <div className="flex gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => handleDecline(req.id!)}
                          disabled={actionLoadingId === req.id}
                          className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 font-extrabold text-xs py-2.5 rounded-xl uppercase tracking-wider hover:bg-red-500/20 active:scale-95 transition-all cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAccept(req.id!)}
                          disabled={actionLoadingId === req.id}
                          className="flex-1 bg-green-500 text-black font-extrabold text-xs py-2.5 rounded-xl uppercase tracking-wider neon-glow hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                        >
                          {actionLoadingId === req.id ? 'Saving...' : 'Accept Request'}
                        </button>
                      </div>
                    )}

                    {isAccepted && req.id && (
                      <button
                        type="button"
                        onClick={() => handleFulfill(req.id!)}
                        disabled={actionLoadingId === req.id}
                        className="w-full bg-primary-container text-black font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider neon-glow hover:brightness-110 active:scale-95 transition-all cursor-pointer mt-1"
                      >
                        {actionLoadingId === req.id ? 'Processing...' : '✔ Mark as Fulfilled'}
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-[#121212] border border-[#1F1F1F] rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">
                  inbox
                </span>
                <p className="text-xs font-semibold text-on-surface-variant">
                  No incoming requests right now.
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
                const matchedProduct = allProducts.find((p) => p.id === req.productId);
                const imageUrl =
                  matchedProduct?.imageUrl ||
                  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
                const isPending = req.status === 'pending';
                const isAccepted = req.status === 'accepted';
                const isFulfilled = req.status === 'fulfilled';

                return (
                  <div
                    key={req.id}
                    className="bg-[#121212] border border-[#1F1F1F] hover:border-primary-container/40 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden transition-all duration-200"
                  >
                    {/* Seller Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-extrabold text-on-surface">
                            Request to Room {req.sellerRoom}
                          </h2>
                          <span className="text-xs text-on-surface-variant font-medium">
                            ({req.sellerName})
                          </span>
                        </div>
                        <span className="text-[11px] text-primary-container font-semibold">
                          {req.method === 'delivery' ? '🚚 Room Delivery' : '🚶 Self Pickup'}
                        </span>
                      </div>

                      {/* Status Tag */}
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                          isPending
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
                            : isAccepted
                            ? 'bg-green-500/10 text-green-400 border-green-500/30'
                            : isFulfilled
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}
                      >
                        {isPending
                          ? 'Waiting for response'
                          : isAccepted
                          ? `Accepted! Head to Room ${req.sellerRoom}`
                          : req.status}
                      </span>
                    </div>

                    {/* Product & Total */}
                    <div className="bg-[#181a1a] border border-[#2a2c2c] rounded-xl p-3 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <img
                          src={imageUrl}
                          alt={req.productName}
                          className="w-10 h-10 object-contain rounded-lg bg-black/40 p-1"
                        />
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {req.quantity}x {req.productName}
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-mono">
                            ₹{req.price} / unit
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-primary-container font-mono block">
                          ₹{req.price * req.quantity + (req.deliveryFee || 0)}
                        </span>
                        <span className="text-[9px] text-on-surface-variant uppercase font-semibold">
                          Total
                        </span>
                      </div>
                    </div>

                    {/* Cancel Button for Buyer */}
                    {isPending && req.id && (
                      <button
                        type="button"
                        onClick={() => handleCancel(req.id!)}
                        disabled={actionLoadingId === req.id}
                        className="w-full bg-red-500/10 border border-red-500/30 text-red-400 font-extrabold text-xs py-2.5 rounded-xl uppercase tracking-wider hover:bg-red-500/20 active:scale-95 transition-all cursor-pointer mt-1"
                      >
                        {actionLoadingId === req.id ? 'Cancelling...' : 'Cancel Request'}
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-[#121212] border border-[#1F1F1F] rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">
                  send
                </span>
                <p className="text-xs font-semibold text-on-surface-variant">
                  You haven't sent any requests yet.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
};
