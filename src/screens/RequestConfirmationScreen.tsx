import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MOCK_PRODUCTS, MOCK_LISTINGS } from '../data/mockCatalog';
import { useRequests } from '../context/RequestContext';
import { RequestMethod } from '../types/request';

export const RequestConfirmationScreen: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createRequest } = useRequests();

  const methodParam = (searchParams.get('method') as RequestMethod) || 'pickup';

  // Find listing & product
  const listing = MOCK_LISTINGS.find((l) => l.id === listingId) || MOCK_LISTINGS[0];
  const product = MOCK_PRODUCTS.find((p) => p.id === listing.productId) || MOCK_PRODUCTS[0];

  const [quantity, setQuantity] = useState(1);
  const maxQty = Math.max(1, listing.quantity);

  const deliveryFee = methodParam === 'delivery' ? 5 : 0;
  const itemTotal = listing.price * quantity;
  const grandTotal = itemTotal + deliveryFee;

  const handleSendRequest = () => {
    createRequest({
      listingId: listing.id,
      productId: product.id,
      quantity,
      method: methodParam,
      sellerRoom: listing.sellerRoom,
      sellerName: listing.sellerName,
      price: listing.price,
      deliveryFee,
    });

    if (navigator.vibrate) {
      navigator.vibrate([30, 50, 30]);
    }

    navigate('/requests?tab=outgoing');
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
            src={product.imageUrl}
            alt={product.name}
            className="w-20 h-20 object-cover rounded-xl bg-black border border-[#333535]/50 flex-shrink-0"
          />
          <div className="flex flex-col flex-1 min-w-0">
            <h2 className="text-xl font-extrabold text-on-surface truncate">
              {product.name}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Seller: <span className="font-semibold text-white">{listing.sellerName}</span> (Room {listing.sellerRoom})
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-bold text-primary-container bg-primary-container/10 px-2.5 py-0.5 rounded-full border border-primary-container/30">
                ₹{listing.price} / unit
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
              className="w-9 h-9 rounded-full bg-[#2a2c2c] hover:bg-primary-container hover:text-black font-extrabold text-lg flex items-center justify-center disabled:opacity-30 disabled:hover:bg-[#2a2c2c] disabled:hover:text-white transition-all cursor-pointer"
            >
              -
            </button>
            <span className="w-8 text-center text-lg font-extrabold text-primary-container">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              disabled={quantity >= maxQty}
              className="w-9 h-9 rounded-full bg-[#2a2c2c] hover:bg-primary-container hover:text-black font-extrabold text-lg flex items-center justify-center disabled:opacity-30 disabled:hover:bg-[#2a2c2c] disabled:hover:text-white transition-all cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Fulfillment Method Read-Only */}
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-2xl p-4 flex justify-between items-center">
          <span className="text-sm font-bold text-on-surface">Fulfillment Method</span>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-container bg-primary-container/10 border border-primary-container/30 px-3 py-1 rounded-full">
            {methodParam === 'delivery' ? '🚀 Room Delivery' : '🏃 Self Pickup'}
          </span>
        </div>

        {/* Price Breakdown */}
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-2xl p-4 flex flex-col gap-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant border-b border-[#242424] pb-2">
            Payment Breakdown
          </h3>
          <div className="flex justify-between text-sm text-on-surface-variant">
            <span>Item Total ({quantity}x)</span>
            <span>₹{itemTotal}</span>
          </div>
          {methodParam === 'delivery' && (
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Delivery Fee</span>
              <span>₹{deliveryFee}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-[#242424]">
            <span>Total Payable</span>
            <span className="text-primary-container text-lg">₹{grandTotal}</span>
          </div>
        </div>

        {/* 5-Minute Countdown Note Banner */}
        <div className="bg-[#1e1b18] border border-primary-container/40 rounded-2xl p-4 flex gap-3 items-start">
          <span className="material-symbols-outlined text-primary-container text-2xl mt-0.5">
            timer
          </span>
          <p className="text-xs text-orange-200/90 leading-relaxed">
            <strong className="text-primary-container font-extrabold block mb-0.5">
              5-Minute Response Window
            </strong>
            Seller has 5 minutes to respond to your request. If they don't answer or decline, we'll <strong className="text-white">auto-match</strong> you with the next closest available room!
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-2">
          <button
            type="button"
            onClick={handleSendRequest}
            className="w-full py-4 rounded-full font-extrabold text-sm uppercase tracking-wider text-black bg-primary-container neon-glow active:scale-95 transition-transform cursor-pointer hover:brightness-110 flex items-center justify-center gap-2"
          >
            <span>SEND REQUEST</span>
            <span className="material-symbols-outlined text-lg">send</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full py-2.5 rounded-full font-bold text-xs uppercase tracking-wider text-on-surface-variant hover:text-white transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
        </div>
      </main>
    </div>
  );
};
