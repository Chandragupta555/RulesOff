import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useUser } from '../context/UserContext';
import { MOCK_PRODUCTS } from '../data/mockCatalog';
import { Product } from '../types/catalog';
import { RequestMethod } from '../types/request';
import { createRequestDoc } from '../firebase/requests';
import { FirestoreListing } from '../firebase/listings';
import { HostelName } from '../types/user';
import { subscribeToMasterProducts } from '../firebase/masterCatalog';

export const RequestConfirmationScreen: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: loadingUser } = useUser();

  const methodParam = (searchParams.get('method') as RequestMethod) || 'pickup';

  const [listing, setListing] = useState<FirestoreListing | null>(null);
  const [masterProducts, setMasterProducts] = useState<Product[]>([]);
  const [loadingListing, setLoadingListing] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Subscribe to real-time master catalog products for thumbnail matching
  useEffect(() => {
    const unsub = subscribeToMasterProducts((items) => {
      setMasterProducts(items);
    });
    return () => unsub();
  }, []);

  // Load target listing from Firestore
  useEffect(() => {
    if (!listingId) return;
    setLoadingListing(true);
    const docRef = doc(db, 'listings', listingId);
    getDoc(docRef)
      .then((snap) => {
        if (snap.exists()) {
          setListing({ id: snap.id, ...(snap.data() as Omit<FirestoreListing, 'id'>) });
        } else {
          console.warn('[RequestConfirmation] Listing doc not found:', listingId);
        }
      })
      .catch((err) => console.error('[RequestConfirmation] Failed to load listing:', err))
      .finally(() => setLoadingListing(false));
  }, [listingId]);

  if (loadingListing || loadingUser) {
    return (
      <div className="bg-[#121414] min-h-screen flex items-center justify-center text-primary-container">
        <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
      </div>
    );
  }

  if (!user.hostel || !user.roomNumber) {
    return <Navigate to="/setup" replace />;
  }

  const allProducts = masterProducts.length > 0 ? masterProducts : MOCK_PRODUCTS;
  const matchedProduct = listing?.productId
    ? allProducts.find((p) => p.id === listing.productId)
    : null;

  const rawName = listing?.unverifiedProductName || listing?.productName || 'Product';
  const displayProductName = `${rawName}${listing?.variantSize ? ` (${listing.variantSize})` : ''}`;
  const displayImageUrl =
    matchedProduct?.imageUrl ||
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';

  const maxQty = Math.max(1, listing?.quantity || 1);
  const unitPrice = listing?.price || 0;
  const deliveryFee = methodParam === 'delivery' ? (listing?.deliveryFee ?? 5) : 0;
  const itemTotal = unitPrice * quantity;
  const grandTotal = itemTotal + deliveryFee;

  const handleSendRequest = async () => {
    if (!listing || !user.uid) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await createRequestDoc({
        buyerUid: user.uid,
        buyerName: user.name || 'PEC Student',
        buyerRoom: user.roomNumber || '',
        buyerHostel: (user.hostel as HostelName) || 'Shivalik',
        sellerUid: listing.sellerUid,
        sellerName: listing.sellerName,
        sellerRoom: listing.sellerRoom,
        sellerHostel: listing.hostel,
        listingId: listing.id || listingId || '',
        productId: listing.productId,
        productName: listing.unverifiedProductName || listing.productName,
        quantity,
        method: methodParam,
        price: listing.price,
        deliveryFee,
      });

      if (navigator.vibrate) {
        navigator.vibrate([30, 50, 30]);
      }

      navigate('/requests?tab=outgoing');
    } catch (err: any) {
      console.error('[RequestConfirmation] Error creating request:', err);
      setErrorMsg(err.message || 'Failed to send request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans min-h-screen w-full flex flex-col select-none bg-[#121414] text-[#e2e2e2] pb-12">
      {/* App Bar Header */}
      <header className="sticky top-0 z-40 bg-[#121414]/90 backdrop-blur-xl border-b border-[#333535]/30 flex justify-between items-center w-full px-4 h-16">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-on-surface-variant hover:opacity-80 active:scale-95 transition-transform w-10 h-10 rounded-full bg-[#1e2020] flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>

        <h1 className="text-lg font-extrabold text-on-surface tracking-tight uppercase">
          Confirm Request
        </h1>

        <div className="w-10"></div>
      </header>

      {/* Main Canvas */}
      <main className="w-full px-4 pt-4 flex flex-col gap-5 max-w-md mx-auto flex-1">
        {/* Product & Seller Summary Card */}
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-2xl p-4 flex gap-4 items-center relative overflow-hidden">
          <img
            src={displayImageUrl}
            alt={displayProductName}
            className="w-20 h-20 object-cover rounded-xl bg-black border border-[#333535]/50 flex-shrink-0"
          />
          <div className="flex flex-col flex-1 min-w-0">
            <h2 className="text-xl font-extrabold text-on-surface truncate">
              {displayProductName}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Seller: <span className="font-semibold text-white">{listing?.sellerName || 'PEC Student'}</span> (Room {listing?.sellerRoom})
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-bold text-primary-container bg-primary-container/10 px-2.5 py-0.5 rounded-full border border-primary-container/30">
                ₹{unitPrice} / unit
              </span>
              <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                Awake
              </span>
            </div>
          </div>
        </div>

        {/* Quantity Stepper */}
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-2xl p-4 flex justify-between items-center">
          <div>
            <span className="text-sm font-bold text-on-surface block">Quantity</span>
            <span className="text-xs text-on-surface-variant">
              Max available: {maxQty} {maxQty === 1 ? 'unit' : 'units'}
            </span>
          </div>

          <div className="flex items-center gap-3 bg-[#1e2020] rounded-full p-1 border border-[#333535]">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-full bg-[#121212] text-on-surface flex items-center justify-center font-bold disabled:opacity-30 cursor-pointer"
            >
              -
            </button>
            <span className="text-sm font-extrabold text-primary-container min-w-[20px] text-center font-mono">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              disabled={quantity >= maxQty}
              className="w-8 h-8 rounded-full bg-[#121212] text-on-surface flex items-center justify-center font-bold disabled:opacity-30 cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Fulfillment Method Card */}
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined">
              {methodParam === 'delivery' ? 'local_shipping' : 'directions_walk'}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-extrabold text-on-surface uppercase">
              {methodParam === 'delivery' ? 'Room Delivery' : 'Self Pickup'}
            </h3>
            <p className="text-xs text-on-surface-variant">
              {methodParam === 'delivery'
                ? `Seller will deliver to your room (+₹${deliveryFee})`
                : `Walk to Room ${listing?.sellerRoom} to collect`}
            </p>
          </div>
        </div>

        {/* Order Bill Breakdown */}
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-2xl p-4 flex flex-col gap-2.5">
          <h3 className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider mb-1">
            Price Breakdown
          </h3>

          <div className="flex justify-between text-xs text-on-surface">
            <span>
              {displayProductName} x {quantity}
            </span>
            <span className="font-mono font-semibold">₹{itemTotal}</span>
          </div>

          {methodParam === 'delivery' && (
            <div className="flex justify-between text-xs text-on-surface">
              <span>Delivery Fee</span>
              <span className="font-mono font-semibold">₹{deliveryFee}</span>
            </div>
          )}

          <div className="pt-2 border-t border-[#1F1F1F] flex justify-between items-baseline mt-1">
            <span className="text-sm font-extrabold text-on-surface">Total Amount</span>
            <span className="text-lg font-extrabold text-primary-container font-mono drop-shadow-[0_0_8px_rgba(255,95,31,0.4)]">
              ₹{grandTotal}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <p className="text-error text-xs font-semibold text-center bg-error-container/20 py-2.5 px-4 rounded-xl border border-error/30">
            {errorMsg}
          </p>
        )}

        {/* Primary Submit Button */}
        <button
          type="button"
          onClick={handleSendRequest}
          disabled={isSubmitting}
          className="w-full bg-primary-container text-black font-extrabold text-sm uppercase tracking-widest py-4 rounded-full neon-glow hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined animate-spin text-black">refresh</span>
              <span>SENDING REQUEST...</span>
            </>
          ) : (
            <>
              <span>SEND REQUEST TO ROOM {listing?.sellerRoom}</span>
              <span className="material-symbols-outlined text-base font-bold">send</span>
            </>
          )}
        </button>
      </main>
    </div>
  );
};
